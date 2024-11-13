import React from 'react';
import { StringAttributePolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';

interface StringAttributePolicyEditorProps {
  policy: StringAttributePolicy;
  onUpdate: (policy: StringAttributePolicy) => void;
}

export const StringAttributePolicyEditor: React.FC<StringAttributePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
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
        label="Key"
        value={policy.key}
        onChange={(e) => onUpdate({
          ...policy,
          key: e.target.value
        })}
        placeholder="Enter attribute key"
      />
      <div className="values-list">
        <label className="form-label">Values</label>
        {policy.values.map((value, index) => (
          <div key={index} className="value-item">
            <Input
              value={value}
              onChange={(e) => handleUpdateValue(index, e.target.value)}
              placeholder="Enter value"
            />
            <button 
              className="remove-button"
              onClick={() => handleRemoveValue(index)}
            >
              Remove
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