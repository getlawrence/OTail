import React, { useEffect } from 'react';
import { trackCanvas } from './analytics';
import { PIPELINE_SECTIONS, COLOR_SCHEME } from './constants';
import type { PipelineType } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, ChevronDown, ChevronRight } from 'lucide-react';
import { NodeProps, useReactFlow } from 'reactflow';

// Data interface for the section node
interface FlowSectionData {
  type: PipelineType;
  index: number;
  width?: number; // Make width optional since we'll use 100% by default
  height?: number; // Make height optional since we'll use 100% by default
  expanded?: boolean;
  isFullScreen?: boolean;
  isCollapsed?: boolean; // Whether the section is collapsed
  onToggleExpand?: (type: PipelineType, expanded: boolean) => void;
  onToggleCollapse?: (type: PipelineType, collapsed: boolean) => void; // Callback to toggle collapse state
  pipelines?: { id: string; name: string }[];
  activePipeline?: string;
  onAddPipeline?: (type: PipelineType) => void;
  onSelectPipeline?: (type: PipelineType, pipelineId: string) => void;
  children?: React.ReactNode; // Add support for child nodes
}

// ReactFlow node implementation
const FlowSectionComponent = ({ data, id }: NodeProps<FlowSectionData>) => {

  const reactFlowInstance = useReactFlow();

  if (!data || !data.type) {
    console.error('FlowSection received invalid data', data);
    return null;
  }


  // We're now using isFullScreen instead of isExpanded
  // This is kept for backward compatibility with some parts of the code
  const isExpanded = data.isFullScreen === true;

  // Check if the section is collapsed
  const isCollapsed = data.isCollapsed === true;

  // Get colors from the unified color scheme
  const colorScheme = COLOR_SCHEME[data.type] || COLOR_SCHEME.traces;
  const baseColor = colorScheme.color;

    // Use explicit Tailwind classes based on the color
    const colors = (() => {
      switch (baseColor) {
        case 'blue':
          return {
            bg: 'bg-blue-50/50 dark:bg-blue-500/[0.02]',
            border: 'border-blue-200 dark:border-blue-800/40',
            badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
          };
        case 'green':
          return {
            bg: 'bg-green-50/50 dark:bg-green-500/[0.02]',
            border: 'border-green-200 dark:border-green-800/40',
            badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
          };
        case 'purple':
          return {
            bg: 'bg-purple-50/50 dark:bg-purple-500/[0.02]',
            border: 'border-purple-200 dark:border-purple-800/40',
            badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
          };
        case 'pink':
          return {
            bg: 'bg-pink-50/50 dark:bg-pink-500/[0.02]',
            border: 'border-pink-200 dark:border-pink-800/40',
            badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700'
          };
        case 'amber':
          return {
            bg: 'bg-amber-50/50 dark:bg-amber-500/[0.02]',
            border: 'border-amber-200 dark:border-amber-800/40',
            badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
          };
        default:
          return {
            bg: 'bg-gray-50/50 dark:bg-gray-500/[0.02]',
            border: 'border-gray-200 dark:border-gray-800/40',
            badge: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
          };
      }
    })();

  const sectionConfig = PIPELINE_SECTIONS[data.type] || { label: colorScheme.label };

  // Effect to ensure nodes are properly contained within the section
  useEffect(() => {
    // Skip if we don't have access to the ReactFlow instance
    if (!reactFlowInstance) return;

    const allNodes = reactFlowInstance.getNodes();
    const sectionNodes = allNodes.filter(node => 
      node.data.pipelineType === data.type &&
      !node.id.startsWith('section-')
    );

    // Ensure all nodes belonging to this section are properly contained and styled
    if (sectionNodes.length > 0) {
      reactFlowInstance.setNodes(nodes => {
        return nodes.map(node => {
          if (sectionNodes.some(n => n.id === node.id)) {
            return {
              ...node,
              style: {
                ...node.style,
                opacity: 1, // Always visible
                pointerEvents: 'auto' as const, // Always interactive
                zIndex: 20 // Ensure components are above sections and edges
              },
              parentNode: id, // Make the section the parent of this node
              extent: 'parent' // Constrain the node within its parent
            };
          }
          return node;
        });
      });
    }
  }, [data.type, id, reactFlowInstance]);

  // Handle full-screen toggle
  const handleToggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (data.onToggleExpand) {
      // We're repurposing the onToggleExpand to toggle full-screen mode
      // If the section is already in full-screen, exit full-screen
      // If not in full-screen, enter full-screen
      const isCurrentlyFullScreen = data.isFullScreen === true;

      // Track the full-screen toggle event
      trackCanvas.section.toggleFullScreen(data.type, !isCurrentlyFullScreen);

      // Call the callback with the opposite of the current state
      data.onToggleExpand(data.type, !isCurrentlyFullScreen);
    }
  };

  // Handle collapse toggle
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (typeof data.onToggleCollapse === 'function') {
      const isCurrentlyCollapsed = data.isCollapsed === true;

      // Track the collapse toggle event
      trackCanvas.section.toggleCollapse(data.type, !isCurrentlyCollapsed);

      try {
        data.onToggleCollapse(data.type, !isCurrentlyCollapsed);
      } catch (error) {
        console.error('Error calling onToggleCollapse:', error);
      }
    }
  };



  return (
    <div
      className={`section-node ${colors.bg} rounded-lg border-2 ${colors.border} shadow-sm transition-all duration-500
        overflow-visible absolute pointer-events-all flex flex-col transform scale-100 origin-top-left
        z-10
        ${data.isFullScreen ? 'h-[calc(100vh-80px)] max-h-[calc(100vh-80px)]' : ''}`}
      style={{
        width: `${data.width}px`,
        height: `${data.height}px`,
        maxWidth: 'calc(100vw-320px)',
        maxHeight: data.isFullScreen ? 'calc(100vh-80px)' : '500px'
      }}
    >
      {/* Section header */}
      <div
        className={`h-8 px-3 flex items-center justify-between border-b ${colors.border}
          bg-white rounded-t-lg`}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${colors.badge} shadow-sm text-xs`}>
            {sectionConfig.label}
          </Badge>
        </div>
        <div className="flex gap-1">
          {/* Collapse/Expand button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleToggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          {/* Full-screen toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleToggleFullScreen}
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      {/* Section content */}
      <div
        className={`flex-1 p-3 ${colors.bg} rounded-b-lg ${isCollapsed ? 'hidden' : 'block'}`}
      >
        {data.children}
      </div>
    </div>
  );
};

export { FlowSectionComponent };
export default FlowSectionComponent;
