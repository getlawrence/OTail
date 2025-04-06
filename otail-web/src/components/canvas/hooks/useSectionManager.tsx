import { useCallback } from 'react';
import { Node, Edge, useEdges } from 'reactflow';
import { PIPELINE_SECTIONS, COLOR_SCHEME } from '../constants';
import type { PipelineType, SectionType } from '../types';
import { calculateNodeLayout } from '../utils/layoutCalculator';

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
  const edges = useEdges(); // Use the dedicated useEdges hook

  // Create section nodes - always create all sections
  const createSectionNodes = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate section dimensions
    const sectionWidth = viewportWidth - 320; // Account for sidebar
    const sectionHeight = 200; // Fixed height for each section
    const gapBetweenSections = 50; // Fixed gap between sections
    
    // Calculate positions for each section in three rows
    const positions: Record<SectionType, { x: number, y: number }> = {
      traces: { x: 400, y: 50 }, // First row, moved right and down a bit
      metrics: { x: 400, y: sectionHeight + gapBetweenSections + 50 }, // Second row
      logs: { x: 400, y: (sectionHeight + gapBetweenSections) * 2 + 50 }, // Third row
    };

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
            ? viewportHeight - 80 // Full height minus header
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
          height: `${fullScreenSection === sectionType ? viewportHeight - 80 : sectionHeight}px`,
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

    console.log('Created section nodes:', sectionNodes);
    return sectionNodes;
  }, [fullScreenSection, collapsedSections, onToggleExpand, onToggleCollapse]);

  // Function to determine which section a position belongs to
  const determineSection = useCallback((x: number, y: number): SectionType => {
    // If a section is in full screen mode, always return that section
    if (fullScreenSection !== null) {
      return fullScreenSection;
    }

    // Check if the position is within any section card
    const sectionTypes = Object.keys(PIPELINE_SECTIONS) as SectionType[];

    // Section dimensions
    const sectionWidth = 800;
    const baseHeight = 150;

    const sectionSpacing = 20;
    const regularSectionsOffset = 300; // Regular sections start at 300px

    let currentTop = 60;


    // Then check regular vertical sections
    for (let i = 0; i < sectionTypes.length; i++) {
      const type = sectionTypes[i];
      const sectionHeight = baseHeight;

      if (
        x >= regularSectionsOffset &&
        x <= regularSectionsOffset + sectionWidth &&
        y >= currentTop &&
        y <= currentTop + sectionHeight
      ) {
        return type;
      }

      // Calculate next section position
      currentTop += sectionHeight + sectionSpacing;
    }

    // Default to the closest section if not within any section
    let closestSection = null as { type: SectionType, distance: number } | null;
    currentTop = 60;

    for (let i = 0; i < sectionTypes.length; i++) {
      const type = sectionTypes[i];
      const sectionHeight = baseHeight;
      const sectionCenter = currentTop + sectionHeight / 2;
      const distance = Math.abs(y - sectionCenter);

      if (!closestSection || distance < closestSection.distance) {
        closestSection = { type, distance };
      }

      // Calculate next section position
      currentTop += sectionHeight + sectionSpacing;
    }

    return closestSection?.type || sectionTypes[0];
  }, [fullScreenSection]);

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
    getPositionInSection
  } as const;
}
