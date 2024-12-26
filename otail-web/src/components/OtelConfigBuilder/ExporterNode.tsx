import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp } from 'lucide-react';

interface ExporterNodeProps {
  data: { label: string; config: any };
  handleStyle: React.CSSProperties;
}

const ExporterNode = ({ data, handleStyle }: ExporterNodeProps) => {
  return (
    <Card className="min-w-40">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <ArrowUp size={16} />
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
    </Card>
  );
};

export default ExporterNode;