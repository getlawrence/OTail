import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { Bolt } from 'lucide-react';

interface ProcessorNodeProps {
  data: any;
  handleStyle?: React.CSSProperties;
}

const ProcessorNode = ({ data, handleStyle }: ProcessorNodeProps) => {
  return (
    <Card className="min-w-40">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Bolt size={16} />
          <div className="font-medium text-sm">{data.label}</div>
        </div>
        {data.config?.endpoint && (
          <div className="text-xs text-muted-foreground mt-1">
            {data.config.endpoint}
          </div>
        )}
      </CardContent>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          ...handleStyle,
          left: '-6px',
        }}
      />
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

export default ProcessorNode;