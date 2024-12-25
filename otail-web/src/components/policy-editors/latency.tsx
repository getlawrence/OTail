import React from 'react';
import { LatencyPolicy } from '@/types/policy'
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface LatencyPolicyEditorProps {
  policy: LatencyPolicy;
  onUpdate: (policy: LatencyPolicy) => void;
}

export const LatencyPolicyEditor: React.FC<LatencyPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const handleChange = (field: keyof Pick<LatencyPolicy, 'thresholdMs' | 'upperThresholdMs'>, value: number) => {
    onUpdate({
      ...policy,
      [field]: value
    });
  };

  return (
    <div className="policy-editor p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="threshold">Minimum Latency Threshold</Label>
          <Tooltip>
            <TooltipTrigger>
              <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Spans with latency above this threshold will be sampled</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="threshold"
          type="number"
          min="0"
          value={policy.thresholdMs}
          onChange={(e) => handleChange('thresholdMs', Number(e.target.value))}
          placeholder="Enter threshold in milliseconds"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="upperThreshold">Maximum Latency Threshold</Label>
          <Tooltip>
            <TooltipTrigger>
              <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Optional: Spans with latency above this threshold will not be sampled</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="upperThreshold"
          type="number"
          min={policy.thresholdMs || 0}
          value={policy.upperThresholdMs}
          onChange={(e) => handleChange('upperThresholdMs', Number(e.target.value))}
          placeholder="Enter upper threshold (optional)"
          className="w-full"
        />
      </div>

      {policy.upperThresholdMs !== undefined &&
        policy.upperThresholdMs <= policy.thresholdMs && (
          <div className="text-sm text-destructive mt-2">
            Maximum threshold must be greater than minimum threshold
          </div>
        )}
    </div>
  );
};