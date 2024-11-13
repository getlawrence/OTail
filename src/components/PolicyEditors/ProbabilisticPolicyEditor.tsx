import React from 'react';
import { ProbabilisticPolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';

interface ProbabilisticPolicyEditorProps {
  policy: ProbabilisticPolicy;
  onUpdate: (policy: ProbabilisticPolicy) => void;
}

export const ProbabilisticPolicyEditor: React.FC<ProbabilisticPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
      <Input
        label="Sampling Percentage"
        type="number"
        min="0"
        max="100"
        value={policy.samplingPercentage}
        onChange={(e) => onUpdate({
          ...policy,
          samplingPercentage: Number(e.target.value)
        })}
      />
    </div>
  );
}; 