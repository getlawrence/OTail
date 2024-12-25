import { useCallback, useEffect } from 'react';
import ReactFlow, { 
  Node, 
  Edge,
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { load } from 'js-yaml';

interface OtelConfigVisualizerProps {
  yamlConfig: string;
}

const OtelConfigVisualizer = ({ yamlConfig }: OtelConfigVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const parseYamlToGraph = useCallback((yamlString: string) => {
    try {
      const config = load(yamlString) as Record<string, any>;
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      let nodeId = 1;

      // Add pipelines and create edges
      if (config.service?.pipelines) {
        let verticalOffset = 0;

        // Process each pipeline type
        Object.entries(config.service.pipelines).forEach(([type, pipelineConfig]: [string, any]) => {
            const pipelineStartY = verticalOffset;
            const receiverStartY = pipelineStartY + 50;
            const processorX = 400;
            const exporterStartY = pipelineStartY + 50;

            // Add pipeline type label
            newNodes.push({
              id: `${type}-label-${nodeId}`,
              data: { label: `${type.toUpperCase()} PIPELINE` },
              position: { x: 50, y: pipelineStartY },
              type: 'default',
              className: 'pipeline-label',
              style: { 
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                background: '#f8f8f8'
              }
            });
            nodeId++;

            // Add receivers in a vertical arrangement
            const receiverNodes: Node[] = [];
            if (pipelineConfig.receivers) {
              pipelineConfig.receivers.forEach((receiverName: string, idx: number) => {
                // Get receiver details from config
                const receiverConfig = config.receivers?.[receiverName];
                let label = receiverName;
                if (receiverConfig?.protocols) {
                  const protocols = Object.keys(receiverConfig.protocols).join(', ');
                  label = `${receiverName} (${protocols})`;
                }

                const receiverNode = {
                  id: `${type}-receiver-${nodeId}`,
                  data: { label },
                  position: { x: 100, y: receiverStartY + (idx * 80) },
                  type: 'default',
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                  style: { background: '#e6f3ff', border: '1px solid #1a73e8' }
                };
                receiverNodes.push(receiverNode);
                newNodes.push(receiverNode);
                nodeId++;
              });
            }

            // Add processors in a chain
            const processorNodes: Node[] = [];
            if (pipelineConfig.processors) {
              pipelineConfig.processors.forEach((processorName: string, idx: number) => {
                // Get processor details from config
                const processorConfig = config.processors?.[processorName];
                let label = processorName;
                if (processorConfig) {
                  const configKeys = Object.keys(processorConfig)
                    .filter(key => key !== 'type')
                    .map(key => `${key}: ${processorConfig[key]}`)
                    .join('\n');
                  label = `${processorName}\n${configKeys}`;
                }

                const processorNode = {
                  id: `${type}-processor-${nodeId}`,
                  data: { label },
                  position: { x: processorX + (idx * 200), y: pipelineStartY + 150 },
                  type: 'default',
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                  style: { background: '#fff3e0', border: '1px solid #f57c00' }
                };
                processorNodes.push(processorNode);
                newNodes.push(processorNode);
                nodeId++;
              });
            }

            // Add exporters in a vertical arrangement
            const exporterNodes: Node[] = [];
            if (pipelineConfig.exporters) {
              pipelineConfig.exporters.forEach((exporterName: string, idx: number) => {
                // Get exporter details from config
                const exporterConfig = config.exporters?.[exporterName];
                let label = exporterName;
                if (exporterConfig?.endpoint) {
                  label = `${exporterName}\n${exporterConfig.endpoint}`;
                }

                const exporterNode = {
                  id: `${type}-exporter-${nodeId}`,
                  data: { label },
                  position: { 
                    x: processorX + (processorNodes.length * 200) + 100,
                    y: exporterStartY + (idx * 80)
                  },
                  type: 'default',
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                  style: { background: '#e8f5e9', border: '1px solid #43a047' }
                };
                exporterNodes.push(exporterNode);
                newNodes.push(exporterNode);
                nodeId++;
              });
            }

            // Connect receivers to first processor
            if (processorNodes.length > 0) {
              receiverNodes.forEach(receiverNode => {
                newEdges.push({
                  id: `e${receiverNode.id}-${processorNodes[0].id}`,
                  source: receiverNode.id,
                  target: processorNodes[0].id,
                  style: { stroke: '#1a73e8' }
                });
              });
            } else if (exporterNodes.length > 0) {
              // If no processors, connect receivers directly to exporters
              receiverNodes.forEach(receiverNode => {
                exporterNodes.forEach(exporterNode => {
                  newEdges.push({
                    id: `e${receiverNode.id}-${exporterNode.id}`,
                    source: receiverNode.id,
                    target: exporterNode.id,
                    style: { stroke: '#1a73e8' }
                  });
                });
              });
            }

            // Chain processors together
            for (let i = 0; i < processorNodes.length - 1; i++) {
              newEdges.push({
                id: `e${processorNodes[i].id}-${processorNodes[i + 1].id}`,
                source: processorNodes[i].id,
                target: processorNodes[i + 1].id,
                style: { stroke: '#f57c00' }
              });
            }

            // Connect last processor to all exporters
            if (processorNodes.length > 0 && exporterNodes.length > 0) {
              const lastProcessor = processorNodes[processorNodes.length - 1];
              exporterNodes.forEach(exporterNode => {
                newEdges.push({
                  id: `e${lastProcessor.id}-${exporterNode.id}`,
                  source: lastProcessor.id,
                  target: exporterNode.id,
                  style: { stroke: '#43a047' }
                });
              });
            }

            // Calculate height needed for this pipeline
            const pipelineHeight = Math.max(
              receiverNodes.length * 80,
              exporterNodes.length * 80,
              300 // minimum height
            );
            verticalOffset += pipelineHeight + 100; // Add padding between pipelines
        });
      }

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (yamlConfig) {
      parseYamlToGraph(yamlConfig);
    }
  }, [yamlConfig, parseYamlToGraph]);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Strict}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default OtelConfigVisualizer;
