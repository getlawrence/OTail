import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { dump } from 'js-yaml';
import { OtelConfig } from '../types';

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
        pipelines: {},

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
      
      // First pass: identify all connectors that need to be processed separately
      const connectorNodes = new Set<Node>();

      // Collect all connector nodes for special handling
      pipelineNodes.forEach(node => {
        if (node.type === 'connector') {
          connectorNodes.add(node);
        }
      });
      
      // Process regular nodes in the pipeline
      pipelineNodes.forEach(node => {
        if (!node.type) return;
        


        // Skip connector nodes for now, we'll process them separately
        if (node.type === 'connector') return;


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

    // Process all connector nodes after regular components are added to pipelines
    // This ensures that we can correctly identify source and target pipelines
    const allConnectorNodes = nodes.filter(node => node.type === 'connector');
    
    allConnectorNodes.forEach(node => {
      // Add connector config if it doesn't exist
      if (!config.connectors[node.data.label]) {
        config.connectors[node.data.label] = node.data.config || {};
      }
            
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
      
      // Get the source and target pipeline types
      const sourcePipelineType = sourceNodes.length > 0 ? sourceNodes[0]?.data.pipelineType : node.data.pipelineType;
      const targetPipelineType = targetNodes.length > 0 ? targetNodes[0]?.data.pipelineType : null;
      
      if (sourcePipelineType && targetPipelineType) {
        // Find all pipelines of the source and target types
        const sourcePipelineKeys = Object.keys(config.service.pipelines)
          .filter(key => key.startsWith(`${sourcePipelineType}/`));
        
        const targetPipelineKeys = Object.keys(config.service.pipelines)
          .filter(key => key.startsWith(`${targetPipelineType}/`));
        
        // Find the best matching source and target pipelines
        let bestSourcePipeline = sourcePipelineKeys[0];
        let bestTargetPipeline = targetPipelineKeys[0];
        
        // Try to find better matches based on connected nodes
        if (sourceNodes.length > 0) {
          for (const key of sourcePipelineKeys) {
            const pipeline = config.service.pipelines[key];
            const sourceNodeLabels = sourceNodes.map(n => n?.data.label).filter(Boolean) as string[];
            
            const isSourceInPipeline = sourceNodeLabels.some(label => 
              pipeline.receivers.includes(label) || 
              pipeline.processors.includes(label) || 
              pipeline.exporters.includes(label)
            );
            
            if (isSourceInPipeline) {
              bestSourcePipeline = key;
              break;
            }
          }
        }
        
        if (targetNodes.length > 0) {
          for (const key of targetPipelineKeys) {
            const pipeline = config.service.pipelines[key];
            const targetNodeLabels = targetNodes.map(n => n?.data.label).filter(Boolean) as string[];
            
            const isTargetInPipeline = targetNodeLabels.some(label => 
              pipeline.receivers.includes(label) || 
              pipeline.processors.includes(label) || 
              pipeline.exporters.includes(label)
            );
            
            if (isTargetInPipeline) {
              bestTargetPipeline = key;
              break;
            }
          }
        }
        
        // Add connector to the source pipeline as an exporter
        if (bestSourcePipeline && config.service.pipelines[bestSourcePipeline]) {
          if (!config.service.pipelines[bestSourcePipeline].exporters.includes(node.data.label)) {
            config.service.pipelines[bestSourcePipeline].exporters.push(node.data.label);
          }
        }
        
        // Add connector to the target pipeline as a receiver
        if (bestTargetPipeline && config.service.pipelines[bestTargetPipeline]) {
          if (!config.service.pipelines[bestTargetPipeline].receivers.includes(node.data.label)) {
            config.service.pipelines[bestTargetPipeline].receivers.push(node.data.label);
          }
        }
      }
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