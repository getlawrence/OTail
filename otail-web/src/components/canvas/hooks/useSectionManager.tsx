import { useCallback, useEffect } from 'react';
import { Node } from 'reactflow';
import { PIPELINE_SECTIONS, COLOR_SCHEME, LAYOUT_CONFIG } from '../constants';
import type { PipelineType, SectionType } from '../types';
import { useViewport } from './useViewport';

interface UseSectionManagerProps {
  fullScreenSection: SectionType | null;
  collapsedSections?: SectionType[];
  onToggleExpand: ((type: SectionType, expanded: boolean) => void) | null;
  onToggleCollapse?: (type: SectionType, collapsed: boolean) => void;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  nodes: Node[];
}

export function useSectionManager({
  fullScreenSection,
  collapsedSections = [],
  onToggleExpand,
  onToggleCollapse,
  setNodes,
  nodes
}: UseSectionManagerProps) {

  // Use the viewport hook for responsive layout
  const viewport = useViewport();

  // Create section nodes - always create all sections
  const createSectionNodes = useCallback(() => {
    const { availableWidth, availableHeight } = viewport;
    
    // Determine layout strategy based on available space
    const sectionCount = Object.keys(PIPELINE_SECTIONS).length;
    
    // Calculate section dimensions - use vertical stacking for pipeline flow
    let sectionWidth: number;
    let sectionHeight: number;
    
    // Maximize width for better pipeline visualization while keeping vertical flow
    sectionWidth = Math.max(
      LAYOUT_CONFIG.SECTION_MIN_WIDTH, 
      availableWidth - (LAYOUT_CONFIG.MARGIN * 2)
    );
    
    // Distribute height more efficiently among sections
    sectionHeight = Math.max(
      LAYOUT_CONFIG.SECTION_MIN_HEIGHT,
      (availableHeight - (LAYOUT_CONFIG.MARGIN * (sectionCount + 1))) / sectionCount
    );
    
    // Calculate positions for each section - vertical stacking for pipeline flow
    const sectionTypes = Object.keys(PIPELINE_SECTIONS) as SectionType[];
    
    const positions: Record<SectionType, { x: number, y: number }> = {} as Record<SectionType, { x: number, y: number }>;
    
    // Each section gets its own row, positioned vertically for pipeline flow
    sectionTypes.forEach((type, index) => {
      positions[type] = {
        x: LAYOUT_CONFIG.SIDEBAR_WIDTH + LAYOUT_CONFIG.MARGIN,
        y: LAYOUT_CONFIG.HEADER_HEIGHT + LAYOUT_CONFIG.MARGIN + (index * (sectionHeight + LAYOUT_CONFIG.MARGIN))
      };
    });

    // Create section nodes
    const sectionNodes: Node[] = Object.keys(PIPELINE_SECTIONS).map((type, index) => {
      const sectionType = type as PipelineType;
      const isHidden = fullScreenSection !== null && fullScreenSection !== sectionType;
      const isCollapsed = collapsedSections.includes(sectionType);
      const colorScheme = COLOR_SCHEME[sectionType];

      return {
        id: `section-${sectionType}`,
        type: 'section',
        position: positions[sectionType],
        data: {
          type: sectionType,
          index,
          width: sectionWidth,
          height: fullScreenSection === sectionType 
            ? viewport.height - LAYOUT_CONFIG.HEADER_HEIGHT // Full height minus header
            : sectionHeight,
          isFullScreen: fullScreenSection === sectionType,
          isCollapsed: isCollapsed,
          onToggleExpand: onToggleExpand,
          onToggleCollapse: onToggleCollapse
        },
        selectable: false,
        draggable: false,
        hidden: false, // Never hide sections, we'll handle visibility in the component
        style: {
          width: `${sectionWidth}px`,
          height: `${fullScreenSection === sectionType ? viewport.height - LAYOUT_CONFIG.HEADER_HEIGHT : sectionHeight}px`,
          opacity: isHidden ? 0 : 1,
          pointerEvents: isHidden ? 'none' as const : 'all' as const,
          visibility: isHidden ? 'hidden' as const : 'visible' as const
        },
        className: `z-10 transform scale-100 origin-top-left transition-all duration-300 ${colorScheme.background} border-${colorScheme.color}-200 rounded-lg shadow-sm`,
        // Ensure parent node is set to undefined to prevent hierarchy issues
        parentNode: undefined,
        extent: 'parent' as const,
      } as Node;
    });

    console.log('Created section nodes with optimized vertical layout - each section gets its own row with better space utilization. Section dimensions:', sectionWidth, 'x', sectionHeight);
    return sectionNodes;
  }, [fullScreenSection, collapsedSections, onToggleExpand, onToggleCollapse, viewport]);

  // Update sections when viewport changes (but layout is always vertical)
  useEffect(() => {
    const updatedSectionNodes = createSectionNodes();
    setNodes(prevNodes => {
      // Keep non-section nodes
      const nonSectionNodes = prevNodes.filter(node => node.type !== 'section');
      return [...nonSectionNodes, ...updatedSectionNodes];
    });
  }, [createSectionNodes, setNodes, viewport.width, viewport.height]);

  // Function to determine which section a position belongs to
  const determineSection = useCallback((x: number, y: number): SectionType => {
    // If a section is in full screen mode, always return that section
    if (fullScreenSection !== null) {
      return fullScreenSection;
    }

    // Check if the position is within any section card
    const sectionTypes = Object.keys(PIPELINE_SECTIONS) as SectionType[];
    
    // Get current section dimensions from nodes
    const sectionNodes = nodes.filter(node => node.type === 'section');
    if (sectionNodes.length === 0) {
      return sectionTypes[0]; // Fallback
    }

    // Check each section to see if the position is within it
    for (const sectionNode of sectionNodes) {
      const sectionData = sectionNode.data as any;
      const sectionType = sectionData.type as SectionType;
      
      if (
        x >= sectionNode.position.x &&
        x <= sectionNode.position.x + (sectionData.width || 600) &&
        y >= sectionNode.position.y &&
        y <= sectionNode.position.y + (sectionData.height || 400)
      ) {
        return sectionType;
      }
    }

    // Default to the closest section if not within any section
    let closestSection = null as { type: SectionType, distance: number } | null;
    
    for (const sectionNode of sectionNodes) {
      const sectionData = sectionNode.data as any;
      const sectionType = sectionData.type as SectionType;
      const sectionCenterX = sectionNode.position.x + (sectionData.width || 600) / 2;
      const sectionCenterY = sectionNode.position.y + (sectionData.height || 400) / 2;
      
      const distance = Math.sqrt(
        Math.pow(x - sectionCenterX, 2) + Math.pow(y - sectionCenterY, 2)
      );

      if (!closestSection || distance < closestSection.distance) {
        closestSection = { type: sectionType, distance };
      }
    }

    return closestSection?.type || sectionTypes[0];
  }, [fullScreenSection, nodes]);

  // Update section nodes when relevant state changes
  const updateSections = useCallback(() => {
    // Create new section nodes with updated properties
    const updatedSectionNodes = createSectionNodes();
    return updatedSectionNodes;
  }, [createSectionNodes]);

  // Calculate position relative to a section
  const getPositionInSection = useCallback((absolutePosition: { x: number, y: number }, sectionType: SectionType) => {
    const sectionNode = nodes.find(node => node.id === `section-${sectionType}`);
    let adjustedPosition = { ...absolutePosition };

    if (sectionNode) {
      // Make position relative to the section's position
      adjustedPosition = {
        x: absolutePosition.x - sectionNode.position.x,
        y: absolutePosition.y - sectionNode.position.y - 40 // Adjust for section header height
      };
    }

    return adjustedPosition;
  }, [nodes]);

  return {
    createSectionNodes,
    determineSection,
    updateSections,
    getPositionInSection,
    getCurrentLayoutStrategy: () => viewport.layoutStrategy
  } as const;
}
