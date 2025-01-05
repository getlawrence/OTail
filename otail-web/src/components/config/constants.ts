import { PipelineType } from './types';

export const LAYOUT_CONFIG = {
  SECTION_HEIGHT: 600,
  SECTION_PADDING: 40,
  NODE_WIDTH: 180,
  NODE_HEIGHT: 40,
  NODE_SPACING: 100,
  MINIMAP_HEIGHT: 120,
};

export const VALID_CONNECTIONS: Record<string, string[]> = {
  'receiver': ['processor', 'exporter'],
  'processor': ['processor', 'exporter'],
  'exporter': []
};

export const PIPELINE_SECTIONS: Record<PipelineType, {
  label: string;
  background: string;
  labelBackground: string;
}> = {
  traces: {
    label: 'Traces',
    background: 'rgba(52, 152, 219, 0.05)',  // Light blue tint
    labelBackground: 'rgba(52, 152, 219, 0.1)'
  },
  metrics: {
    label: 'Metrics',
    background: 'rgba(46, 204, 113, 0.05)',  // Light green tint
    labelBackground: 'rgba(46, 204, 113, 0.1)'
  },
  logs: {
    label: 'Logs',
    background: 'rgba(155, 89, 182, 0.05)',  // Light purple tint
    labelBackground: 'rgba(155, 89, 182, 0.1)'
  }
};

export const styles = {
  handleStyle: {
    width: '12px',
    height: '12px',
    background: '#555',
    border: '2px solid #fff',
    borderRadius: '6px',
    ':hover': {
      width: '14px',
      height: '14px',
      background: '#777'
    }
  },

  validConnectionStyle: {
    stroke: '#222',
    strokeWidth: 2,
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