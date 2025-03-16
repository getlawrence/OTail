import { useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { PIPELINE_SECTIONS } from '../constants';
import type { PipelineType, SectionType } from '../types';

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
  const { } = useReactFlow(); // Using ReactFlow context but not project specifically

  // Create section nodes - always create all sections
  const createSectionNodes = useCallback(() => {
    let currentY = 20; // Starting Y position - reduced from 60 to 20
    const positions: Record<SectionType, number> = {
      traces: 0,
      metrics: 0,
      logs: 0,

    };

    // Get the viewport height for calculating section heights
    const viewportHeight = window.innerHeight;
    // When a section is in full-screen mode, it takes up most of the viewport
    const fullScreenSectionHeight = viewportHeight * 0.85; // 85% of viewport for full-screen section
    // Default section height is 1/4 of viewport (smaller than before)
    const defaultSectionHeight = viewportHeight / 4;

    // Calculate total height needed for all regular sections
    let totalRegularSectionsHeight = 0;
    let regularSectionCount = 0;
    
    // First count how many regular sections we have and calculate total height
    Object.keys(PIPELINE_SECTIONS).forEach((type) => {
      const sectionType = type as SectionType;
      const sectionConfig = PIPELINE_SECTIONS[sectionType];
      const isSideSection = sectionConfig.isSideSection === true;
      
      if (!isSideSection) {
        regularSectionCount++;
        const sectionHeight = fullScreenSection === sectionType ? fullScreenSectionHeight : defaultSectionHeight;
        totalRegularSectionsHeight += sectionHeight;
      }
    });
    
    // Add spacing between sections
    totalRegularSectionsHeight += (regularSectionCount - 1) * 20; // 20px spacing between sections
    
    // Now calculate positions
    Object.keys(PIPELINE_SECTIONS).forEach((type) => {
      const sectionType = type as SectionType;
      const sectionConfig = PIPELINE_SECTIONS[sectionType];
      const isSideSection = sectionConfig.isSideSection === true;
      
      if (isSideSection) {
        // Position side sections at the top
        positions[sectionType] = 20; // Same top margin as regular sections
      } else {
        // Regular vertical sections
        positions[sectionType] = currentY;
        
        // Update Y position for next section
        // If this section is in full-screen mode, it takes up most of the viewport
        // Otherwise, it takes 1/4 of the viewport
        const sectionHeight = fullScreenSection === sectionType ? fullScreenSectionHeight : defaultSectionHeight;
        const spacing = 20; // Increased spacing between sections to prevent overlap
        currentY += sectionHeight + spacing;
      }
    });

    // Second pass: create nodes
    const sectionNodes = Object.keys(PIPELINE_SECTIONS).map((type, index) => {
      const sectionType = type as PipelineType;
      const sectionConfig = PIPELINE_SECTIONS[sectionType];
      const isSideSection = sectionConfig.isSideSection === true;
      
      // If we're in full-screen mode and this is not the full-screen section, hide it
      const isHidden = fullScreenSection !== null && fullScreenSection !== sectionType;
      
      // Check if this section is collapsed
      const isCollapsed = collapsedSections.includes(sectionType);
      
      return {
        id: `section-${sectionType}`, // Use stable ID without timestamp
        type: 'section',
        position: {
          // Position sections with enough margin to avoid sidebar overlap
          x: isSideSection 
            ? 80 // Position side sections on the left side
            : 300, // Regular sections positioned to the right of the side section
          y: fullScreenSection === sectionType ? window.innerHeight * 0.075 : positions[sectionType] // Keep vertical positioning
        },
        data: {
          type: sectionType, // This is the property used in FlowSection.tsx
          index,
          // When in full-screen, use most of the canvas width and height but not all
          // For regular mode, adjust width to account for sidebar and right margin
          width: sectionConfig.isSideSection 
            ? 200 // Side sections are narrower
            : window.innerWidth - 320, // Regular sections account for sidebar, side section, and right margin
          height: fullScreenSection === sectionType 
            ? window.innerHeight * 0.85 
            : sectionConfig.isSideSection 
              ? totalRegularSectionsHeight // Side sections are as tall as all regular sections combined
              : window.innerHeight / 4, // Regular sections use 1/4 height
          isFullScreen: fullScreenSection === sectionType,
          isCollapsed: isCollapsed,
          onToggleExpand: onToggleExpand,
          onToggleCollapse: onToggleCollapse
        },
        selectable: false,
        draggable: false, // Explicitly set to false to prevent dragging
        hidden: isHidden, // Hide if not the full-screen section when in full-screen mode
        style: {
          zIndex: 1, // Base z-index for section container
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background
        },
      };
    });

    return sectionNodes;
  }, [fullScreenSection, collapsedSections, onToggleExpand, onToggleCollapse]);

  // Function to determine which section a position belongs to
  const determineSection = useCallback((x: number, y: number): SectionType => {
    // Check if the position is within any section card
    const sectionTypes = Object.keys(PIPELINE_SECTIONS) as SectionType[];

    // Section dimensions
    const sectionWidth = 800;
    const baseHeight = 150;
    const sideWidth = 200;

    const sectionSpacing = 20;
    const leftOffset = 80; // Left side section starts at 80px
    const regularSectionsOffset = 300; // Regular sections start at 300px

    let currentTop = 60;


    for (let i = 0; i < sectionTypes.length; i++) {
      const type = sectionTypes[i];
      const sectionConfig = PIPELINE_SECTIONS[type];
      const isSideSection = sectionConfig.isSideSection === true;
      
      if (isSideSection) {
        // Calculate the total height for regular sections to determine side section height
        let totalHeight = 0;
        let regularCount = 0;
        
        for (let j = 0; j < sectionTypes.length; j++) {
          const regType = sectionTypes[j];
          const regConfig = PIPELINE_SECTIONS[regType];
          if (!regConfig.isSideSection) {
            regularCount++;
            totalHeight += baseHeight;
          }
        }
        
        // Add spacing between sections
        if (regularCount > 1) {
          totalHeight += (regularCount - 1) * sectionSpacing;
        }
        
        if (
          x >= leftOffset &&
          x <= leftOffset + sideWidth &&
          y >= currentTop &&
          y <= currentTop + totalHeight
        ) {
          return type;
        }
      }
    }

    // Then check regular vertical sections
    for (let i = 0; i < sectionTypes.length; i++) {
      const type = sectionTypes[i];
      const sectionConfig = PIPELINE_SECTIONS[type];
      const isSideSection = sectionConfig.isSideSection === true;
      
      // Skip side sections as we already checked them
      if (isSideSection) continue;
      
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
  }, []);

  // Update section nodes when relevant state changes
  const updateSections = useCallback(() => {
    
    // Get current non-section nodes
    const nonSectionNodes = nodes.filter(node => node.type !== 'section');
    
    // Create new section nodes with updated properties
    const updatedSectionNodes = createSectionNodes();
    
    // Always force an update when this function is called
    // This ensures the UI reflects the current state
    setNodes(() => [...nonSectionNodes, ...updatedSectionNodes]);
  }, [fullScreenSection, collapsedSections, setNodes]);

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
