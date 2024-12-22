import React, { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
  addEdge,
  Connection,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Sidebar } from './OtelConfigBuilderSidebar';
import { ComponentConfigDialog } from '../ComponentConfigDialog';
import { load } from 'js-yaml';
import { nodeTypes } from './NodeTypes';
import { FlowSection } from './FlowSection';
import { useFlowConfig } from './useFlowConfig';
import { styles, LAYOUT_CONFIG, VALID_CONNECTIONS, PIPELINE_SECTIONS } from './constants';
import type { OtelConfigBuilderProps, OtelConfig, PipelineType } from './types';

const OtelConfigBuilder: React.FC<OtelConfigBuilderProps> = ({ onChange, initialYaml }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { generateConfig } = useFlowConfig(nodes, edges, onChange);
  
  const hasParsedYaml = useRef(false); // Keeps track of whether the YAML has been parsed.

  const parseInitialYaml = useCallback((yamlString: string) => {
    try {
      const config: OtelConfig = load(yamlString) as OtelConfig;
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Process each pipeline in the config
      Object.entries(config.service?.pipelines || {}).forEach(([pipelineKey, pipeline]) => {
        const [pipelineType, pipelineName] = pipelineKey.split('/');

        const createNodes = (
          components: string[], 
          type: 'receiver' | 'processor' | 'exporter', 
          startX: number,
          y: number
        ) => {
          return components.map((label, index) => ({
            id: `${type}-${label}-${pipelineType}-${index}`,
            type,
            position: {
              x: startX + (index * LAYOUT_CONFIG.NODE_SPACING),
              y
            },
            data: {
              label,
              config: config[`${type}s`][label] || {},
              pipelineType,
              pipelineName
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
              width: LAYOUT_CONFIG.NODE_WIDTH,
              height: LAYOUT_CONFIG.NODE_HEIGHT,
            },
          }));
        };

        const baseY = Object.keys(PIPELINE_SECTIONS).indexOf(pipelineType) * (LAYOUT_CONFIG.SECTION_HEIGHT / 3) + 50;
        
        // Create nodes for each component type
        const receiverNodes = createNodes(pipeline.receivers, 'receiver', 50, baseY);
        const processorNodes = createNodes(pipeline.processors, 'processor', 300, baseY);
        const exporterNodes = createNodes(pipeline.exporters, 'exporter', 550, baseY);

        newNodes.push(...receiverNodes, ...processorNodes, ...exporterNodes);

        // Create edges between nodes
        const createEdges = (sourceNodes: Node[], targetNodes: Node[]) => {
          return sourceNodes.flatMap(source => 
            targetNodes.map(target => ({
              id: `edge-${source.id}-${target.id}`,
              source: source.id,
              target: target.id,
              style: styles.validConnectionStyle,
              animated: true,
            }))
          );
        };

        if (receiverNodes.length && processorNodes.length) {
          newEdges.push(...createEdges(receiverNodes, processorNodes));
        }
        if (processorNodes.length && exporterNodes.length) {
          newEdges.push(...createEdges(processorNodes, exporterNodes));
        }
        if(receiverNodes.length && exporterNodes.length){
          newEdges.push(...createEdges(receiverNodes, exporterNodes))
        }
      });
      console.log('Nodes:', newNodes);
      console.log('Edges:', newEdges);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (initialYaml && !hasParsedYaml.current) {
      parseInitialYaml(initialYaml);
      hasParsedYaml.current = true; // Mark that the YAML has been parsed.
    }
  }, [initialYaml, parseInitialYaml]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode?.type || !targetNode?.type) return;
    if (!VALID_CONNECTIONS[sourceNode.type]?.includes(targetNode.type)) return;
    if (sourceNode.data.pipelineType !== targetNode.data.pipelineType) return;

    setEdges(eds => {
      const newEdges = eds.filter(edge => edge.target !== connection.target);
      return addEdge({
        ...connection,
        style: styles.validConnectionStyle,
        animated: true,
      }, newEdges);
    });
  }, [nodes, setEdges]);

  const generateUniquePipelineName = useCallback((
    baseType: PipelineType, 
    baseName: string, 
    existingPipelines: string[]
  ): string => {
    let counter = 1;
    let pipelineName = baseName;
    let fullPipelineKey = `${baseType}/${pipelineName}`;

    while (existingPipelines.includes(fullPipelineKey)) {
      pipelineName = `${baseName}_${counter}`;
      fullPipelineKey = `${baseType}/${pipelineName}`;
      counter++;
    }

    return pipelineName;
  }, []);

  const determineSection = useCallback((y: number): PipelineType => {
    const sectionHeight = LAYOUT_CONFIG.SECTION_HEIGHT / 3;
    if (y < sectionHeight) return 'traces';
    if (y < sectionHeight * 2) return 'metrics';
    return 'logs';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    const name = event.dataTransfer.getData('component/name');
    
    if (!type || !name) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left - LAYOUT_CONFIG.NODE_WIDTH / 2,
      y: event.clientY - rect.top - LAYOUT_CONFIG.NODE_HEIGHT / 2,
    };

    // Snap to grid
    position.x = Math.round(position.x / 15) * 15;
    position.y = Math.round(position.y / 15) * 15;

    const section = determineSection(position.y);
    const existingPipelines = nodes
      .map(node => `${node.data.pipelineType}/${node.data.pipelineName}`);
    const pipelineName = generateUniquePipelineName(section, 'default', existingPipelines);

    const newNode: Node = {
      id: `${type}-${name}-${Date.now()}`,
      type,
      position,
      data: {
        label: name,
        config: {},
        pipelineType: section,
        pipelineName
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        width: LAYOUT_CONFIG.NODE_WIDTH,
        height: LAYOUT_CONFIG.NODE_HEIGHT,
      },
    };

    setNodes(nds => nds.concat(newNode));
  }, [nodes, setNodes, determineSection, generateUniquePipelineName]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeConfig = useCallback((nodeId: string, config: any) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  }, [setNodes]);

  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    setEdges(eds => 
      eds.filter(edge => 
        !nodesToDelete.some(node => 
          node.id === edge.source || node.id === edge.target
        )
      )
    );
  }, [setEdges]);

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    setEdges(eds => 
      eds.filter(edge => 
        !edgesToDelete.some(e => e.id === edge.id)
      )
    );
  }, [setEdges]);

  useEffect(() => {
    generateConfig();
  }, [nodes, edges, generateConfig]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-grow relative" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          onNodeClick={onNodeClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
        >
          <Background gap={15} size={1} />
          {Object.keys(PIPELINE_SECTIONS).map((type, index) => (
            <FlowSection 
              key={type} 
              type={type as PipelineType} 
              index={index} 
            />
          ))}
        </ReactFlow>
        {selectedNode && (
          <ComponentConfigDialog
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onConfigUpdate={updateNodeConfig}
          />
        )}
      </div>
    </div>
  );
};

export default OtelConfigBuilder;