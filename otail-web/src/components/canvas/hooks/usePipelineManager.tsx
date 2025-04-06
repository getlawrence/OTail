import { useCallback } from 'react';
import { Node, Edge, Position } from 'reactflow';
import { load } from 'js-yaml';
import { styles, LAYOUT_CONFIG } from '../constants';
import type { OtelConfig, SectionType } from '../types';
import { calculateNodeLayout } from '../utils/layoutCalculator';

interface UsePipelineManagerProps {
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  nodes: Node[];
}

export function usePipelineManager({ 
  setNodes, 
  setEdges,
  nodes
}: UsePipelineManagerProps) {
  // No longer need to generate unique pipeline names for UI components
  // Pipeline names will be generated only during YAML generation

  // Parse initial YAML configuration
  const parseInitialYaml = useCallback((yamlString: string) => {
    try {
      const config: OtelConfig = load(yamlString) as OtelConfig;
      const newNodes: Node[] = [];
      const connectorMap = new Map<string, { sourcePipelines: string[], targetPipelines: string[] }>();
      const connectorNames = new Set<string>();

      // Group nodes by pipeline type for layout
      const nodesByPipelineType: Record<string, Node[]> = {};
      const edgesByPipelineType: Record<string, Edge[]> = {};
      const allEdges: Edge[] = [];

      // Identify all connectors first to avoid creating duplicate nodes
      if (config.connectors) {
        Object.keys(config.connectors).forEach(connectorName => {
          connectorNames.add(connectorName);
          connectorMap.set(connectorName, { sourcePipelines: [], targetPipelines: [] });
        });
      }

      // Initialize pipeline type groups
      Object.keys(config.service?.pipelines || {}).forEach(([pipelineKey]) => {
        const [pipelineType] = pipelineKey.split('/');
        if (!nodesByPipelineType[pipelineType]) {
          nodesByPipelineType[pipelineType] = [];
          edgesByPipelineType[pipelineType] = [];
        }
      });

      // Process each pipeline in the config
      Object.entries(config.service?.pipelines || {}).forEach(([pipelineKey, pipeline]) => {
        const [pipelineType, _] = pipelineKey.split('/');

        const createNodes = (
          components: string[],
          type: 'receivers' | 'processors' | 'exporters' | 'connectors',
        ) => {
          return components
            .filter(label => !connectorNames.has(label)) // Skip connectors, we'll create them separately
            .map((label, componentIndex) => ({
              id: `${type}-${label}-${pipelineType}-${componentIndex}`,
              type,
              position: {
                x: 0, // Initial position, will be updated by layout calculator
                y: 0
              },
              data: {
                label,
                config: config[type][label] || {},
                pipelineType,
              },
              sourcePosition: Position.Right,
              targetPosition: Position.Left,
              parentNode: `section-${pipelineType}`,
              extent: 'parent' as const,
              style: {
                width: LAYOUT_CONFIG.NODE_WIDTH,
                height: LAYOUT_CONFIG.NODE_HEIGHT,
                zIndex: 10
              },
            }));
        };

        // Create nodes for each component type
        const receiverNodes = createNodes(pipeline.receivers || [], 'receivers');
        const processorNodes = createNodes(pipeline.processors || [], 'processors');
        const exporterNodes = createNodes(pipeline.exporters || [], 'exporters');

        // Add nodes to their respective pipeline type group
        if (!nodesByPipelineType[pipelineType]) {
          nodesByPipelineType[pipelineType] = [];
          edgesByPipelineType[pipelineType] = [];
        }

        nodesByPipelineType[pipelineType].push(...receiverNodes, ...processorNodes, ...exporterNodes);
        
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

        let pipelineEdges: Edge[] = [];
        
        if (receiverNodes.length && processorNodes.length) {
          // Connect receivers only to the first processor
          const firstProcessor = processorNodes[0];
          const receiverEdges = receiverNodes.map(receiver => ({
            id: `edge-${receiver.id}-${firstProcessor.id}`,
            source: receiver.id,
            target: firstProcessor.id,
            style: styles.validConnectionStyle,
            animated: true,
          }));
          pipelineEdges.push(...receiverEdges);

          // Create a chain of processors
          for (let i = 0; i < processorNodes.length - 1; i++) {
            pipelineEdges.push({
              id: `edge-${processorNodes[i].id}-${processorNodes[i + 1].id}`,
              source: processorNodes[i].id,
              target: processorNodes[i + 1].id,
              style: styles.validConnectionStyle,
              animated: true,
            });
          }

          // Connect last processor to all exporters
          if (exporterNodes.length > 0) {
            const lastProcessor = processorNodes[processorNodes.length - 1];
            const exporterEdges = exporterNodes.map(exporter => ({
              id: `edge-${lastProcessor.id}-${exporter.id}`,
              source: lastProcessor.id,
              target: exporter.id,
              style: styles.validConnectionStyle,
              animated: true,
            }));
            pipelineEdges.push(...exporterEdges);
          }
        } else if (receiverNodes.length && exporterNodes.length && processorNodes.length === 0) {
          // If there are no processors, connect receivers directly to exporters
          const edges = createEdges(receiverNodes, exporterNodes);
          pipelineEdges.push(...edges);
        }
        
        // Add edges to their respective pipeline type group
        edgesByPipelineType[pipelineType].push(...pipelineEdges);
        allEdges.push(...pipelineEdges);
        
        // Track connectors used in this pipeline
        pipeline.receivers.forEach(receiver => {
          if (connectorNames.has(receiver)) {
            // This receiver is a connector
            const connectorInfo = connectorMap.get(receiver);
            if (connectorInfo) {
              connectorInfo.targetPipelines.push(pipelineKey);
              connectorMap.set(receiver, connectorInfo);
            }
          }
        });

        pipeline.exporters.forEach(exporter => {
          if (connectorNames.has(exporter)) {
            // This exporter is a connector
            const connectorInfo = connectorMap.get(exporter);
            if (connectorInfo) {
              connectorInfo.sourcePipelines.push(pipelineKey);
              connectorMap.set(exporter, connectorInfo);
            }
          }
        });
      });
      
      // Create connector nodes
      connectorMap.forEach((info, connectorName) => {
        // Create source connector node (exporter)
        const sourceConnectorNode: Node = {
          id: `connector-${connectorName}-source`,
          type: 'connectors', // Keep type as connectors
          position: { x: 0, y: 0 }, // Position will be updated by layout calculator
          data: {
            label: connectorName,
            config: config.connectors[connectorName] || {},
            pipelineType: info.sourcePipelines[0]?.split('/')[0] || 'traces',
            isSource: true,
            connectorName,
            nodeType: 'exporter' // Add nodeType to indicate where to position it
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          parentNode: `section-${info.sourcePipelines[0]?.split('/')[0] || 'traces'}`,
          extent: 'parent' as const,
          style: {
            width: LAYOUT_CONFIG.NODE_WIDTH,
            height: LAYOUT_CONFIG.NODE_HEIGHT,
            zIndex: 10
          }
        };

        // Create target connector node (receiver)
        const targetConnectorNode: Node = {
          id: `connector-${connectorName}-target`,
          type: 'connectors', // Keep type as connectors
          position: { x: 0, y: 0 }, // Position will be updated by layout calculator
          data: {
            label: connectorName,
            config: config.connectors[connectorName] || {},
            pipelineType: info.targetPipelines[0]?.split('/')[0] || 'traces',
            isSource: false,
            connectorName,
            nodeType: 'receiver' // Add nodeType to indicate where to position it
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          parentNode: `section-${info.targetPipelines[0]?.split('/')[0] || 'traces'}`,
          extent: 'parent' as const,
          style: {
            width: LAYOUT_CONFIG.NODE_WIDTH,
            height: LAYOUT_CONFIG.NODE_HEIGHT,
            zIndex: 10
          }
        };

        // Add connector nodes to their respective pipeline type groups
        const sourcePipelineType = info.sourcePipelines[0]?.split('/')[0] || 'traces';
        const targetPipelineType = info.targetPipelines[0]?.split('/')[0] || 'traces';

        if (!nodesByPipelineType[sourcePipelineType]) {
          nodesByPipelineType[sourcePipelineType] = [];
        }
        if (!nodesByPipelineType[targetPipelineType]) {
          nodesByPipelineType[targetPipelineType] = [];
        }

        // Add source connector to source pipeline
        nodesByPipelineType[sourcePipelineType].push(sourceConnectorNode);
        // Add target connector to target pipeline
        nodesByPipelineType[targetPipelineType].push(targetConnectorNode);

        // Find the last processor in the source pipeline to connect to the source connector
        const sourcePipeline = config.service?.pipelines[info.sourcePipelines[0]];
        if (sourcePipeline) {
          const sourceProcessors = sourcePipeline.processors || [];
          if (sourceProcessors.length > 0) {
            const lastProcessor = sourceProcessors[sourceProcessors.length - 1];
            const lastProcessorNode = nodesByPipelineType[sourcePipelineType].find(
              node => node.data.label === lastProcessor
            );
            if (lastProcessorNode) {
              const sourceEdge: Edge = {
                id: `edge-${lastProcessorNode.id}-${sourceConnectorNode.id}`,
                source: lastProcessorNode.id,
                target: sourceConnectorNode.id,
                style: styles.validConnectionStyle,
                animated: true,
              };
              edgesByPipelineType[sourcePipelineType].push(sourceEdge);
              allEdges.push(sourceEdge);
            }
          }
        }

        // Find the first processor in the target pipeline to connect to the target connector
        const targetPipeline = config.service?.pipelines[info.targetPipelines[0]];
        if (targetPipeline) {
          const targetProcessors = targetPipeline.processors || [];
          if (targetProcessors.length > 0) {
            const firstProcessor = targetProcessors[0];
            const firstProcessorNode = nodesByPipelineType[targetPipelineType].find(
              node => node.data.label === firstProcessor
            );
            if (firstProcessorNode) {
              const targetEdge: Edge = {
                id: `edge-${targetConnectorNode.id}-${firstProcessorNode.id}`,
                source: targetConnectorNode.id,
                target: firstProcessorNode.id,
                style: styles.validConnectionStyle,
                animated: true,
              };
              edgesByPipelineType[targetPipelineType].push(targetEdge);
              allEdges.push(targetEdge);
            }
          }
        }

        // Create edge between connector nodes
        const connectorEdge: Edge = {
          id: `edge-${sourceConnectorNode.id}-${targetConnectorNode.id}`,
          source: sourceConnectorNode.id,
          target: targetConnectorNode.id,
          style: styles.validConnectionStyle,
          animated: true,
        };

        // Add edge to all edges
        allEdges.push(connectorEdge);
      });
      
      // Apply layout to each pipeline type
      const layoutedNodesByType: Record<string, Node[]> = {};
      
      Object.keys(nodesByPipelineType).forEach(pipelineType => {
        const pipelineNodes = nodesByPipelineType[pipelineType];
        const pipelineEdges = edgesByPipelineType[pipelineType];
        
        if (pipelineNodes.length === 0) return;
      
        // Apply layout
        const layoutedNodes = calculateNodeLayout(pipelineNodes, pipelineEdges);
        
        layoutedNodesByType[pipelineType] = layoutedNodes;
        newNodes.push(...layoutedNodes);
      });

      // Get current section nodes
      const sectionNodes = nodes.filter(node => node.type === 'section');
      
      // Update nodes and edges state, preserving section nodes
      setNodes(() => [...sectionNodes, ...newNodes]);
      setEdges(allEdges);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }
  }, [setNodes, setEdges, nodes]);

  // Create a new component node when dropped
  const createComponentNode = useCallback((
    type: string, 
    name: string, 
    section: SectionType, 
    position: { x: number, y: number }
  ) => {
    // We're simplifying by removing pipeline names from UI components
    // Components will only know about their section (traces, metrics, logs)
    // Pipeline generation will happen only during YAML generation

    const newNode: Node = {
      id: `${type}-${name}-${Date.now()}`,
      type,
      position,
      data: {
        label: name,
        type: type,
        config: {},
        pipelineType: section, // Keep track of the section type (traces, metrics, logs)
        parentSection: section // Track which section this node belongs to
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      // Make the node a child of the section
      parentNode: `section-${section}`,
      extent: 'parent' as const, // Constrain the node within its parent
      style: {
        zIndex: 10 // Ensure components are above sections
      }
    };

    // Add the new node to the canvas
    setNodes((nds) => {
      // Check if the new node would replace a section node
      const isSectionNodeId = nds.some(node =>
        node.type === 'section' && node.id === newNode.id
      );

      // If it would replace a section node, generate a unique ID
      if (isSectionNodeId) {
        newNode.id = `${newNode.id}-${Date.now()}`;
      }

      return nds.concat(newNode as Node);
    });

    return newNode;
  }, [nodes, setNodes]);

  // Connect nodes with edges
  const connectNodes = useCallback((sourceNode: Node, targetNode: Node) => {
    const newEdge: Edge = {
      id: `edge-${sourceNode.id}-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      ...styles.validConnectionStyle,
    };

    // Add the new edge to existing edges instead of replacing
    setEdges(currentEdges => [...currentEdges, newEdge]);
    return newEdge;
  }, [setEdges]);

  // Update a node's configuration
  const updateNodeConfig = useCallback((nodeId: string, config: any) => {
    setNodes(nds =>
      nds.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  }, [setNodes]);

  return {
    parseInitialYaml,
    createComponentNode,
    connectNodes,
    updateNodeConfig
  } as const;
}
