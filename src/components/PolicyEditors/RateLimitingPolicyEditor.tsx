import React from 'react';
import { RateLimitingPolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';

interface RateLimitingPolicyEditorProps {
  policy: RateLimitingPolicy;
  onUpdate: (policy: RateLimitingPolicy) => void;
}

export const RateLimitingPolicyEditor: React.FC<RateLimitingPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
      <Input
        label="Spans Per Second"
        type="number"
        min="0"
        value={policy.spansPerSecond}
        onChange={(e) => onUpdate({
          ...policy,
          spansPerSecond: Number(e.target.value)
        })}
        placeholder="Enter spans per second"
      />
    </div>
  );
}; 