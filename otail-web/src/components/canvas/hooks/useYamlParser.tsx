import { useCallback } from 'react';
import { Node, Edge, Position } from 'reactflow';
import { load } from 'js-yaml';
import { LAYOUT_CONFIG, styles, PIPELINE_SECTIONS } from '../constants';
import type { OtelConfig, PipelineType } from '../types';

interface UseYamlParserProps {
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export function useYamlParser({ setNodes, setEdges }: UseYamlParserProps) {
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

        const baseY = Object.keys(PIPELINE_SECTIONS).indexOf(pipelineType as PipelineType) * (LAYOUT_CONFIG.SECTION_HEIGHT / 3) + 50;

        // Create nodes for each component type
        const receiverNodes = createNodes(pipeline.receivers || [], 'receiver', 50, baseY);
        const processorNodes = createNodes(pipeline.processors || [], 'processor', 300, baseY);
        const exporterNodes = createNodes(pipeline.exporters || [], 'exporter', 550, baseY);

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

  return { parseInitialYaml } as const;
}
