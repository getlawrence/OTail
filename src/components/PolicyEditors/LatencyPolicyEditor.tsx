import React from 'react';
import { LatencyPolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';

interface LatencyPolicyEditorProps {
  policy: LatencyPolicy;
  onUpdate: (policy: LatencyPolicy) => void;
}

export const LatencyPolicyEditor: React.FC<LatencyPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
      <Input
        label="Threshold (ms)"
        type="number"
        min="0"
        value={policy.thresholdMs}
        onChange={(e) => onUpdate({
          ...policy,
          thresholdMs: Number(e.target.value)
        })}
        placeholder="Enter latency threshold in milliseconds"
      />
    </div>
  );
}; 