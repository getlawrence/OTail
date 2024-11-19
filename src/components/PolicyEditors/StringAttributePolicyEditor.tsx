import React from 'react';
import { StringAttributePolicy } from '../../types/PolicyTypes';
import { Input } from '../common/Input';
import './StringAttributePolicyEditor.css';

interface StringAttributePolicyEditorProps {
  policy: StringAttributePolicy;
  onUpdate: (policy: StringAttributePolicy) => void;
}

export const StringAttributePolicyEditor: React.FC<StringAttributePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  return (
    <div className="policy-editor">
      <Input
        label="Key"
        value={policy.key}
        onChange={(e) => onUpdate({ ...policy, key: e.target.value })}
        placeholder="Enter attribute key"
        helpText="The key of the attribute to match against"
      />
      
      <div className="values-section">
        {policy.values.map((value, index) => (
          <div key={index} className="value-input-group">
            <Input
              value={value}
              onChange={(e) => {
                const newValues = [...policy.values];
                newValues[index] = e.target.value;
                onUpdate({ ...policy, values: newValues });
              }}
              placeholder="Enter value"
            />
            <button
              className="remove-value-button"
              onClick={() => {
                const newValues = policy.values.filter((_, i) => i !== index);
                onUpdate({ ...policy, values: newValues });
              }}
            >
              Remove
            </button>
          </div>
        ))}
        
        <button
          className="add-value-button"
          onClick={() => {
            onUpdate({ ...policy, values: [...policy.values, ''] });
          }}
        >
          Add Value
        </button>
      </div>

      <div className="matching-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={policy.enabledRegexMatching}
            onChange={(e) => onUpdate({
              ...policy,
              enabledRegexMatching: e.target.checked
            })}
          />
          Enable Regex Matching
        </label>

        {policy.enabledRegexMatching && (
          <Input
            label="Cache Max Size"
            type="number"
            value={policy.cacheMaxSize}
            onChange={(e) => onUpdate({
              ...policy,
              cacheMaxSize: Number(e.target.value)
            })}
            helpText="Maximum number of regex patterns to cache"
          />
        )}
      </div>
    </div>
  );
}; 