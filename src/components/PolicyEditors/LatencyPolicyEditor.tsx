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
  const handleChange = (field: keyof Pick<LatencyPolicy, 'thresholdMs' | 'upperThresholdMs'>, value: number) => {
    onUpdate({
      ...policy,
      [field]: value
    });
  };

  return (
    <div className="policy-editor">
      <p className="policy-description">
        Sample traces based on their latency. Traces with latency between the lower and upper thresholds will be sampled.
      </p>
      
      <Input
        label="Lower Threshold (ms)"
        type="number"
        min="0"
        value={policy.thresholdMs}
        onChange={(e) => handleChange('thresholdMs', Number(e.target.value))}
        placeholder="Enter minimum latency threshold in milliseconds"
      />

      <Input
        label="Upper Threshold (ms)"
        type="number"
        min={policy.thresholdMs || 0}
        value={policy.upperThresholdMs}
        onChange={(e) => handleChange('upperThresholdMs', Number(e.target.value))}
        placeholder="Enter maximum latency threshold in milliseconds (optional)"
      />

      {policy.upperThresholdMs !== undefined && 
       policy.upperThresholdMs <= policy.thresholdMs && (
        <div className="validation-warning">
          Upper threshold should be greater than lower threshold
        </div>
      )}
    </div>
  );
}; 