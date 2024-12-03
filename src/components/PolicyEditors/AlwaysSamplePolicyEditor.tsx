import React from 'react';
import { AlwaysSamplePolicy } from '../../types/PolicyTypes';

interface AlwaysSamplePolicyEditorProps {
  policy: AlwaysSamplePolicy;
  onUpdate: (policy: AlwaysSamplePolicy) => void;
}

export const AlwaysSamplePolicyEditor: React.FC<AlwaysSamplePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
    </div>
  );
}; 