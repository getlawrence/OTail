import React from 'react';
import { NumericTagPolicy } from '@/types/policy'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Combobox } from '@/components/ui/combobox';
import { getOtelAttributes } from '@/utils/otel-attributes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface NumericTagPolicyEditorProps {
  policy: NumericTagPolicy;
  onUpdate: (policy: NumericTagPolicy) => void;
}

export const NumericTagPolicyEditor: React.FC<NumericTagPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const handleChange = (field: keyof NumericTagPolicy, value: string | number) => {
    onUpdate({
      ...policy,
      [field]: value,
    });
  };

  const otelAttributes = React.useMemo(() => getOtelAttributes(), []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="key">Attribute Key</Label>
          <Tooltip>
            <TooltipTrigger>
              <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select from standard OpenTelemetry attributes or enter a custom key</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Combobox
          id="key"
          value={policy.key}
          onChange={(value) => handleChange('key', value)}
          options={otelAttributes}
          placeholder="Select or type an attribute key"
          allowCustomValue
        />
      </div>
      
      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minValue">Minimum Value</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="minValue"
                type="number"
                value={policy.minValue}
                onChange={(e) => handleChange('minValue', Number(e.target.value))}
                className="w-24"
              />
              <Slider
                value={[policy.minValue]}
                onValueChange={([value]) => handleChange('minValue', value)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxValue">Maximum Value</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="maxValue"
                type="number"
                value={policy.maxValue}
                onChange={(e) => handleChange('maxValue', Number(e.target.value))}
                className="w-24"
              />
              <Slider
                value={[policy.maxValue]}
                onValueChange={([value]) => handleChange('maxValue', value)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};