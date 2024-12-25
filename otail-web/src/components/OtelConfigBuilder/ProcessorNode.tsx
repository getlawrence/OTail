import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';

interface ProcessorNodeProps {
  data: any;
  handleStyle?: React.CSSProperties;
}

const ProcessorNode = ({ data, handleStyle }: ProcessorNodeProps) => {
  return (
    <Card className="min-w-40">
      <CardContent className="p-3">
        <div className="font-medium text-sm">{data.label}</div>
        {Object.entries(data.config || {}).map(([key, value]) => (
          <div key={key} className="text-xs text-muted-foreground mt-1">
            {key}: {Array.isArray(value) ? value.length : value as string}
          </div>
        ))}
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