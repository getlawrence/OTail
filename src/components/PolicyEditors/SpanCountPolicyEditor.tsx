import React from 'react';
import { SpanCountPolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';

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
    <div className="policy-editor">
      <Input
        label="Minimum Spans"
        type="number"
        min="0"
        value={policy.minSpans}
        onChange={(e) => handleChange('minSpans', Number(e.target.value))}
        placeholder="Enter minimum number of spans"
      />
      <Input
        label="Maximum Spans"
        type="number"
        min="0"
        value={policy.maxSpans}
        onChange={(e) => handleChange('maxSpans', Number(e.target.value))}
        placeholder="Enter maximum number of spans"
      />
    </div>
  );
}; 