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
    const { availableWidth, availableHeight, layoutStrategy } = viewport;
    
    // Determine layout strategy based on available space
    const sectionCount = Object.keys(PIPELINE_SECTIONS).length;
    
    // Calculate section dimensions based on layout strategy
    let sectionWidth: number;
    let sectionHeight: number;
    let gapBetweenSections: number;
    
    switch (layoutStrategy) {
      case 'horizontal':
        // For horizontal layout, we want each section to have enough width for long pipelines
        // but we'll still arrange them side by side if there's enough space
        if (availableWidth >= sectionCount * 600) {
          // Enough space for each section to be at least 600px wide
          sectionWidth = Math.max(600, availableWidth / sectionCount - LAYOUT_CONFIG.MARGIN);
          sectionHeight = Math.max(LAYOUT_CONFIG.SECTION_MIN_HEIGHT, availableHeight - (LAYOUT_CONFIG.MARGIN * 2));
          gapBetweenSections = LAYOUT_CONFIG.SECTION_GAP;
        } else {
          // Not enough space for side-by-side, fall back to vertical stacking
          sectionWidth = Math.max(LAYOUT_CONFIG.SECTION_MIN_WIDTH * 2, availableWidth - (LAYOUT_CONFIG.MARGIN * 2));
          sectionHeight = Math.max(LAYOUT_CONFIG.SECTION_MIN_HEIGHT, (availableHeight - (LAYOUT_CONFIG.MARGIN * 2)) / sectionCount);
          gapBetweenSections = LAYOUT_CONFIG.SECTION_GAP;
        }
        break;
      case 'grid':
        // For grid layout, ensure sections are wide enough for pipelines
        const columns = 2;
        const rows = Math.ceil(sectionCount / columns);
        sectionWidth = Math.max(500, (availableWidth - LAYOUT_CONFIG.MARGIN) / columns); // Min 500px for pipelines
        sectionHeight = Math.max(LAYOUT_CONFIG.SECTION_MIN_HEIGHT, (availableHeight - LAYOUT_CONFIG.MARGIN) / rows);
        gapBetweenSections = LAYOUT_CONFIG.SECTION_GAP;
        break;
      case 'vertical':
      default:
        // For vertical layout, maximize width for long pipelines
        sectionWidth = Math.max(LAYOUT_CONFIG.SECTION_MIN_WIDTH * 3, availableWidth - (LAYOUT_CONFIG.MARGIN * 2));
        sectionHeight = Math.max(LAYOUT_CONFIG.SECTION_MIN_HEIGHT, (availableHeight - (LAYOUT_CONFIG.MARGIN * 2)) / sectionCount);
        gapBetweenSections = LAYOUT_CONFIG.SECTION_GAP;
        break;
    }
    
    // Calculate positions for each section based on layout strategy
    const sectionTypes = Object.keys(PIPELINE_SECTIONS) as SectionType[];
    
    const positions: Record<SectionType, { x: number, y: number }> = {} as Record<SectionType, { x: number, y: number }>;
    
    switch (layoutStrategy) {
      case 'horizontal':
        if (availableWidth >= sectionCount * 600) {
          // Side by side horizontal layout
          sectionTypes.forEach((type, index) => {
            positions[type] = {
              x: LAYOUT_CONFIG.SIDEBAR_WIDTH + LAYOUT_CONFIG.MARGIN + (index * (sectionWidth + gapBetweenSections)),
              y: LAYOUT_CONFIG.HEADER_HEIGHT + LAYOUT_CONFIG.MARGIN
            };
          });
        } else {
          // Vertical stacking when not enough horizontal space
          sectionTypes.forEach((type, index) => {
            positions[type] = {
              x: LAYOUT_CONFIG.SIDEBAR_WIDTH + LAYOUT_CONFIG.MARGIN,
              y: LAYOUT_CONFIG.HEADER_HEIGHT + LAYOUT_CONFIG.MARGIN + (index * (sectionHeight + gapBetweenSections))
            };
          });
        }
        break;
        
      case 'grid':
        // Position sections in a 2x2 grid, ensuring good width for pipelines
        sectionTypes.forEach((type, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          positions[type] = {
            x: LAYOUT_CONFIG.SIDEBAR_WIDTH + LAYOUT_CONFIG.MARGIN + (col * (sectionWidth + gapBetweenSections)),
            y: LAYOUT_CONFIG.HEADER_HEIGHT + LAYOUT_CONFIG.MARGIN + (row * (sectionHeight + gapBetweenSections))
          };
        });
        break;
        
      case 'vertical':
      default:
        // Position sections vertically stacked, maximizing width for pipelines
        sectionTypes.forEach((type, index) => {
          positions[type] = {
            x: LAYOUT_CONFIG.SIDEBAR_WIDTH + LAYOUT_CONFIG.MARGIN,
            y: LAYOUT_CONFIG.HEADER_HEIGHT + LAYOUT_CONFIG.MARGIN + (index * (sectionHeight + gapBetweenSections))
          };
        });
        break;
    }

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

    console.log('Created section nodes with layout strategy:', layoutStrategy, 'section width:', sectionWidth, 'section height:', sectionHeight);
    return sectionNodes;
  }, [fullScreenSection, collapsedSections, onToggleExpand, onToggleCollapse, viewport]);

  // Update sections when viewport changes
  useEffect(() => {
    const updatedSectionNodes = createSectionNodes();
    setNodes(prevNodes => {
      // Keep non-section nodes
      const nonSectionNodes = prevNodes.filter(node => node.type !== 'section');
      return [...nonSectionNodes, ...updatedSectionNodes];
    });
  }, [createSectionNodes, setNodes, viewport.layoutStrategy]);

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
