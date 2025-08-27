import { useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MarkerType,
  Position,
  Handle,
  NodeProps,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Deployment } from '@/types/deployment';
import { Pipeline } from '@/types/pipeline';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Custom Node Components
function DeploymentNode({ data }: NodeProps) {
  return (
    <Card className="min-w-[200px]">
      <Handle type="source" position={Position.Bottom} />
      <div className="p-4">
        <h3 className="font-bold">{data.label}</h3>
        <Badge>{data.environment}</Badge>
      </div>
    </Card>
  );
}

function AgentGroupNode({ data }: NodeProps) {
  return (
    <Card className="min-w-[180px]">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="p-4">
        <h4 className="font-semibold">{data.label}</h4>
        <Badge variant="outline">{data.role}</Badge>
        <div className="text-sm text-muted-foreground mt-1">
          {data.agentCount} Agents
        </div>
      </div>
    </Card>
  );
}

function AgentNode({ data }: NodeProps) {
  return (
    <Card className={`min-w-[150px] border-2 ${data.status === 'online' ? 'border-green-500' :
      data.status === 'error' ? 'border-red-500' : 'border-gray-500'
      }`}>
      <Handle type="target" position={Position.Top} />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${data.status === 'online' ? 'bg-green-500' :
            data.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
          <span className="font-medium">{data.label}</span>
        </div>
        {data.metrics && (
          <div className="text-xs text-muted-foreground mt-2">
            CPU: {data.metrics.cpu}% | MEM: {data.metrics.memory}%
          </div>
        )}
      </div>
    </Card>
  );
}

function PipelineComponentNode({ data }: NodeProps) {
  return (
    <Card className="min-w-[180px]">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="p-4">
        <h4 className="font-semibold">{data.label}</h4>
        <div className="text-sm text-muted-foreground">
          {data.type}
        </div>
        {data.components && (
          <div className="mt-2">
            {Object.keys(data.components).map(key => (
              <Badge key={key} variant="secondary" className="mr-1 mb-1">
                {key}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

const nodeTypes = {
  deployment: DeploymentNode,
  agentGroup: AgentGroupNode,
  agent: AgentNode,
  pipelineComponent: PipelineComponentNode,
};

interface FlowVisualizerProps {
  deployment?: Deployment;
  pipeline?: Pipeline;
  onNodeClick?: (nodeId: string, type: string) => void;
}

export function FlowVisualizer({ deployment, pipeline, onNodeClick }: FlowVisualizerProps) {
  const [_, setSelectedNode] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    if (deployment) {
      return createDeploymentFlow(deployment);
    }
    if (pipeline) {
      return createPipelineFlow(pipeline);
    }
    return { nodes: [], edges: [] };
  }, [deployment, pipeline]);

  const handleNodeClick: NodeMouseHandler = (_, node) => {
    setSelectedNode(node.id);
    if (node.type) {
      onNodeClick?.(node.id, node.type);
    }
  };

  return (
    <div style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={false}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// Helper functions to create flow layouts
function createDeploymentFlow(deployment: Deployment) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Add deployment node
  nodes.push({
    id: `deployment-${deployment.id}`,
    type: 'deployment',
    data: {
      label: deployment.name,
      environment: deployment.environment,
    },
    position: { x: 300, y: 0 },
  });

  // Add agent groups
  deployment.agentGroups.forEach((group, groupIndex) => {
    const groupX = 150 + groupIndex * 300;
    nodes.push({
      id: `group-${group.id}`,
      type: 'agentGroup',
      data: {
        label: group.name,
        role: group.role,
        agentCount: group.agents.length,
      },
      position: { x: groupX, y: 150 },
    });

    edges.push({
      id: `edge-deployment-${group.id}`,
      source: `deployment-${deployment.id}`,
      target: `group-${group.id}`,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // Add agents
    group.agents.forEach((agent, agentIndex) => {
      const agentX = groupX - 50 + agentIndex * 100;
      nodes.push({
        id: `agent-${agent.instanceIdStr}`,
        type: 'agent',
        data: {
          label: agent.instanceIdStr,
          status: agent.status,
        },
        position: { x: agentX, y: 300 },
      });

      edges.push({
        id: `edge-group-${agent.instanceIdStr}`,
        source: `group-${group.id}`,
        target: `agent-${agent.instanceIdStr}`,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    });
  });

  return { nodes, edges };
}

function createPipelineFlow(pipeline: Pipeline) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Assuming pipeline.configuration has receivers, processors, and exporters
  const config = pipeline.configuration;

  // Add receivers
  Object.entries(config.receivers || {}).forEach(([key, value], index) => {
    nodes.push({
      id: `receiver-${key}`,
      type: 'pipelineComponent',
      data: {
        label: key,
        type: 'Receiver',
        components: value,
      },
      position: { x: 0, y: 100 + index * 150 },
    });
  });

  // Add processors
  Object.entries(config.processors || {}).forEach(([key, value], index) => {
    nodes.push({
      id: `processor-${key}`,
      type: 'pipelineComponent',
      data: {
        label: key,
        type: 'Processor',
        components: value,
      },
      position: { x: 300, y: 100 + index * 150 },
    });
  });

  // Add exporters
  Object.entries(config.exporters || {}).forEach(([key, value], index) => {
    nodes.push({
      id: `exporter-${key}`,
      type: 'pipelineComponent',
      data: {
        label: key,
        type: 'Exporter',
        components: value,
      },
      position: { x: 600, y: 100 + index * 150 },
    });
  });

  // Create edges based on pipeline configuration
  if (config.service?.pipelines) {
    Object.entries(config.service.pipelines).forEach(([_, pipelineConfig]: [string, any]) => {
      // Connect receivers to processors
      (pipelineConfig.receivers || []).forEach((receiver: string) => {
        (pipelineConfig.processors || []).forEach((processor: string) => {
          edges.push({
            id: `edge-${receiver}-${processor}`,
            source: `receiver-${receiver}`,
            target: `processor-${processor}`,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        });
      });

      // Connect processors to exporters
      pipelineConfig.processors.forEach((processor: string) => {
        pipelineConfig.exporters.forEach((exporter: string) => {
          edges.push({
            id: `edge-${processor}-${exporter}`,
            source: `processor-${processor}`,
            target: `exporter-${exporter}`,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        });
      });
    });
  }

  return { nodes, edges };
} 