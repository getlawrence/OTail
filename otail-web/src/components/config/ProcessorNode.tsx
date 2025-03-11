import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { Bolt, Grip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProcessorNodeProps {
  data: any;
  handleStyle?: React.CSSProperties;
}

const ProcessorNode = ({ data, handleStyle }: ProcessorNodeProps) => {
  // Ensure the node has a high z-index to prevent it from being hidden behind sections
  const nodeStyle = {
    zIndex: 10,
  };
  return (
    <Card className="min-w-48 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background" style={nodeStyle}>
      <div className="p-1 bg-green-100/50 dark:bg-green-900/20 flex items-center justify-between border-b border-green-200 dark:border-green-800">
        <div className="flex items-center gap-1 pl-1">
          <Grip size={12} className="text-green-400 dark:text-green-500" />
          <Badge variant="outline" className="text-[10px] py-0 h-4 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
            Processor
          </Badge>
        </div>
      </div>
      <CardContent className="p-2 pt-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/40">
            <Bolt size={14} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="font-medium text-sm">{data.label}</div>
        </div>
        {data.config?.endpoint && (
          <div className="text-xs text-muted-foreground mt-2 pl-7 truncate max-w-40">
            {data.config.endpoint}
          </div>
        )}
      </CardContent>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          ...handleStyle,
          left: '-7px',
          backgroundColor: '#22c55e',
          border: '2px solid var(--background)',
          zIndex: 20, // Higher z-index to ensure it's clickable
          width: '14px',
          height: '14px',
        }}
        id="left"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          ...handleStyle,
          right: '-7px',
          backgroundColor: '#22c55e',
          border: '2px solid var(--background)',
          zIndex: 20, // Higher z-index to ensure it's clickable
          width: '14px',
          height: '14px',
        }}
        id="right"
      />
    </Card>
  );
};

export default ProcessorNode;