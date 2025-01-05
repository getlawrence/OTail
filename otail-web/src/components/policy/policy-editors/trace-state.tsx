import React from 'react';
import { Input } from '@/components/ui/input';
import { TraceStatePolicy } from '@/types/policy';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface TraceStatePolicyEditorProps {
  policy: TraceStatePolicy;
  onUpdate: (policy: TraceStatePolicy) => void;
}

export const TraceStatePolicyEditor: React.FC<TraceStatePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const handleKeyChange = (key: string) => {
    onUpdate({
      ...policy,
      key
    });
  };

  const handleAddValue = () => {
    onUpdate({
      ...policy,
      values: [...policy.values, '']
    });
  };

  const handleUpdateValue = (index: number, value: string) => {
    const newValues = [...policy.values];
    newValues[index] = value;
    onUpdate({
      ...policy,
      values: newValues
    });
  };

  const handleRemoveValue = (index: number) => {
    onUpdate({
      ...policy,
      values: policy.values.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Trace State Key</Label>
        <Input
          value={policy.key}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="Enter trace state key"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Trace State Values</Label>
        <div className="space-y-2">
          {policy.values.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={value}
                onChange={(e) => handleUpdateValue(index, e.target.value)}
                placeholder="Enter trace state value"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveValue(index)}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddValue}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Value
          </Button>
        </div>
      </div>
    </div>
  );
};