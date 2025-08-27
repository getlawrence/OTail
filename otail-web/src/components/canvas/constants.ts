import { SectionType } from './types';

export const LAYOUT_CONFIG = {
  // Layout strategy - vertical stacking for pipeline flow visualization
  LAYOUT_STRATEGY: 'vertical' as const,
  
  // Responsive breakpoints - kept for potential future use but not affecting layout
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1600,
    WIDE: 2000
  },
  
  // Section dimensions - optimized for vertical pipeline flow
  SECTION_HEIGHT: 500,
  SECTION_PADDING: 20,
  SECTION_MIN_WIDTH: 400, // Keep reasonable width for pipeline components
  SECTION_MIN_HEIGHT: 400, // Keep reasonable height for pipeline components
  SECTION_GAP: 16, // Reduced gap for tighter vertical layout
  
  // Pipeline-specific dimensions - aligned with existing layout system
  PIPELINE_MIN_WIDTH: 500, // Minimum width needed for a typical pipeline
  PIPELINE_COMPONENT_WIDTH: 180, // Width of individual pipeline components
  PIPELINE_COMPONENT_SPACING: 100, // Spacing between pipeline components
  
  // Node dimensions - aligned with existing layout system from layoutCalculator.ts
  NODE_WIDTH: 150, // Match the existing layout system (NODE_WIDTH in layoutCalculator.ts)
  NODE_HEIGHT: 40, // Match the existing layout system (NODE_HEIGHT in layoutCalculator.ts)
  NODE_SPACING: 150, // Increased spacing between nodes for better connections
  
  // Layout spacing - optimized for better space utilization while maintaining vertical flow
  SIDEBAR_WIDTH: 80,
  HEADER_HEIGHT: 64, // Reduced header height
  MARGIN: 16, // Reduced margin for tighter layout
  
  // Z-index management
  MINIMAP_HEIGHT: 120,
  NODE_Z_INDEX: 20, // Z-index for component nodes (higher than edges)
  SECTION_Z_INDEX: 0, // Z-index for section containers (lower than edges)
};

export const VALID_CONNECTIONS: Record<string, string[]> = {
  'receivers': ['processors', 'exporters'],
  'processors': ['receivers', 'exporters'],
  'exporters': ['receivers', 'processors'],
  'connectors': ['connectors'] // Connectors can only connect to other connectors
};


// Unified color scheme for all components
export const COLOR_SCHEME = {
  traces: {
    color: 'blue',
    label: 'Traces',
    background: 'rgba(59, 130, 246, 0.05)', // Blue-500 background
  },
  metrics: {
    color: 'green',
    label: 'Metrics',
    background: 'rgba(34, 197, 94, 0.05)', // Green-500 background
  },
  logs: {
    color: 'purple',
    label: 'Logs',
    background: 'rgba(168, 85, 247, 0.05)', // Purple-500 background
  },

  connectors: {
    color: 'amber',
    label: 'Connectors',
    background: 'rgba(217, 119, 6, 0.05)', // Amber-600 background
  },
  exporters: {
    color: 'purple',
    label: 'Exporters',
    background: 'rgba(168, 85, 247, 0.05)', // Purple-500 background
  },
  processors: {
    color: 'green',
    label: 'Processors',
    background: 'rgba(34, 197, 94, 0.05)', // Green-500 background
  },
  receivers: {
    color: 'blue',
    label: 'Receivers',
    background: 'rgba(59, 130, 246, 0.05)', // Blue-500 background
  }
};

// For backward compatibility, maintain PIPELINE_SECTIONS as a reference to COLOR_SCHEME
export const PIPELINE_SECTIONS: Record<SectionType, {
  label: string;
  background: string;
  isHorizontal?: boolean;
}> = {
  traces: COLOR_SCHEME.traces,
  metrics: COLOR_SCHEME.metrics,
  logs: COLOR_SCHEME.logs,

};

export const styles = {
  handleStyle: {
    width: '14px',
    height: '14px',
    background: '#555',
    border: '2px solid #fff',
    borderRadius: '7px',
    zIndex: 20, // Higher z-index for handles to ensure they're clickable
    ':hover': {
      width: '16px',
      height: '16px',
      background: '#777'
    }
  },

  // Unified edge style for all connections
  validConnectionStyle: {
    stroke: '#ff9800', // Orange color for better visibility
    strokeWidth: 3,
    animated: true,
    zIndex: 1000, // Very high z-index to ensure edges are always visible
    type: 'smoothstep', // Consistent curved edge type
  },

  // Use the same style for connector edges to maintain consistency
  connectorEdgeStyle: {
    stroke: '#ff9800', // Orange color for better visibility
    strokeWidth: 3,
    animated: true,
    zIndex: 1000, // Very high z-index to ensure edges are always visible
    type: 'smoothstep', // Consistent curved edge type
  },

  sectionStyles: {
    label: {
      position: 'absolute' as const,
      left: '10px',
      padding: '4px 8px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: 'bold' as const,
      color: '#333',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 10,
    },

    divider: {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      height: `${LAYOUT_CONFIG.SECTION_HEIGHT / 3}px`,
      pointerEvents: 'none' as const,
      borderBottom: '2px solid rgba(0,0,0,0.1)',
      zIndex: 0,
    },

    sectionTitle: {
      position: 'absolute' as const,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '4px 16px',
      background: 'white',
      borderRadius: '0 0 8px 8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontWeight: 'bold',
      zIndex: 10,
    }
  },

  container: {
    flex: 1,
    display: 'flex' as const,
    height: '100%',
  },

  flowContainer: {
    flexGrow: 1,
    position: 'relative' as const,
  },

  node: {
    base: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      background: 'white',
      fontSize: '12px',
      transition: 'all 0.2s ease',
    },
    receiver: {
      background: '#e3f2fd',
      borderColor: '#90caf9',
    },
    processor: {
      background: '#f1f8e9',
      borderColor: '#aed581',
    },
    exporter: {
      background: '#f3e5f5',
      borderColor: '#ce93d8',
    },
  }
};