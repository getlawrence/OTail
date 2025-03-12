import { useCallback } from 'react';
import { Node, Edge, Position } from 'reactflow';
import { load } from 'js-yaml';
import { styles, LAYOUT_CONFIG } from '../constants';
import type { OtelConfig, SectionType } from '../types';

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
      const newEdges: Edge[] = [];
      const connectorNodes: Node[] = [];
      const connectorMap = new Map<string, { sourcePipelines: string[], targetPipelines: string[] }>();
      const connectorNames = new Set<string>();

      // Identify all connectors first to avoid creating duplicate nodes
      if (config.connectors) {
        Object.keys(config.connectors).forEach(connectorName => {
          connectorNames.add(connectorName);
          connectorMap.set(connectorName, { sourcePipelines: [], targetPipelines: [] });
        });
      }

      // Process each pipeline in the config
      Object.entries(config.service?.pipelines || {}).forEach(([pipelineKey, pipeline]) => {
        const [pipelineType, _] = pipelineKey.split('/');

        const createNodes = (
          components: string[],
          type: 'receiver' | 'processor' | 'exporter',
          startX: number,
          y: number
        ) => {
          return components
            .filter(label => !connectorNames.has(label)) // Skip connectors, we'll create them separately
            .map((label, index) => ({
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
        const receiverNodes = createNodes(pipeline.receivers || [], 'receiver', 50, 50);
        const processorNodes = createNodes(pipeline.processors || [], 'processor', 300, 50);
        const exporterNodes = createNodes(pipeline.exporters || [], 'exporter', 550, 50);

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
        if (receiverNodes.length && exporterNodes.length && processorNodes.length === 0) {
          newEdges.push(...createEdges(receiverNodes, exporterNodes));
        }
        
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
      
      // Process connectors after all pipeline nodes are created
      if (config.connectors) {
        Object.entries(config.connectors).forEach(([connectorName, connectorConfig]) => {
          const connectorInfo = connectorMap.get(connectorName);
          if (!connectorInfo || connectorInfo.sourcePipelines.length === 0 || connectorInfo.targetPipelines.length === 0) {
            console.log(`No valid pipeline connections found for connector: ${connectorName}`);
            return;
          }
          
          // Get the first source and target pipeline for placement
          const sourcePipeline = connectorInfo.sourcePipelines[0];
          const targetPipeline = connectorInfo.targetPipelines[0];
          
          const [sourceType] = sourcePipeline.split('/');
          const [targetType] = targetPipeline.split('/');
          
          console.log(`Connector ${connectorName} connects from ${sourcePipeline} to ${targetPipeline}`);
          
          // Create connector node in the source pipeline section
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
          
          console.log('All nodes in newNodes:', newNodes.map(n => ({ id: n.id, type: n.type, pipeline: n.data.pipelineType })));

          // Create direct edges between exporters and receivers through the connector
          // This is a simpler approach that should work regardless of pipeline structure
          
          // Find all exporters in source pipelines
          const allSourceExporters: Node[] = [];
          connectorInfo.sourcePipelines.forEach(sourcePipeline => {
            const [pipelineType] = sourcePipeline.split('/');
            console.log(`Looking for exporters in source pipeline type: ${pipelineType}`);
            
            const exporters = newNodes.filter(node => {
              const match = node.data.pipelineType === pipelineType && node.type === 'exporter';
              console.log(`Node ${node.id}: pipelineType=${node.data.pipelineType}, nodeType=${node.type}, isMatch=${match}`);
              return match;
            });
            
            console.log(`Found ${exporters.length} exporters in ${pipelineType}:`, exporters.map(e => e.id));
            allSourceExporters.push(...exporters);
          });
          
          // Find all receivers in target pipelines
          const allTargetReceivers: Node[] = [];
          connectorInfo.targetPipelines.forEach(targetPipeline => {
            const [pipelineType] = targetPipeline.split('/');
            console.log(`Looking for receivers in target pipeline type: ${pipelineType}`);
            
            const receivers = newNodes.filter(node => {
              const match = node.data.pipelineType === pipelineType && node.type === 'receiver';
              console.log(`Node ${node.id}: pipelineType=${node.data.pipelineType}, nodeType=${node.type}, isMatch=${match}`);
              return match;
            });
            
            console.log(`Found ${receivers.length} receivers in ${pipelineType}:`, receivers.map(r => r.id));
            allTargetReceivers.push(...receivers);
          });
          
          console.log(`Total source exporters: ${allSourceExporters.length}, Total target receivers: ${allTargetReceivers.length}`);
          
          // If we don't have specific exporters/receivers, create direct edges between the connector and all nodes
          if (allSourceExporters.length === 0 || allTargetReceivers.length === 0) {
            console.log('No specific exporters/receivers found, creating direct edges between all nodes');
            
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
            
            console.log(`Creating edges between ${allSourceNodes.length} source nodes and ${allTargetNodes.length} target nodes`);
            
            // Create edges from all source nodes to connector
            allSourceNodes.forEach(sourceNode => {
              if (sourceNode.id === connectorNode.id) return; // Skip self-connections
              
              const edgeId = `edge-${sourceNode.id}-${connectorNode.id}`;
              console.log(`Creating edge from ${sourceNode.id} to connector ${connectorNode.id}`);
              
              newEdges.push({
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
              console.log(`Creating edge from connector ${connectorNode.id} to ${targetNode.id}`);
              
              newEdges.push({
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
              console.log(`Creating edge from exporter ${exporter.id} to connector ${connectorNode.id}`);
              
              newEdges.push({
                id: edgeId,
                source: exporter.id,
                target: connectorNode.id,
                ...styles.connectorEdgeStyle
              });
            });
            
            // Create edges from connector to target receivers
            allTargetReceivers.forEach(receiver => {
              const edgeId = `edge-${connectorNode.id}-${receiver.id}`;
              console.log(`Creating edge from connector ${connectorNode.id} to receiver ${receiver.id}`);
              
              newEdges.push({
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
      
      setEdges(newEdges);
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
      ...styles.validConnectionStyle, // Use all properties from the style definition
    };

    setEdges(edges => [...edges, newEdge]);
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
