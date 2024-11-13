import React from 'react';
import { BasePolicy } from '../../types/PolicyTypes';

interface BasePolicyEditorProps<T extends BasePolicy> {
  policy: T;
  onUpdate: (updatedPolicy: T) => void;
}

export const BasePolicyEditor = <T extends BasePolicy>({ 
  policy, 
  onUpdate 
}: BasePolicyEditorProps<T>) => {
  return (
    <div className="base-policy-editor">
      <input
        type="text"
        value={policy.name}
        onChange={(e) => onUpdate({ ...policy, name: e.target.value })}
        placeholder="Policy Name"
      />
    </div>
  );
}; 