import React from 'react';
import { NodeProps } from 'reactflow';
import { Info } from 'lucide-react';

type ExtensionNodeProps = NodeProps<{
  label: string;
  config: Record<string, any>;
}>;

export const ExtensionNode: React.FC<ExtensionNodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-2 rounded-md shadow-sm border-2 transition-all duration-300 ${
        selected
          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 shadow-md'
          : 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20'
      }`}
      style={{
        minWidth: 150,
        maxWidth: 250,
        fontSize: '0.875rem',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
          <Info size={14} />
        </div>
        <div className="font-medium truncate">{data.label}</div>
      </div>
      
      {/* No handles needed for extension nodes as they don't connect to anything */}
    </div>
  );
};

