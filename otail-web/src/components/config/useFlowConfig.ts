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

    // Find connected components (pipelines) within each section
    const pipelines: Array<{ sectionType: string, nodes: Set<Node>, id: number }> = [];
    let pipelineIdCounter = 1;

    // Process each node that hasn't been processed yet
    nodes.forEach(node => {
      // Skip if already processed, not a component node, or a section node
      if (processedNodes.has(node.id) || !node.data?.pipelineType || node.type === 'section') return;

      const sectionType = node.data.pipelineType; // traces, metrics, logs
      const connectedNodes = new Set<Node>();

      // Find all nodes connected to this one
      findConnectedComponents(node.id, sectionType, connectedNodes);

      if (connectedNodes.size > 0) {
        // Create a new pipeline with these connected nodes
        pipelines.push({
          sectionType,
          nodes: connectedNodes,
          id: pipelineIdCounter++
        });
      }
    });

    // Process each pipeline to create YAML configuration
    pipelines.forEach(pipeline => {
      const { sectionType, nodes: pipelineNodes, id } = pipeline;
      
      // Skip empty pipelines
      if (pipelineNodes.size === 0) return;
      
      // Create a pipeline key using section type and pipeline ID
      // For example: 'traces/pipeline1', 'metrics/pipeline2'
      const pipelineKey = `${sectionType}/pipeline${id}`;
      
      // Initialize pipeline if it doesn't exist
      if (!config.service.pipelines[pipelineKey]) {
        config.service.pipelines[pipelineKey] = {
          receivers: [],
          processors: [],
          exporters: []
        };
      }

      // Process nodes in the pipeline
      pipelineNodes.forEach(node => {
        if (!node.type) return;

        // Special handling for connector nodes
        if (node.type === 'connector') {
          // Add connector config if it doesn't exist
          if (!config.connectors[node.data.label]) {
            config.connectors[node.data.label] = node.data.config || {};
          }

          // For connectors, we need to handle both source and target pipelines
          // The connector config should specify which pipelines it connects
          const connectorConfig = config.connectors[node.data.label];
          
          // If the connector has source and target pipeline types specified
          if (connectorConfig.source_pipeline && connectorConfig.target_pipeline) {
            // Find source and target pipeline keys based on pipeline types
            const sourcePipelineKeys = Object.keys(config.service.pipelines)
              .filter(key => key.startsWith(`${connectorConfig.source_pipeline}/`));
            
            const targetPipelineKeys = Object.keys(config.service.pipelines)
              .filter(key => key.startsWith(`${connectorConfig.target_pipeline}/`));
            
            // Add connector to the exporters of source pipeline
            if (sourcePipelineKeys.length > 0) {
              const sourcePipelineKey = sourcePipelineKeys[0];
              if (!config.service.pipelines[sourcePipelineKey].exporters.includes(node.data.label)) {
                config.service.pipelines[sourcePipelineKey].exporters.push(node.data.label);
              }
            }
            
            // Add connector to the receivers of target pipeline
            if (targetPipelineKeys.length > 0) {
              const targetPipelineKey = targetPipelineKeys[0];
              if (!config.service.pipelines[targetPipelineKey].receivers.includes(node.data.label)) {
                config.service.pipelines[targetPipelineKey].receivers.push(node.data.label);
              }
            }
          }
          return;
        }

        const componentType = `${node.type}s` as 'receivers' | 'processors' | 'exporters';
        const pipelineArrayKey = componentType;
        const pipelineArray = config.service.pipelines[pipelineKey][pipelineArrayKey];

        // Add component config if it doesn't exist
        if (componentType in config) {
          if (!config[componentType][node.data.label]) {
            config[componentType][node.data.label] = node.data.config || {};
          }
        }

        // Add component to pipeline if it's not already there
        if (pipelineArray && !pipelineArray.includes(node.data.label)) {
          pipelineArray.push(node.data.label);
        }
      });
    });

    // Remove empty pipelines
    Object.keys(config.service.pipelines).forEach(pipelineKey => {
      const pipeline = config.service.pipelines[pipelineKey];
      const hasComponents = 
        pipeline.receivers.length > 0 || 
        pipeline.processors.length > 0 || 
        pipeline.exporters.length > 0;
      
      if (!hasComponents) {
        delete config.service.pipelines[pipelineKey];
      }
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