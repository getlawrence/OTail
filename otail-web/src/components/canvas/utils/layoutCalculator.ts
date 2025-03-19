import dagre from '@dagrejs/dagre';
import { Node, Edge } from 'reactflow';
import { LAYOUT_CONFIG } from '../constants';

export interface LayoutOptions {
  direction?: 'LR' | 'TB';
  nodeSpacing?: number;
  rankSpacing?: number;
  marginX?: number;
  marginY?: number;
  fitWithinBounds?: boolean;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  headerHeight?: number;
}

export function calculateNodeLayout<T extends Node>(
  nodes: T[],
  edges: Edge[],
  options: LayoutOptions = {}
): T[] {
  if (nodes.length === 0) return nodes;

  const {
    direction = 'LR',
    nodeSpacing = 50,
    rankSpacing = 50,
    marginX = 20,
    marginY = 20,
    fitWithinBounds = false,
    bounds = { x: 0, y: 0, width: 1000, height: 800 },
    headerHeight = 40
  } = options;

  // Create dagre graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph direction and spacing
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: marginX,
    marginy: marginY,
  });

  // Add nodes to dagre graph with their dimensions
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, {
      width: node.width || LAYOUT_CONFIG.NODE_WIDTH || 150,
      height: node.height || LAYOUT_CONFIG.NODE_HEIGHT || 50,
    });
  });

  // Add edges to dagre graph
  edges.forEach(edge => {
    if (edge.source && edge.target) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Apply the calculated layout with adjustments
  return nodes.map(node => {
    const dagreNode = dagreGraph.node(node.id);
    
    // Skip if dagre node is not found
    if (!dagreNode) return node;

    // Calculate position
    let x = dagreNode.x - (dagreNode.width / 2);
    let y = dagreNode.y - (dagreNode.height / 2);

    // If we need to fit within bounds
    if (fitWithinBounds && bounds) {
      const padding = 20;
      
      // Ensure node stays within section boundaries
      x = Math.max(
        bounds.x + padding,
        Math.min(x, bounds.x + bounds.width - (node.width || 150) - padding)
      );
      
      y = Math.max(
        bounds.y + padding + (headerHeight || 0),
        Math.min(y, bounds.y + bounds.height - (node.height || 50) - padding)
      );
    }

    // Apply the calculated position to the node
    return {
      ...node,
      position: {
        x,
        y,
      },
    };
  }) as T[];
} 