import React from 'react';
import { BooleanTagPolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';

interface BooleanTagPolicyEditorProps {
  policy: BooleanTagPolicy;
  onUpdate: (policy: BooleanTagPolicy) => void;
}

export const BooleanTagPolicyEditor: React.FC<BooleanTagPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
      <Input
        label="Key"
        value={policy.key}
        onChange={(e) => onUpdate({
          ...policy,
          key: e.target.value
        })}
        placeholder="Enter tag key"
      />
      <div className="form-field">
        <label className="form-label">Value</label>
        <select
          className="form-input"
          value={policy.value.toString()}
          onChange={(e) => onUpdate({
            ...policy,
            value: e.target.value === 'true'
          })}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    </div>
  );
}; 