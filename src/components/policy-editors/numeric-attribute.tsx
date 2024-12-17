import React from 'react';
import { NumericTagPolicy } from '@/types/policy'
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';

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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="key">Attribute Key</Label>
        <Input
          id="key"
          value={policy.key}
          onChange={(e) => handleChange('key', e.target.value)}
          placeholder="Enter attribute key"
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