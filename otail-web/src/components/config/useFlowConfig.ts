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

          // Get the connector's pipeline type (where it's placed in the UI)
          const connectorPipelineType = node.data.pipelineType;
          
          // Get the connector's configuration
          const connectorConfig = config.connectors[node.data.label];
          
          // Determine source and target pipelines based on actual connections
          // Find incoming edges to this connector
          const incomingEdges = edges.filter(edge => edge.target === node.id);
          
          // Find outgoing edges from this connector
          const outgoingEdges = edges.filter(edge => edge.source === node.id);
          
          // Find the source nodes (nodes that have edges pointing to this connector)
          const sourceNodes = incomingEdges.map(edge => 
            nodes.find(n => n.id === edge.source)
          ).filter(Boolean);
          
          // Find the target nodes (nodes that this connector points to)
          const targetNodes = outgoingEdges.map(edge => 
            nodes.find(n => n.id === edge.target)
          ).filter(Boolean);
          
          // Get the source pipeline type from the connector config
          const sourcePipelineType = connectorConfig.source_pipeline || connectorPipelineType;
          
          // Get the target pipeline type from the connector config
          const targetPipelineType = connectorConfig.target_pipeline || 
            (targetNodes.length > 0 && targetNodes[0] ? targetNodes[0].data.pipelineType : null);
          
          // If we have source and target pipeline types
          if (sourcePipelineType && targetPipelineType) {
            // Find all pipelines of the source type
            const sourcePipelineKeys = Object.keys(config.service.pipelines)
              .filter(key => key.startsWith(`${sourcePipelineType}/`));
            
            // Find all pipelines of the target type
            const targetPipelineKeys = Object.keys(config.service.pipelines)
              .filter(key => key.startsWith(`${targetPipelineType}/`));
            
            // Find the specific source pipeline that contains the source nodes
            let sourcePipelineKey = sourcePipelineKeys[0]; // Default to first pipeline if no better match
            if (sourceNodes.length > 0) {
              // Try to find a more specific source pipeline based on connected nodes
              for (const key of sourcePipelineKeys) {
                const pipeline = config.service.pipelines[key];
                const sourceNodeLabels = sourceNodes.map(n => n?.data.label).filter(Boolean) as string[];
                
                // Check if any source node is in this pipeline
                const isSourceInPipeline = sourceNodeLabels.some(label => 
                  pipeline.receivers.includes(label) || 
                  pipeline.processors.includes(label) || 
                  pipeline.exporters.includes(label)
                );
                
                if (isSourceInPipeline) {
                  sourcePipelineKey = key;
                  break;
                }
              }
            }
            
            // Find the specific target pipeline that contains the target nodes
            let targetPipelineKey = targetPipelineKeys[0]; // Default to first pipeline if no better match
            if (targetNodes.length > 0) {
              // Try to find a more specific target pipeline based on connected nodes
              for (const key of targetPipelineKeys) {
                const pipeline = config.service.pipelines[key];
                const targetNodeLabels = targetNodes.map(n => n?.data.label).filter(Boolean) as string[];
                
                // Check if any target node is in this pipeline
                const isTargetInPipeline = targetNodeLabels.some(label => 
                  pipeline.receivers.includes(label) || 
                  pipeline.processors.includes(label) || 
                  pipeline.exporters.includes(label)
                );
                
                if (isTargetInPipeline) {
                  targetPipelineKey = key;
                  break;
                }
              }
            }
            
            // Add connector to the exporters of source pipeline
            if (sourcePipelineKey && config.service.pipelines[sourcePipelineKey]) {
              if (!config.service.pipelines[sourcePipelineKey].exporters.includes(node.data.label)) {
                config.service.pipelines[sourcePipelineKey].exporters.push(node.data.label);
              }
            }
            
            // Add connector to the receivers of target pipeline
            if (targetPipelineKey && config.service.pipelines[targetPipelineKey]) {
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