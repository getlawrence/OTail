import React from 'react';
import { NodeProps } from 'reactflow';
import { Info } from 'lucide-react';
import { COLOR_SCHEME } from '../constants';

type ExtensionNodeProps = NodeProps<{
  label: string;
  config: Record<string, any>;
}>;

export const ExtensionNode: React.FC<ExtensionNodeProps> = ({ data, selected }) => {
  // Get the base color from the extensions color scheme
  const baseColor = COLOR_SCHEME.extensions.color;
  
  // Generate all styles from the base color
  const styles = {
    selectedBorder: `border-${baseColor}-500`,
    selectedBg: `bg-${baseColor}-50 dark:bg-${baseColor}-900/30`,
    border: `border-${baseColor}-200 dark:border-${baseColor}-800`,
    bg: `bg-${baseColor}-50/50 dark:bg-${baseColor}-950/20`,
    badge: `bg-${baseColor}-100 dark:bg-${baseColor}-900/30 text-${baseColor}-700 dark:text-${baseColor}-300 border-${baseColor}-300 dark:border-${baseColor}-700`
  };
  
  return (
    <div
      className={`px-4 py-2 rounded-md shadow-sm border-2 transition-all duration-300 ${
        selected
          ? `${styles.selectedBorder} ${styles.selectedBg} shadow-md`
          : `${styles.border} ${styles.bg}`
      }`}
      style={{
        minWidth: 150,
        maxWidth: 250,
        fontSize: '0.875rem',
      }}
    >
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${styles.badge}`}>
          <Info size={14} />
        </div>
        <div className="font-medium truncate">{data.label}</div>
      </div>
      
      {/* No handles needed for extension nodes as they don't connect to anything */}
    </div>
  );
};

