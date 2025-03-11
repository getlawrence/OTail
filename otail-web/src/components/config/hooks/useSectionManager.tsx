import { useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { PIPELINE_SECTIONS } from '../constants';
import type { PipelineType } from '../types';

interface UseSectionManagerProps {
  fullScreenSection: PipelineType | null;
  onToggleExpand: ((type: PipelineType, expanded: boolean) => void) | null;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  nodes: Node[];
}

export function useSectionManager({ 
  fullScreenSection, 
  onToggleExpand, 
  setNodes,
  nodes 
}: UseSectionManagerProps) {
  const { } = useReactFlow(); // Using ReactFlow context but not project specifically

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
          pipelineType: sectionType
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

  // Function to determine which section a position belongs to
  const determineSection = useCallback((x: number, y: number): PipelineType => {
    // Check if the position is within any section card
    const sectionTypes = Object.keys(PIPELINE_SECTIONS) as PipelineType[];

    // Section dimensions
    const sectionWidth = 800;
    const baseHeight = 150;

    const sectionSpacing = 20;
    const leftOffset = 100;

    let currentTop = 60;

    for (let i = 0; i < sectionTypes.length; i++) {
      const type = sectionTypes[i];
      const sectionHeight = baseHeight;

      if (
        x >= leftOffset &&
        x <= leftOffset + sectionWidth &&
        y >= currentTop &&
        y <= currentTop + sectionHeight
      ) {
        return type;
      }

      // Calculate next section position
      currentTop += sectionHeight + sectionSpacing;
    }

    // Default to the closest section if not within any section
    let closestSection = null as { type: PipelineType, distance: number } | null;
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
    // Merge non-section nodes with updated section nodes
    setNodes(currentNodes => {
      // Only update if there are no section nodes or if properties have changed
      const hasSectionNodes = currentNodes.some(node => node.type === 'section');
      if (!hasSectionNodes) {
        return [...nonSectionNodes, ...updatedSectionNodes];
      }

      // Check if section properties have changed
      const needsUpdate = updatedSectionNodes.some(newNode => {
        const existingNode = currentNodes.find(node => node.id === newNode.id);
        if (!existingNode) return true;

        // Compare relevant properties
        return (
          existingNode.data.isFullScreen !== newNode.data.isFullScreen
        );
      });

      return needsUpdate ? [...nonSectionNodes, ...updatedSectionNodes] : currentNodes;
    });
  }, [fullScreenSection, createSectionNodes, setNodes, nodes]);

  // Calculate position relative to a section
  const getPositionInSection = useCallback((absolutePosition: { x: number, y: number }, sectionType: PipelineType) => {
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
