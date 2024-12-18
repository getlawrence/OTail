import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
  addEdge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sidebar } from './OtelConfigBuilderSidebar';
import { ComponentConfigDialog } from './ComponentConfigDialog';
import { dump } from 'js-yaml';
import ReceiverNode from './ReceiverNode';
import ProcessorNode from './ProcessorNode';
import ExporterNode from './ExporterNode';

type PipelineType = 'traces' | 'metrics' | 'logs';

const handleStyle = {
  width: '12px',
  height: '12px',
  background: '#555',
  border: '2px solid #fff',
  borderRadius: '6px',
  ':hover': {
    width: '14px',
    height: '14px',
    background: '#777'
  }
};

const nodeTypes = {
  receiver: (props: any) => (
    <div title={`Receiver: ${props.data.label}`}>
      <ReceiverNode {...props} handleStyle={handleStyle} />
    </div>
  ),
  processor: (props: any) => (
    <div title={`Processor: ${props.data.label}`}>
      <ProcessorNode {...props} handleStyle={handleStyle} />
    </div>
  ),
  exporter: (props: any) => (
    <div title={`Exporter: ${props.data.label}`}>
      <ExporterNode {...props} handleStyle={handleStyle} />
    </div>
  ),
};

interface PipelineConfig {
  receivers: string[];
  processors: string[];
  exporters: string[];
}

interface ServiceConfig {
  pipelines: {
    [key: string]: PipelineConfig;
  };
}

interface OtelConfig {
  receivers: Record<string, any>;
  processors: Record<string, any>;
  exporters: Record<string, any>;
  service: ServiceConfig;
}

interface OtelConfigBuilderProps {
  onChange?: (yaml: string) => void;
}

const VALID_CONNECTIONS: Record<string, string[]> = {
  'receiver': ['processor', 'exporter'],
  'processor': ['processor', 'exporter'],
  'exporter': []
};

const validConnectionStyle = {
  stroke: '#222',
  strokeWidth: 2,
};

const LAYOUT_CONFIG = {
  SECTION_HEIGHT: 600,
  SECTION_PADDING: 40,
  NODE_WIDTH: 180,
  NODE_HEIGHT: 40,
  NODE_SPACING: 100,
  MINIMAP_HEIGHT: 120,
};

const sectionStyles = {
  label: {
    position: 'absolute' as const,
    left: '10px',
    padding: '4px 8px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  divider: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: `${LAYOUT_CONFIG.SECTION_HEIGHT / 3}px`,
    pointerEvents: 'none' as const,
    borderBottom: '2px solid rgba(0,0,0,0.1)',
    background: 'rgba(0,0,0,0.02)',
    zIndex: 0,
  },
  sectionTitle: {
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '4px 16px',
    background: 'white',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontWeight: 'bold',
    zIndex: 10,
  }
};

