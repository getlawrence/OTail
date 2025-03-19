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
      const connectorNodes: Node[] = [];
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
          type: 'receiver' | 'processor' | 'exporter',
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
                config: config[`${type}s`][label] || {},
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
        const receiverNodes = createNodes(pipeline.receivers || [], 'receiver');
        const processorNodes = createNodes(pipeline.processors || [], 'processor');
        const exporterNodes = createNodes(pipeline.exporters || [], 'exporter');

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
          const edges = createEdges(receiverNodes, processorNodes);
          pipelineEdges.push(...edges);
        }
        if (processorNodes.length && exporterNodes.length) {
          const edges = createEdges(processorNodes, exporterNodes);
          pipelineEdges.push(...edges);
        }
        if (receiverNodes.length && exporterNodes.length && processorNodes.length === 0) {
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
      
      // Apply layout to each pipeline type
      const layoutedNodesByType: Record<string, Node[]> = {};
      
      Object.keys(nodesByPipelineType).forEach(pipelineType => {
        const pipelineNodes = nodesByPipelineType[pipelineType];
        const pipelineEdges = edgesByPipelineType[pipelineType];
        
        if (pipelineNodes.length === 0) return;
        
        // Default section bounds - these could be retrieved from your section nodes
        const sectionBounds = {
          x: 100,
          y: 50, // This would ideally be dynamically determined based on the section's position
          width: window.innerWidth - 320,
          height: window.innerHeight / 4
        };
        
        // Apply layout
        const layoutedNodes = calculateNodeLayout(pipelineNodes, pipelineEdges, {
          direction: 'LR',
          nodeSpacing: LAYOUT_CONFIG.NODE_SPACING || 50,
          rankSpacing: 50,
          fitWithinBounds: true,
          bounds: sectionBounds,
          headerHeight: 40
        });
        
        layoutedNodesByType[pipelineType] = layoutedNodes;
        newNodes.push(...layoutedNodes);
      });
      
      // Process connectors after all pipeline nodes are created
      if (config.connectors) {
        Object.entries(config.connectors).forEach(([connectorName, connectorConfig]) => {
          const connectorInfo = connectorMap.get(connectorName);
          if (!connectorInfo || connectorInfo.sourcePipelines.length === 0 || connectorInfo.targetPipelines.length === 0) {
            return;
          }
          
          // Get the first source and target pipeline for placement
          const sourcePipeline = connectorInfo.sourcePipelines[0];
          const targetPipeline = connectorInfo.targetPipelines[0];
          
          const [sourceType] = sourcePipeline.split('/');
          const [targetType] = targetPipeline.split('/');
          
          // Position the connector node between processors and exporters
          // This could be improved to use layout calculations
          const connectorNode: Node = {
            id: `connector-${connectorName}`,
            type: 'connector',
            position: {
              x: 425, // Position between processors and exporters
              y: 50
            },
            data: {
              label: connectorName,
              config: connectorConfig,
              pipelineType: sourceType,
              sourcePipelineType: sourceType,
              targetPipelineType: targetType,
              isConnector: true,
              sourcePipelines: connectorInfo.sourcePipelines,
              targetPipelines: connectorInfo.targetPipelines
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            parentNode: `section-${sourceType}`,
            extent: 'parent' as const,
            style: {
              width: LAYOUT_CONFIG.NODE_WIDTH,
              height: LAYOUT_CONFIG.NODE_HEIGHT,
              background: '#fff8e1', // Light amber color for connectors
              borderColor: '#ffca28',
              zIndex: 20 // Higher z-index to ensure visibility
            },
          };
          
          connectorNodes.push(connectorNode);

          // Create direct edges between exporters and receivers through the connector
          // This is a simpler approach that should work regardless of pipeline structure
          
          // Find all exporters in source pipelines
          const allSourceExporters: Node[] = [];
          connectorInfo.sourcePipelines.forEach(sourcePipeline => {
            const [pipelineType] = sourcePipeline.split('/');
            
            const exporters = newNodes.filter(node => {
              const match = node.data.pipelineType === pipelineType && node.type === 'exporter';
              return match;
            });
            
            allSourceExporters.push(...exporters);
          });
          
          // Find all receivers in target pipelines
          const allTargetReceivers: Node[] = [];
          connectorInfo.targetPipelines.forEach(targetPipeline => {
            const [pipelineType] = targetPipeline.split('/');
            
            const receivers = newNodes.filter(node => {
              const match = node.data.pipelineType === pipelineType && node.type === 'receiver';
              return match;
            });
            
            allTargetReceivers.push(...receivers);
          });
          
          // If we don't have specific exporters/receivers, create direct edges between the connector and all nodes
          if (allSourceExporters.length === 0 || allTargetReceivers.length === 0) {
            
            // Get all nodes from source pipeline types
            const allSourceNodes = newNodes.filter(node => {
              return connectorInfo.sourcePipelines.some(pipeline => {
                const [pipelineType] = pipeline.split('/');
                return node.data.pipelineType === pipelineType;
              });
            });
            
            // Get all nodes from target pipeline types
            const allTargetNodes = newNodes.filter(node => {
              return connectorInfo.targetPipelines.some(pipeline => {
                const [pipelineType] = pipeline.split('/');
                return node.data.pipelineType === pipelineType;
              });
            });
            
            // Create edges from all source nodes to connector
            allSourceNodes.forEach(sourceNode => {
              if (sourceNode.id === connectorNode.id) return; // Skip self-connections
              
              const edgeId = `edge-${sourceNode.id}-${connectorNode.id}`;
              allEdges.push({
                id: edgeId,
                source: sourceNode.id,
                target: connectorNode.id,
                ...styles.connectorEdgeStyle
              });
            });
            
            // Create edges from connector to all target nodes
            allTargetNodes.forEach(targetNode => {
              if (targetNode.id === connectorNode.id) return; // Skip self-connections
              
              const edgeId = `edge-${connectorNode.id}-${targetNode.id}`;
              
              allEdges.push({
                id: edgeId,
                source: connectorNode.id,
                target: targetNode.id,
                ...styles.connectorEdgeStyle
              });
            });
          } else {
            // Create edges from source exporters to connector
            allSourceExporters.forEach(exporter => {
              const edgeId = `edge-${exporter.id}-${connectorNode.id}`;
              
              allEdges.push({
                id: edgeId,
                source: exporter.id,
                target: connectorNode.id,
                ...styles.connectorEdgeStyle
              });
            });
            
            // Create edges from connector to target receivers
            allTargetReceivers.forEach(receiver => {
              const edgeId = `edge-${connectorNode.id}-${receiver.id}`;
              
              allEdges.push({
                id: edgeId,
                source: connectorNode.id,
                target: receiver.id,
                ...styles.connectorEdgeStyle
              });
            });
          }
        });
      }
      
      // Add connector nodes to the final nodes array
      newNodes.push(...connectorNodes);
      
      // Preserve section nodes when setting new nodes from YAML
      setNodes(currentNodes => {
        // Keep all section nodes
        const sectionNodes = currentNodes.filter(node => node.type === 'section');
        // Add the new component nodes
        return [...sectionNodes, ...newNodes];
      });
      
      setEdges(allEdges);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }
  }, [setNodes, setEdges]);

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
