import React from 'react';
import { AlwaysSamplePolicy } from '../../types/PolicyTypes';
import { BasePolicyEditor } from '../common/BasePolicyEditor';

interface AlwaysSamplePolicyEditorProps {
  policy: AlwaysSamplePolicy;
  onUpdate: (policy: AlwaysSamplePolicy) => void;
}

export const AlwaysSamplePolicyEditor: React.FC<AlwaysSamplePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  // Since AlwaysSamplePolicy only has base fields, we can just use BasePolicyEditor
  return (
    <div className="policy-editor">
      <p className="policy-description">
        This policy will always sample all traces. Use this policy to ensure 100% sampling rate.
      </p>
    </div>
  );
}; 