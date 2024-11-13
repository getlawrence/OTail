import React from 'react';
import { StringTagPolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';

interface StringTagPolicyEditorProps {
  policy: StringTagPolicy;
  onUpdate: (policy: StringTagPolicy) => void;
}

export const StringTagPolicyEditor: React.FC<StringTagPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const handleKeyChange = (key: string) => {
    onUpdate({
      ...policy,
      key
    });
  };

  const handleAddValue = () => {
    onUpdate({
      ...policy,
      values: [...policy.values, '']
    });
  };

  const handleUpdateValue = (index: number, value: string) => {
    const newValues = [...policy.values];
    newValues[index] = value;
    onUpdate({
      ...policy,
      values: newValues
    });
  };

  const handleRemoveValue = (index: number) => {
    onUpdate({
      ...policy,
      values: policy.values.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="policy-editor">
      <Input
        label="Tag Key"
        value={policy.key}
        onChange={(e) => handleKeyChange(e.target.value)}
        placeholder="Enter tag key"
      />
      
      <div className="tag-values">
        <label className="form-label">Tag Values</label>
        {policy.values.map((value, index) => (
          <div key={index} className="tag-value-item">
            <Input
              value={value}
              onChange={(e) => handleUpdateValue(index, e.target.value)}
              placeholder="Enter tag value"
            />
            <button
              className="remove-button"
              onClick={() => handleRemoveValue(index)}
              aria-label="Remove value"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="add-button"
          onClick={handleAddValue}
        >
          Add Value
        </button>
      </div>
    </div>
  );
}; 