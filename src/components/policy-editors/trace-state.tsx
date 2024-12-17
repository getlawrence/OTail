import React from 'react';
import { Input } from '../ui/input';
import { TraceStatePolicy } from '@/types/policy';

interface TraceStatePolicyEditorProps {
  policy: TraceStatePolicy;
  onUpdate: (policy: TraceStatePolicy) => void;
}

export const TraceStatePolicyEditor: React.FC<TraceStatePolicyEditorProps> = ({
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
        value={policy.key}
        onChange={(e) => handleKeyChange(e.target.value)}
        placeholder="Enter trace state key"
      />
      
      <div className="trace-state-values">
        <label className="form-label">Trace State Values</label>
        {policy.values.map((value, index) => (
          <div key={index} className="trace-state-value-item">
            <Input
              value={value}
              onChange={(e) => handleUpdateValue(index, e.target.value)}
              placeholder="Enter trace state value"
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