import * as dagre from '@dagrejs/dagre';
import { Node, Edge } from 'reactflow';

const NODE_WIDTH = 150;
const NODE_HEIGHT = 40;

export const COLUMN_WIDTH = 180;
export const COLUMN_GAP = 80; // Gap between columns
export const PIPELINE_HEIGHT = 400;
export const PIPELINE_SPACING = 500;
export const COMPONENT_GAP = 500; // Gap between receivers and exporters in the same pipeline


function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = true;
  dagreGraph.setGraph({
    rankdir: isHorizontal ? 'LR' : 'TB',
    nodesep: 20,
    ranksep: 100,
    edgesep: 20,
    marginx: 0,
    marginy: 0,
    align: 'DL',
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      rank: getRank(node.type)
    });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Layout the graph
  dagre.layout(dagreGraph);

  // Get node positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2
      }
    };
  });

  return layoutedNodes;
}

function getRank(type: string | undefined): number {
  switch (type) {
    case 'receiver':
      return 0;
    case 'processor':
      return 1;
    case 'exporter':
      return 2;
    default:
      return 1;
  }
}

function groupNodesByType(nodes: Node[]) {
  return nodes.reduce((groups, node) => {
    const type = node.type || 'unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(node);
    return groups;
  }, {} as Record<string, Node[]>);
}

export function calculateNodeLayout<T extends Node>(
  nodes: T[],
  edges: Edge[]
): T[] {
  if (nodes.length === 0) return nodes;

  // Handle single node case
  if (nodes.length === 1) {
    return [{
      ...nodes[0],
      position: { x: 0, y: 0 }
    }] as T[];
  }

  // First, get a basic layout using dagre
  let layoutedNodes = getLayoutedElements(nodes, edges);

  const pipelineGroups = groupNodesByPipeline(layoutedNodes, edges);

  // Get the x positions for each column
  const columnPositions = {
    receiver: 0,
    processor: COLUMN_WIDTH,
    exporter: COLUMN_WIDTH * 2
  };

  // Set x positions for all nodes
  layoutedNodes = layoutedNodes.map(node => {
    const position = { ...node.position };
    if (node.type === 'receiver') {
      position.x = columnPositions.receiver;
    } else if (node.type === 'processor') {
      position.x = columnPositions.processor;
    } else if (node.type === 'exporter') {
      position.x = columnPositions.exporter;
    }
    return { ...node, position };
  });

  // Position nodes by pipeline type
  Array.from(pipelineGroups.entries()).forEach(([_pipelineType, pipelineNodes], index) => {
    const pipelineY = index * (PIPELINE_HEIGHT + PIPELINE_SPACING * 1.5);

    // Position nodes within the pipeline
    const pipelineNodesByType = groupNodesByType(pipelineNodes);

    // Position receivers
    const receivers = pipelineNodesByType.receiver || [];
    const receiverSpacing = PIPELINE_HEIGHT / (receivers.length + 1);
    receivers.forEach((node, idx) => {
      const nodeToAdjust = layoutedNodes.find(n => n.id === node.id);
      if (nodeToAdjust) {
        nodeToAdjust.position.x = columnPositions.receiver;
        nodeToAdjust.position.y = pipelineY + ((idx + 1) * (receiverSpacing + COMPONENT_GAP));
      }
    });

    // Position exporters
    const exporters = pipelineNodesByType.exporter || [];
    const exporterSpacing = PIPELINE_HEIGHT / (exporters.length + 1);
    exporters.forEach((node, idx) => {
      const nodeToAdjust = layoutedNodes.find(n => n.id === node.id);
      if (nodeToAdjust) {
        nodeToAdjust.position.x = columnPositions.exporter;
        nodeToAdjust.position.y = pipelineY + PIPELINE_HEIGHT + ((idx + 1) * (exporterSpacing + COMPONENT_GAP));
      }
    });

    // Calculate average positions for receivers and exporters
    const receiverPositions = receivers.map(n => {
      const node = layoutedNodes.find(ln => ln.id === n.id);
      return node ? node.position.y : pipelineY;
    });
    const exporterPositions = exporters.map(n => {
      const node = layoutedNodes.find(ln => ln.id === n.id);
      return node ? node.position.y : pipelineY + PIPELINE_HEIGHT;
    });

    const avgReceiverY = receiverPositions.length > 0
      ? receiverPositions.reduce((a, b) => a + b) / receiverPositions.length
      : pipelineY;
    const avgExporterY = exporterPositions.length > 0
      ? exporterPositions.reduce((a, b) => a + b) / exporterPositions.length
      : pipelineY + PIPELINE_HEIGHT;

    // Position processors in a chain, centered between receivers and exporters
    const processors = pipelineNodesByType.processor || [];
    const centerY = (avgReceiverY + avgExporterY) / 2;
    const processorSpacing = 0; // Small vertical spacing between processors in the chain
    const totalProcessorHeight = (processors.length - 1) * processorSpacing;
    const startY = centerY - totalProcessorHeight / 2;

    // Sort processors by ID to ensure consistent ordering
    const sortedProcessors = [...processors].sort((a, b) => {
      const aNum = parseInt(a.id.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.id.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });

    // Position processors in their individual columns
    sortedProcessors.forEach((processor, idx) => {
      const processorNode = layoutedNodes.find(n => n.id === processor.id);
      if (processorNode) {
        // Position processors sequentially after receivers with gap
        processorNode.position.x = COLUMN_WIDTH + COLUMN_GAP + (idx * (COLUMN_WIDTH + COLUMN_GAP));
        processorNode.position.y = startY + idx * processorSpacing;
      }
    });

    // Position receivers in their column
    receivers.forEach((node, idx) => {
      const nodeToAdjust = layoutedNodes.find(n => n.id === node.id);
      if (nodeToAdjust) {
        nodeToAdjust.position.x = 0; // First column
        // Calculate fade effect - nodes closer to center have more spacing
        const distanceFromCenter = Math.abs((idx + 1) - (receivers.length + 1) / 2);
        const spacingMultiplier = 1 + (distanceFromCenter * 0.2); // 20% more spacing for outer nodes
        nodeToAdjust.position.y = pipelineY + ((idx + 1) * receiverSpacing * spacingMultiplier);
      }
    });

    // Position exporters in their column after all processors
    exporters.forEach((node, idx) => {
      const nodeToAdjust = layoutedNodes.find(n => n.id === node.id);
      if (nodeToAdjust) {
        // Position exporters after all processors with gap
        nodeToAdjust.position.x = COLUMN_WIDTH + COLUMN_GAP + (processors.length * (COLUMN_WIDTH + COLUMN_GAP));
        // Calculate fade effect - nodes closer to center have more spacing
        const distanceFromCenter = Math.abs((idx + 1) - (exporters.length + 1) / 2);
        const spacingMultiplier = 1 + (distanceFromCenter * 0.2); // 20% more spacing for outer nodes
        nodeToAdjust.position.y = pipelineY + ((idx + 1) * (exporterSpacing + COMPONENT_GAP) * spacingMultiplier);
      }
    });
  });

  return layoutedNodes as T[];
}

function groupNodesByPipeline(nodes: Node[], _edges: Edge[]): Map<string, Node[]> {
  const pipelineGroups = new Map<string, Node[]>();

  // First, group by pipeline type
  nodes.forEach(node => {
    const pipelineType = node.data?.pipelineType;
    if (pipelineType) {
      if (!pipelineGroups.has(pipelineType)) {
        pipelineGroups.set(pipelineType, []);
      }
      pipelineGroups.get(pipelineType)?.push(node);
    }
  });

  return pipelineGroups;
}

