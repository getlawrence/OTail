import { useCallback } from 'react';
import { Node, Edge, Position } from 'reactflow';
import { load } from 'js-yaml';
import { styles, LAYOUT_CONFIG } from '../constants';
import type { OtelConfig, PipelineType } from '../types';

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

      // Process each pipeline in the config
      Object.entries(config.service?.pipelines || {}).forEach(([pipelineKey, pipeline]) => {
        const [pipelineType, _] = pipelineKey.split('/');

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
        if (receiverNodes.length && exporterNodes.length) {
          newEdges.push(...createEdges(receiverNodes, exporterNodes));
        }
      });
      
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
    section: PipelineType, 
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
      style: styles.validConnectionStyle,
      animated: true,
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
