import { LAYOUT_CONFIG } from "./constants";

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
      }
    }
  };