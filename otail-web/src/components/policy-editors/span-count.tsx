import React from 'react';
import { Input } from '@/components/ui/input';
import { SpanCountPolicy } from '@/types/policy';
import { Label } from '@/components/ui/label';

interface SpanCountPolicyEditorProps {
  policy: SpanCountPolicy;
  onUpdate: (policy: SpanCountPolicy) => void;
}

export const SpanCountPolicyEditor: React.FC<SpanCountPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const handleChange = (field: 'minSpans' | 'maxSpans', value: number) => {
    onUpdate({
      ...policy,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Minimum Spans</Label>
        <Input
          type="number"
          min="0"
          value={policy.minSpans}
          onChange={(e) => handleChange('minSpans', Number(e.target.value))}
          placeholder="Enter minimum number of spans"
        />
      </div>

      <div className="space-y-2">
        <Label>Maximum Spans</Label>
        <Input
          type="number"
          min="0"
          value={policy.maxSpans}
          onChange={(e) => handleChange('maxSpans', Number(e.target.value))}
          placeholder="Enter maximum number of spans"
        />
      </div>
    </div>
  );
};