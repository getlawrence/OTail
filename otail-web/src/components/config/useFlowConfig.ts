import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { dump } from 'js-yaml';
import { OtelConfig } from './types';

// Helper to create a graph representation for finding connected components
const createAdjacencyList = (nodes: Node[], edges: Edge[]) => {
  const graph = new Map<string, Set<string>>();

  nodes.forEach(node => {
    graph.set(node.id, new Set());
  });

  edges.forEach(edge => {
    const sourceNeighbors = graph.get(edge.source);
    const targetNeighbors = graph.get(edge.target);

    if (sourceNeighbors) sourceNeighbors.add(edge.target);
    if (targetNeighbors) targetNeighbors.add(edge.source);
  });

  return graph;
};

export const useFlowConfig = (nodes: Node[], edges: Edge[], onChange?: (yaml: string) => void) => {
  const generateConfig = useCallback(() => {
    const config: OtelConfig = {
      receivers: {},
      processors: {},
      exporters: {},
      connectors: {},
      service: {
        pipelines: {}
      }
    };

    // If there are no nodes, return empty config
    if (nodes.length === 0) {
      const yaml = dump(config, {
        noRefs: true,
        lineWidth: -1,
        forceQuotes: false,
      });
      onChange?.(yaml);
      return;
    }

    // Create adjacency list for graph traversal
    const graph = createAdjacencyList(nodes, edges);

    // Track processed nodes to avoid duplicates
    const processedNodes = new Set<string>();

    // Find all connected components in the graph
    const findConnectedComponents = (nodeId: string, pipelineKey: string, component: Set<Node>) => {
      if (processedNodes.has(nodeId)) return;

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      processedNodes.add(nodeId);
      component.add(node);

      const neighbors = graph.get(nodeId);
      if (!neighbors) return;

      neighbors.forEach(neighborId => {
        const neighborNode = nodes.find(n => n.id === neighborId);
        if (neighborNode?.data.pipelineType === node.data.pipelineType) {
          findConnectedComponents(neighborId, pipelineKey, component);
        }
      });
    };

    // Group nodes by pipeline
    const pipelineGroups = new Map<string, Set<Node>>();

    nodes.forEach(node => {
      if (processedNodes.has(node.id)) return;

      const pipelineKey = `${node.data.pipelineType}/${node.data.pipelineName}`;
      const component = new Set<Node>();

      findConnectedComponents(node.id, pipelineKey, component);

      if (component.size > 0) {
        // Merge with existing pipeline if it exists
        const existingComponent = pipelineGroups.get(pipelineKey);
        if (existingComponent) {
          component.forEach(n => existingComponent.add(n));
        } else {
          pipelineGroups.set(pipelineKey, component);
        }
      }
    });

    // Process each pipeline group
    pipelineGroups.forEach((pipelineNodes, pipelineKey) => {
      const [pipelineType, pipelineName] = pipelineKey.split('/');
      const fullPipelineKey = `${pipelineType}/${pipelineName}`;

      // Initialize pipeline if it doesn't exist
      if (!config.service.pipelines[fullPipelineKey]) {
        config.service.pipelines[fullPipelineKey] = {
          receivers: [],
          processors: [],
          exporters: []
        };
      }

      // Process nodes in the pipeline
      pipelineNodes.forEach(node => {
        if (!node.type) return;

        const componentType = `${node.type}s` as 'receivers' | 'processors' | 'exporters';
        const pipelineArrayKey = componentType;
        const pipelineArray = config.service.pipelines[fullPipelineKey][pipelineArrayKey];

        // Add component config if it doesn't exist
        if (componentType in config) {
          if (!config[componentType][node.data.label]) {
            config[componentType][node.data.label] = node.data.config || {};
          }
        }

        // Add component to pipeline if it's not already there
        if (!pipelineArray.includes(node.data.label)) {
          pipelineArray.push(node.data.label);
        }
      });
    });

    // Generate YAML
    const yaml = dump(config, {
      noRefs: true,
      lineWidth: -1,
      forceQuotes: false,
      sortKeys: true // Ensure consistent output
    });

    onChange?.(yaml);
  }, [nodes, edges, onChange]);

  return { generateConfig };
};