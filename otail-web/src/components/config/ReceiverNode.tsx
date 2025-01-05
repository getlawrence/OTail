import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';

interface ReceiverNodeProps {
  data: any;
  handleStyle?: React.CSSProperties;
}

const ReceiverNode = ({ data, handleStyle }: ReceiverNodeProps) => {
  return (
    <Card className="min-w-40">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <ArrowDown size={16} />
          <div className="font-medium text-sm">{data.label}</div>
        </div>
        {data.config?.endpoint && (
          <div className="text-xs text-muted-foreground mt-1">
            {data.config.endpoint}
          </div>
        )}
      </CardContent>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          ...handleStyle,
          right: '-6px',
        }}
      />
    </Card>
  );
};

export default ReceiverNode;