const OtelConfigBuilder = ({ onChange }: OtelConfigBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode?.type || !targetNode?.type) return;

    const validTargets = VALID_CONNECTIONS[sourceNode.type as keyof typeof VALID_CONNECTIONS];
    if (!validTargets?.includes(targetNode.type)) {
      console.error('Invalid connection: This connection type is not allowed');
      return;
    }

    if (sourceNode.data.pipelineType !== targetNode.data.pipelineType) {
      console.error('Cannot connect nodes from different pipeline types');
      return;
    }

    setEdges(eds => {
      const existingTargetConnections = eds.filter(
        edge => edge.target === connection.target
      );

      if (existingTargetConnections.length > 0) {
        eds = eds.filter(edge => edge.target !== connection.target);
      }

      return addEdge({
        ...connection,
        style: validConnectionStyle,
        animated: true,
      }, eds);
    });
  }, [nodes, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const generateUniquePipelineName = (baseType: PipelineType, baseName: string, existingPipelines: string[]): string => {
    let counter = 1;
    let pipelineName = baseName;
    let fullPipelineKey = `${baseType}/${pipelineName}`;

    while (existingPipelines.includes(fullPipelineKey)) {
      pipelineName = `${baseName}_${counter}`;
      fullPipelineKey = `${baseType}/${pipelineName}`;
      counter++;
    }

    return pipelineName;
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const name = event.dataTransfer.getData('component/name');

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left - LAYOUT_CONFIG.NODE_WIDTH / 2,
      y: event.clientY - rect.top - LAYOUT_CONFIG.NODE_HEIGHT / 2,
    };

    position.x = Math.round(position.x / 15) * 15;
    position.y = Math.round(position.y / 15) * 15;

    const section = determineSection(position.y);
    const existingPipelines = nodes
      .map(node => `${node.data.pipelineType}/${node.data.pipelineName}`);
    const uniquePipelineName = generateUniquePipelineName(section, 'default', existingPipelines);

    const pipelineNodes = nodes.filter(n =>
      n.data.pipelineType === section &&
      n.data.pipelineName === uniquePipelineName
    );

    if (pipelineNodes.length > 0) {
      const lastNode = pipelineNodes.reduce((prev, curr) =>
        prev.position.x > curr.position.x ? prev : curr
      );
      position.x = lastNode.position.x + LAYOUT_CONFIG.NODE_SPACING;
    }

    const newNode: Node = {
      id: `${type}-${nodes.length + 1}`,
      type,
      position,
      data: {
        label: name,
        config: {},
        pipelineType: section,
        pipelineName: uniquePipelineName
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        width: LAYOUT_CONFIG.NODE_WIDTH,
        height: LAYOUT_CONFIG.NODE_HEIGHT,
      },
    };

    setNodes(nds => nds.concat(newNode));

  }, [nodes, setNodes, setEdges]);

  const determineSection = (y: number): PipelineType => {
    const sectionHeight = 600 / 3;
    if (y < sectionHeight) return 'traces';
    if (y < sectionHeight * 2) return 'metrics';
    return 'logs';
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeConfig = useCallback((nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  }, [setNodes]);

  // Add function to handle node removal
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    // Remove all edges connected to deleted nodes
    setEdges(edges => edges.filter(edge =>
      !nodesToDelete.find(node =>
        node.id === edge.source || node.id === edge.target
      )
    ));
  }, [setEdges]);


  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    setEdges(edges => edges.filter(edge =>
      !edgesToDelete.find(e => e.id === edge.id)
    ));
  }, [setEdges]);

  useEffect(() => {
    const config: OtelConfig = {
      receivers: {},
      processors: {},
      exporters: {},
      service: {
        pipelines: {}
      }
    };

    // Create pipeline groups based on connected components
    const pipelineGroups = new Map<string, Set<Node>>();
    const processedNodes = new Set<string>();

    // Helper function to find all connected nodes
    const findConnectedNodes = (nodeId: string, pipelineKey: string, connectedNodes: Set<Node>) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node || processedNodes.has(nodeId)) return;

      processedNodes.add(nodeId);
      connectedNodes.add(node);

      // Find all edges connected to this node
      edges.forEach(edge => {
        if (edge.source === nodeId) {
          findConnectedNodes(edge.target, pipelineKey, connectedNodes);
        }
        if (edge.target === nodeId) {
          findConnectedNodes(edge.source, pipelineKey, connectedNodes);
        }
      });
    };

    // Group connected nodes into pipelines
    nodes.forEach(node => {
      if (processedNodes.has(node.id)) return;

      const pipelineKey = `${node.data.pipelineType}/${node.data.pipelineName}`;
      const connectedNodes = new Set<Node>();
      findConnectedNodes(node.id, pipelineKey, connectedNodes);

      if (connectedNodes.size > 0) {
        pipelineGroups.set(pipelineKey, connectedNodes);
      }
    });

    // Process each pipeline group
    pipelineGroups.forEach((pipelineNodes, pipelineKey) => {
      const [pipelineType, pipelineName] = pipelineKey.split('/');
      const fullPipelineKey = `${pipelineType}/${pipelineName}`;

      // Initialize pipeline configuration
      config.service.pipelines[fullPipelineKey] = {
        receivers: [],
        processors: [],
        exporters: []
      };

      // Process all nodes in the pipeline
      pipelineNodes.forEach(node => {
        switch (node.type) {
          case 'receiver':
            if (!config.receivers[node.data.label]) {
              config.receivers[node.data.label] = node.data.config;
            }
            if (!config.service.pipelines[fullPipelineKey].receivers.includes(node.data.label)) {
              config.service.pipelines[fullPipelineKey].receivers.push(node.data.label);
            }
            break;
          case 'processor':
            if (!config.processors[node.data.label]) {
              config.processors[node.data.label] = node.data.config;
            }
            if (!config.service.pipelines[fullPipelineKey].processors.includes(node.data.label)) {
              config.service.pipelines[fullPipelineKey].processors.push(node.data.label);
            }
            break;
          case 'exporter':
            if (!config.exporters[node.data.label]) {
              config.exporters[node.data.label] = node.data.config;
            }
            if (!config.service.pipelines[fullPipelineKey].exporters.includes(node.data.label)) {
              config.service.pipelines[fullPipelineKey].exporters.push(node.data.label);
            }
            break;
        }
      });
    });

    const yaml = dump(config, {
      noRefs: true,
      lineWidth: -1,
      forceQuotes: false,
    });
    onChange?.(yaml);
  }, [nodes, edges, onChange]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedNode(null);
      }

      // Undo/Redo (if you implement history)
      if (event.metaKey || event.ctrlKey) {
        if (event.key === 'z') {
          // Implement undo
        }
        if (event.key === 'y') {
          // Implement redo
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [setSelectedNode]);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 relative" style={{ height: `${LAYOUT_CONFIG.SECTION_HEIGHT}px` }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Strict}
          onNodesDelete={onNodesDelete}
          deleteKeyCode={['Backspace', 'Delete']}
          onEdgesDelete={onEdgesDelete}
          edgesUpdatable={true}
          edgesFocusable={true}
          selectNodesOnDrag={false}
          connectionRadius={20}
          snapToGrid={true}
          snapGrid={[15, 15]}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          fitView
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: true }}
          defaultEdgeOptions={{
            style: { strokeWidth: 2 },
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background gap={15} size={1} />

          {/* Traces Section */}
          <div className="section traces"
            style={{
              ...sectionStyles.divider,
              top: 0,
              background: 'rgba(52, 152, 219, 0.05)', // Light blue tint
            }}>
            <div style={sectionStyles.sectionTitle}>
              Traces Pipeline
            </div>
          </div>

          {/* Metrics Section */}
          <div className="section metrics"
            style={{
              ...sectionStyles.divider,
              top: `${LAYOUT_CONFIG.SECTION_HEIGHT / 3}px`,
              background: 'rgba(46, 204, 113, 0.05)', // Light green tint
            }}>
            <div style={sectionStyles.sectionTitle}>
              Metrics Pipeline
            </div>
          </div>

          {/* Logs Section */}
          <div className="section logs"
            style={{
              ...sectionStyles.divider,
              top: `${LAYOUT_CONFIG.SECTION_HEIGHT * 2 / 3}px`,
              background: 'rgba(155, 89, 182, 0.05)', // Light purple tint
            }}>
            <div style={sectionStyles.sectionTitle}>
              Logs Pipeline
            </div>
          </div>

          {/* Section Labels */}
          <div style={{
            ...sectionStyles.label,
            top: 10,
            background: 'rgba(52, 152, 219, 0.1)',
          }}>
            Traces
          </div>
          <div style={{
            ...sectionStyles.label,
            top: LAYOUT_CONFIG.SECTION_HEIGHT / 3 + 10,
            background: 'rgba(46, 204, 113, 0.1)',
          }}>
            Metrics
          </div>
          <div style={{
            ...sectionStyles.label,
            top: LAYOUT_CONFIG.SECTION_HEIGHT * 2 / 3 + 10,
            background: 'rgba(155, 89, 182, 0.1)',
          }}>
            Logs
          </div>
        </ReactFlow>
      </div>

      {selectedNode && (
        <ComponentConfigDialog
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={(config) => updateNodeConfig(selectedNode.id, config)}
        />
      )}
    </div>
  );
};

export default OtelConfigBuilder; 