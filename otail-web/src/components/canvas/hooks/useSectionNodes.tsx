import { useCallback } from 'react';
import { PIPELINE_SECTIONS } from '../constants';
import type { PipelineType } from '../types';

interface UseSectionNodesProps {
  fullScreenSection: PipelineType | null;
  onToggleExpand: ((type: PipelineType, expanded: boolean) => void) | null;
}

export function useSectionNodes({ fullScreenSection, onToggleExpand }: UseSectionNodesProps) {
  // Function to create section nodes that will be used in the flow
  // Create section nodes - always create all sections
  const createSectionNodes = useCallback(() => {
    let currentY = 20; // Starting Y position - reduced from 60 to 20
    const positions: Record<PipelineType, number> = {
      traces: 0,
      metrics: 0,
      logs: 0
    };

    // Get the viewport height for calculating section heights
    const viewportHeight = window.innerHeight;
    // When a section is in full-screen mode, it takes up most of the viewport
    const fullScreenSectionHeight = viewportHeight * 0.85; // 85% of viewport for full-screen section
    // Default section height is 1/4 of viewport (smaller than before)
    const defaultSectionHeight = viewportHeight / 4;

    // First pass: calculate positions
    Object.keys(PIPELINE_SECTIONS).forEach((type) => {
      const sectionType = type as PipelineType;
      positions[sectionType] = currentY;

      // Update Y position for next section
      // If this section is in full-screen mode, it takes up most of the viewport
      // Otherwise, it takes 1/4 of the viewport
      const sectionHeight = fullScreenSection === sectionType ? fullScreenSectionHeight : defaultSectionHeight;
      const spacing = 20; // Increased spacing between sections to prevent overlap
      currentY += sectionHeight + spacing;
    });

    // Second pass: create nodes
    const sectionNodes = Object.keys(PIPELINE_SECTIONS).map((type, index) => {
      const sectionType = type as PipelineType;
      // If we're in full-screen mode and this is not the full-screen section, hide it
      const isHidden = fullScreenSection !== null && fullScreenSection !== sectionType;
      
      return {
        id: `section-${sectionType}`, // Use stable ID without timestamp
        type: 'section',
        position: {
          // Position sections with enough margin to avoid sidebar overlap
          x: 80, // Use 80px margin on the left to clear the sidebar
          y: fullScreenSection === sectionType ? window.innerHeight * 0.075 : positions[sectionType] // Keep vertical positioning
        },
        data: {
          type: sectionType,
          index,
          // When in full-screen, use most of the canvas width and height but not all
          // For regular mode, adjust width to account for sidebar and right margin
          width: window.innerWidth - 100, // Account for sidebar (80px) and right margin (20px)
          height: fullScreenSection === sectionType ? window.innerHeight * 0.85 : window.innerHeight / 4, // Use 1/4 height for regular sections
          isFullScreen: fullScreenSection === sectionType,
          onToggleExpand,
          pipelineType: sectionType,
          pipelineName: `default-${sectionType}`
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
  }, [fullScreenSection, onToggleExpand]);

  return { createSectionNodes } as const;
}
