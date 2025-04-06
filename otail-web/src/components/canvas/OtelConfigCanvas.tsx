import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { trackCanvas } from './analytics';
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
import { ComponentConfigDialog } from './dialog/ComponentConfigDialog';
import { ReceiverNode, ProcessorNode, ExporterNode, ConnectorNode } from './nodes';
import { FlowSectionComponent } from './FlowSection';
import { useFlowConfig } from './hooks/useFlowConfig';
import { useSectionManager } from './hooks/useSectionManager';
import { usePipelineManager } from './hooks/usePipelineManager';
import { styles, VALID_CONNECTIONS } from './constants';
import type { OtelConfigBuilderProps, SectionType } from './types';

const OtelConfigCanvasInner = React.forwardRef<{ parseYaml: (yaml: string) => void }, OtelConfigBuilderProps>(({ onChange, initialYaml }, ref) => {
  // Define state for selected node
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Track which section is in full-screen mode (if any)
  const [fullScreenSection, setFullScreenSection] = useState<SectionType | null>(null); // No section is in full-screen by default
  
  // Track which sections are collapsed
  const [collapsedSections, setCollapsedSections] = useState<SectionType[]>([]); // No sections collapsed by default
  

  // Handle section full-screen toggle
  const handleToggleFullScreen = useCallback((type: SectionType, enterFullScreen: boolean) => {
    setFullScreenSection(enterFullScreen ? type : null);
    
    // If entering full-screen, ensure the section is not collapsed
    if (enterFullScreen) {
      setCollapsedSections(prev => prev.filter(section => section !== type));
    }
  }, []);

  // Handle section collapse/expand toggle
  const handleToggleCollapse = useCallback((type: SectionType, collapsed: boolean) => {
    setCollapsedSections(prev => {
      let newState;
      
      // If we're collapsing and it's not already in the array, add it
      if (collapsed && !prev.includes(type)) {
        newState = [...prev, type];
        return newState;
      }
      // If we're expanding and it's in the array, remove it
      if (!collapsed && prev.includes(type)) {
        newState = prev.filter(section => section !== type);
        return newState;
      }
      // Otherwise return the current state unchanged
      return prev;
    });
  }, []);


  const hasParsedYaml = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);
  const lastUpdateRef = useRef<{ fullScreenSection: SectionType | null, collapsedSections: SectionType[] }>({
    fullScreenSection: null,
    collapsedSections: []
  });

  // Initialize nodes and edges state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Use the section manager hook
  const { updateSections, determineSection, getPositionInSection, createSectionNodes } = useSectionManager({
    fullScreenSection,
    collapsedSections,
    onToggleExpand: handleToggleFullScreen,
    onToggleCollapse: handleToggleCollapse,
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
    receivers: ReceiverNode as any,
    processors: ProcessorNode as any,
    exporters: ExporterNode as any,
    connectors: ConnectorNode as any,

    section: FlowSectionComponent as any, // Add FlowSection as a custom node type
  }), []);
  
  const { generateConfig } = useFlowConfig(nodes, edges, onChange);
  const { screenToFlowPosition } = useReactFlow();

  // Initialize sections on mount
  useEffect(() => {
    const sectionNodes = createSectionNodes();
    setNodes(sectionNodes);
  }, [createSectionNodes, setNodes]);

  // Update sections when relevant state changes
  useEffect(() => {
    // Check if we actually need to update
    const needsUpdate = 
      fullScreenSection !== lastUpdateRef.current.fullScreenSection ||
      JSON.stringify(collapsedSections) !== JSON.stringify(lastUpdateRef.current.collapsedSections);

    if (!needsUpdate) {
      return;
    }

    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Skip if we're already updating
    if (isUpdatingRef.current) {
      return;
    }

    console.log('Updating sections...');
    isUpdatingRef.current = true;

    // Schedule the update
    updateTimeoutRef.current = setTimeout(() => {
      try {
        // Get current non-section nodes
        const nonSectionNodes = nodes.filter(node => node.type !== 'section');
        
        // Create new section nodes
        const sectionNodes = createSectionNodes();
        
        // Update nodes state, ensuring section nodes are first
        setNodes(() => [...sectionNodes, ...nonSectionNodes]);
        
        // Update last update ref
        lastUpdateRef.current = {
          fullScreenSection,
          collapsedSections
        };
      } finally {
        isUpdatingRef.current = false;
      }
    }, 0);

    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      isUpdatingRef.current = false;
    };
  }, [fullScreenSection, collapsedSections, createSectionNodes, setNodes, nodes]);

  // Parse YAML when it changes
  useEffect(() => {
    if (initialYaml && !hasParsedYaml.current) {
      parseInitialYaml(initialYaml);
      hasParsedYaml.current = true;
    }
  }, [initialYaml, parseInitialYaml]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode?.type || !targetNode?.type) {
      console.warn('Invalid connection: source or target node not found');
      return;
    }
    if (!VALID_CONNECTIONS[sourceNode.type]?.includes(targetNode.type)){
      console.warn(`Invalid connection: ${sourceNode.type} -> ${targetNode.type}`);
      return;
    }
    
    // Allow connectors to connect between different pipeline types
    // For non-connector nodes, ensure they're in the same pipeline
    const isConnector = sourceNode.type === 'connectors' || targetNode.type === 'connectors';
    if (!isConnector && sourceNode.data.pipelineType !== targetNode.data.pipelineType) {
      console.warn(`Invalid connection: ${sourceNode.type} -> ${targetNode.type}`);
      return;
    }

    // Track connection creation
    trackCanvas.connection.create(
      sourceNode.type,
      sourceNode.data.name || 'unknown',
      targetNode.type,
      targetNode.data.name || 'unknown'
    );

    setEdges(eds => {
      let existingEdges = eds;

      // Handle processor to processor connections (1-to-1)
      if (sourceNode.type === 'processor' && targetNode.type === 'processor') {
        // Remove any existing connections where this source connects to any processor
        existingEdges = eds.filter(edge => 
          !(edge.source === connection.source && 
            nodes.find(n => n.id === edge.target)?.type === 'processor')
        );
        // Remove any existing connections to this target from any processor
        existingEdges = existingEdges.filter(edge => 
          !(edge.target === connection.target && 
            nodes.find(n => n.id === edge.source)?.type === 'processor')
        );
      }
      // Handle other cases where we don't want multiple incoming connections
      else if (targetNode.type !== 'processor' && targetNode.type !== 'exporter') {
        // Remove existing connections to the target
        existingEdges = eds.filter(edge => edge.target !== connection.target);
      }

      return addEdge({
        ...connection,
        style: {
          ...styles.validConnectionStyle,
          zIndex: 1000,
          strokeWidth: 2,
          stroke: '#222',
        },
        animated: true,
        zIndex: 1000,
      }, existingEdges);
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

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    // Determine which section the drop occurred in
    const section = determineSection(position.x, position.y);
    
    // Get position adjusted to the section
    const adjustedPosition = getPositionInSection(position, section);
    
    // Track component addition
    trackCanvas.component.add(type, name, section);
    
    // Create the component node using the pipeline manager
    createComponentNode(type, name, section, adjustedPosition);
  }, [determineSection, getPositionInSection, createComponentNode]);

  // Add effect to generate YAML when nodes or edges change
  useEffect(() => {
    generateConfig();
    
    // Track configuration generation
    if (nodes.length > 0 || edges.length > 0) {
      // Filter out section nodes to only count actual components
      const componentNodes = nodes.filter(node => node.type !== 'section');
      trackCanvas.config.generate(componentNodes.length, edges.length);
    }
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
            zIndex: 1000,
            style: {
              strokeWidth: 2,
              stroke: '#222',
              zIndex: 1000,
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
          fitView={true}
          fitViewOptions={{ padding: 0.2 }}
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