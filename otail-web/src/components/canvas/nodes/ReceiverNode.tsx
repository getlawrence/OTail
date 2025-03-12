import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, Grip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReceiverNodeProps {
  data: any;
  handleStyle?: React.CSSProperties;
}

export const ReceiverNode = ({ data, handleStyle }: ReceiverNodeProps) => {
  // Ensure the node has a high z-index to prevent it from being hidden behind sections
  const nodeStyle = {
    zIndex: 10,
  };
  return (
    <Card className="min-w-48 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background" style={nodeStyle}>
      <div className="p-1 bg-blue-100/50 dark:bg-blue-900/20 flex items-center justify-between border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-1 pl-1">
          <Grip size={12} className="text-blue-400 dark:text-blue-500" />
          <Badge variant="outline" className="text-[10px] py-0 h-4 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
            Receiver
          </Badge>
        </div>
      </div>
      <CardContent className="p-2 pt-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/40">
            <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
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
        type="source"
        position={Position.Right}
        style={{
          ...handleStyle,
          right: '-7px',
          backgroundColor: '#3b82f6',
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

export default ReceiverNode;