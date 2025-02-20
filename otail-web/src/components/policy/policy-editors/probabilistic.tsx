import React from 'react';
import { ProbabilisticPolicy } from '@/types/policy';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface ProbabilisticPolicyEditorProps {
  policy: ProbabilisticPolicy;
  onUpdate: (policy: ProbabilisticPolicy) => void;
}

export const ProbabilisticPolicyEditor: React.FC<ProbabilisticPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const handleSamplingRateChange = (value: number) => {
    onUpdate({
      ...policy,
      samplingPercentage: value,
    });
  };

  return (
    <div className="policy-editor p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="samplingRate">Sampling Rate</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
                <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Percentage of spans that will be sampled (0-100)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4">
          <Slider
            id="samplingRate"
            min={0}
            max={100}
            step={1}
            value={[policy.samplingPercentage]}
            onValueChange={(value) => handleSamplingRateChange(value[0])}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            max={100}
            value={policy.samplingPercentage}
            onChange={(e) => handleSamplingRateChange(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-muted-foreground">%</span>
        </div>

        <p className="text-sm text-muted-foreground">
          {policy.samplingPercentage === 0
            ? "No spans will be sampled"
            : policy.samplingPercentage === 100
              ? "All spans will be sampled"
              : `Approximately ${policy.samplingPercentage}% of spans will be sampled`}
        </p>
      </div>
    </div>
  );
};