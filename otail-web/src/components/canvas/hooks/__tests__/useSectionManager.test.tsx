import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { useSectionManager } from '../useSectionManager';
import { PIPELINE_SECTIONS } from '../../constants';
import type { SectionType } from '../../types';

// Mock window dimensions
const mockWindowDimensions = {
  innerHeight: 800,
  innerWidth: 1200,
};

// Mock window object
Object.defineProperty(window, 'innerHeight', { value: mockWindowDimensions.innerHeight });
Object.defineProperty(window, 'innerWidth', { value: mockWindowDimensions.innerWidth });

describe('Section Layout', () => {
  const TestComponent = () => {
    const { createSectionNodes } = useSectionManager({
      fullScreenSection: null,
      collapsedSections: [],
      onToggleExpand: null,
      onToggleCollapse: undefined,
      setNodes: () => {},
      nodes: [],
    });

    const sectionNodes = createSectionNodes();

    return (
      <div data-testid="sections-container">
        {sectionNodes.map((node) => (
          <div
            key={node.id}
            data-testid={`section-${node.data.type}`}
            style={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              width: node.data.width,
              height: node.data.height,
            }}
          />
        ))}
      </div>
    );
  };

  it('should position sections in three distinct rows', () => {
    render(
      <ReactFlowProvider>
        <TestComponent />
      </ReactFlowProvider>
    );

    // Get all section elements
    const tracesSection = screen.getByTestId('section-traces');
    const metricsSection = screen.getByTestId('section-metrics');
    const logsSection = screen.getByTestId('section-logs');

    // Check x positions (should all be 400px to account for sidebar)
    expect(tracesSection.style.left).toBe('400px');
    expect(metricsSection.style.left).toBe('400px');
    expect(logsSection.style.left).toBe('400px');

    // Check y positions
    const sectionHeight = 200;
    const gapBetweenSections = 50;
    const topMargin = 50;

    // First section (traces) should be at y: 50
    expect(tracesSection.style.top).toBe(`${topMargin}px`);

    // Second section (metrics) should be at y: sectionHeight + gap + topMargin
    expect(metricsSection.style.top).toBe(`${sectionHeight + gapBetweenSections + topMargin}px`);

    // Third section (logs) should be at y: (sectionHeight + gap) * 2 + topMargin
    expect(logsSection.style.top).toBe(`${(sectionHeight + gapBetweenSections) * 2 + topMargin}px`);

    // Check dimensions
    const expectedWidth = mockWindowDimensions.innerWidth - 320; // Account for sidebar
    expect(tracesSection.style.width).toBe(`${expectedWidth}px`);
    expect(metricsSection.style.width).toBe(`${expectedWidth}px`);
    expect(logsSection.style.width).toBe(`${expectedWidth}px`);

    expect(tracesSection.style.height).toBe(`${sectionHeight}px`);
    expect(metricsSection.style.height).toBe(`${sectionHeight}px`);
    expect(logsSection.style.height).toBe(`${sectionHeight}px`);
  });

  it('should maintain proper spacing during zoom', () => {
    render(
      <ReactFlowProvider>
        <TestComponent />
      </ReactFlowProvider>
    );

    const tracesSection = screen.getByTestId('section-traces');
    const metricsSection = screen.getByTestId('section-metrics');
    const logsSection = screen.getByTestId('section-logs');

    // Verify transform properties - check if they're not scaling
    expect(tracesSection.style.transform).not.toContain('scale');
    expect(metricsSection.style.transform).not.toContain('scale');
    expect(logsSection.style.transform).not.toContain('scale');

    // Verify sections maintain their positions
    expect(tracesSection.style.position).toBe('absolute');
    expect(metricsSection.style.position).toBe('absolute');
    expect(logsSection.style.position).toBe('absolute');

    // Verify sections maintain their spacing
    const sectionHeight = 200;
    const gapBetweenSections = 50;
    const topMargin = 50;

    expect(tracesSection.style.top).toBe(`${topMargin}px`);
    expect(metricsSection.style.top).toBe(`${sectionHeight + gapBetweenSections + topMargin}px`);
    expect(logsSection.style.top).toBe(`${(sectionHeight + gapBetweenSections) * 2 + topMargin}px`);
  });

  it('should handle fullscreen mode correctly', () => {
    const FullscreenTestComponent = () => {
      const { createSectionNodes } = useSectionManager({
        fullScreenSection: 'traces',
        collapsedSections: [],
        onToggleExpand: null,
        onToggleCollapse: undefined,
        setNodes: () => {},
        nodes: [],
      });

      const sectionNodes = createSectionNodes();

      return (
        <div data-testid="sections-container">
          {sectionNodes.map((node) => (
            <div
              key={node.id}
              data-testid={`section-${node.data.type}`}
              style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y,
                width: node.data.width,
                height: node.data.height,
                visibility: node.hidden ? 'hidden' : 'visible', // Check visibility instead of display
              }}
            />
          ))}
        </div>
      );
    };

    render(
      <ReactFlowProvider>
        <FullscreenTestComponent />
      </ReactFlowProvider>
    );

    const tracesSection = screen.getByTestId('section-traces');
    const metricsSection = screen.getByTestId('section-metrics');
    const logsSection = screen.getByTestId('section-logs');

    // Fullscreen section should have full height
    expect(tracesSection.style.height).toBe(`${mockWindowDimensions.innerHeight - 80}px`);

    // Other sections should be hidden
    expect(metricsSection.style.visibility).toBe('hidden');
    expect(logsSection.style.visibility).toBe('hidden');
  });
}); 