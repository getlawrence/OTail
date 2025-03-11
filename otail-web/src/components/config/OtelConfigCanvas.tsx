import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  addEdge,
  Connection,
  Node,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Sidebar } from './Sidebar';
import { ComponentConfigDialog } from './ComponentConfigDialog';
import ReceiverNode from './ReceiverNode';
import ProcessorNode from './ProcessorNode';
import ExporterNode from './ExporterNode';
import { FlowSectionComponent } from './FlowSection';
import { useFlowConfig } from './useFlowConfig';
import { useSectionManager } from './hooks/useSectionManager';
import { usePipelineManager } from './hooks/usePipelineManager';
import { styles, VALID_CONNECTIONS } from './constants';
import type { OtelConfigBuilderProps, PipelineType } from './types';

const OtelConfigCanvasInner = React.forwardRef<{ parseYaml: (yaml: string) => void }, OtelConfigBuilderProps>(({ onChange, initialYaml }, ref) => {
  // Define state for selected node
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Track which section is in full-screen mode (if any)
  const [fullScreenSection, setFullScreenSection] = useState<PipelineType | null>(null); // No section is in full-screen by default

  // Create refs for callbacks to avoid circular dependencies
  const handleToggleExpandRef = useRef<((type: PipelineType, expanded: boolean) => void) | null>(null);

  // Handle section full-screen toggle
  const handleToggleFullScreen = useCallback((type: PipelineType, enterFullScreen: boolean) => {
    setFullScreenSection(enterFullScreen ? type : null);
  }, [fullScreenSection]);


  // Assign callbacks to refs
  useEffect(() => {
    handleToggleExpandRef.current = handleToggleFullScreen; // Repurpose the expand ref for full-screen
  }, [handleToggleFullScreen]);


  // Initialize nodes and edges state
  const initialNodes = useMemo(() => [], []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Use the section manager hook
  const { updateSections, determineSection, getPositionInSection } = useSectionManager({
    fullScreenSection,
    onToggleExpand: handleToggleExpandRef.current,
    setNodes,
    nodes
  });
  
  // Use the pipeline manager hook
  const { parseInitialYaml, createComponentNode, updateNodeConfig } = usePipelineManager({
    setNodes,
    setEdges,
    nodes
  });
  
  // Define node types - cast as any to work around type issues
  const nodeTypes = useMemo(() => ({
    receiver: ReceiverNode as any,
    processor: ProcessorNode as any,
    exporter: ExporterNode as any,
    section: FlowSectionComponent as any, // Add FlowSection as a custom node type
  }), []);
  
  const { generateConfig } = useFlowConfig(nodes, edges, onChange);
  const { project } = useReactFlow();

  const hasParsedYaml = useRef(false); // Keeps track of whether the YAML has been parsed.

  // Update sections when fullScreenSection changes
  useEffect(() => {
    updateSections();
  }, [fullScreenSection, updateSections]);

  useEffect(() => {
    if (initialYaml && !hasParsedYaml.current) {
      parseInitialYaml(initialYaml);
      hasParsedYaml.current = true; // Mark that the YAML has been parsed.
    }
  }, [initialYaml, parseInitialYaml]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode?.type || !targetNode?.type) return;
    if (!VALID_CONNECTIONS[sourceNode.type]?.includes(targetNode.type)) return;
    if (sourceNode.data.pipelineType !== targetNode.data.pipelineType) return;

    setEdges(eds => {
      const newEdges = eds.filter(edge => edge.target !== connection.target);
      return addEdge({
        ...connection,
        style: {
          ...styles.validConnectionStyle,
          zIndex: 1000, // Ensure edges are always on top
          strokeWidth: 2,
          stroke: '#222',
        },
        animated: true,
        zIndex: 1000, // Set zIndex at the edge level too
      }, newEdges);
    });
  }, [nodes, setEdges]);

  // Define drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    const name = event.dataTransfer.getData('component/name');

    if (!type || !name) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = project({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });

    // Determine which section the drop occurred in
    const section = determineSection(position.x, position.y);
    
    // Get position adjusted to the section
    const adjustedPosition = getPositionInSection(position, section);
    
    // Create the component node using the pipeline manager
    createComponentNode(type, name, section, adjustedPosition);
  }, [determineSection, getPositionInSection, createComponentNode, project]);

  // Add effect to generate YAML when nodes or edges change
  useEffect(() => {
    generateConfig();
  }, [nodes, edges, generateConfig]);

  // Expose parseYaml method through ref
  React.useImperativeHandle(ref, () => ({
    parseYaml: (yaml: string) => {
      parseInitialYaml(yaml);
    }
  }));

  return (
    <div className="h-full relative">
      <div className="absolute inset-0" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Strict}
          nodeTypes={nodeTypes}
          className="bg-transparent"
          elementsSelectable={true}
          defaultEdgeOptions={{ 
            type: 'smoothstep', 
            animated: true, 
            zIndex: 1000, // Ensure edges are always on top
            style: {
              strokeWidth: 2,
              stroke: '#222',
              zIndex: 1000, // Ensure edges are always on top
            }
          }}
          onNodeClick={(_event, node) => {
            // Skip section nodes to prevent errors
            if (node.type === 'section') {
              return;
            }
            setSelectedNode(node);
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.25}
          maxZoom={2}
          snapToGrid={true}
          snapGrid={[15, 15]}
          zoomOnScroll={true}
          panOnScroll={true}
          panOnDrag={true}
          selectionOnDrag={true}
          fitView={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
        </ReactFlow>
      </div>
      <Sidebar />
      {selectedNode && (
        <ComponentConfigDialog
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onConfigUpdate={updateNodeConfig}
        />
      )}
    </div>
  );
});

const OtelConfigCanvas = React.forwardRef<{ parseYaml: (yaml: string) => void }, OtelConfigBuilderProps>((props, ref) => {
  return (
    <ReactFlowProvider>
      <OtelConfigCanvasInner {...props} ref={ref} />
    </ReactFlowProvider>
  );
});

export default OtelConfigCanvas;