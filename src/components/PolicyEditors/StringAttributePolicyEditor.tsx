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
  // Helper function to update any policy field
  const updateField = <K extends keyof StringAttributePolicy>(
    field: K,
    value: StringAttributePolicy[K]
  ) => {
    onUpdate({ ...policy, [field]: value });
  };

  return (
    <div className="policy-editor string-attribute-editor">
      {/* Main Configuration Section */}
      <div className="config-section">
        <h3>Basic Configuration</h3>
        <Input
          label="Attribute Key"
          value={policy.key}
          onChange={(e) => updateField('key', e.target.value)}
          placeholder="e.g., http.method, user.id"
          helpText="The attribute key to match against"
        />
      </div>

      {/* Matching Options Section */}
      <div className="config-section">
        <h3>Matching Options</h3>
        <div className="matching-options">
          <label className="toggle-option">
            <div className="toggle-header">
              <span>Use Regular Expressions</span>
              <input
                type="checkbox"
                checked={policy.enabledRegexMatching}
                onChange={(e) => {
                  updateField('enabledRegexMatching', e.target.checked);
                  if (e.target.checked && !policy.cacheMaxSize) {
                    updateField('cacheMaxSize', 10000); // Default cache size
                  }
                }}
              />
            </div>
            <span className="option-description">
              Enable to use regex patterns instead of exact matching
            </span>
          </label>

          <label className="toggle-option">
            <div className="toggle-header">
              <span>Invert Match</span>
              <input
                type="checkbox"
                checked={policy.invertMatch}
                onChange={(e) => updateField('invertMatch', e.target.checked)}
              />
            </div>
            <span className="option-description">
              Sample traces that don't match the specified values
            </span>
          </label>
        </div>

        {policy.enabledRegexMatching && (
          <div className="cache-config">
            <Input
              label="Cache Size"
              type="number"
              min="1000"
              step="1000"
              value={policy.cacheMaxSize}
              onChange={(e) => updateField('cacheMaxSize', Number(e.target.value))}
              helpText="Number of regex results to cache (recommended: 10000)"
            />
          </div>
        )}
      </div>

      {/* Values Section */}
      <div className="config-section">
        <h3>
          {policy.enabledRegexMatching ? 'Regex Patterns' : 'Match Values'}
          <button
            className="add-value-button"
            onClick={() => updateField('values', [...policy.values, ''])}
          >
            Add {policy.enabledRegexMatching ? 'Pattern' : 'Value'}
          </button>
        </h3>
        
        {policy.values.length === 0 ? (
          <div className="empty-state">
            No {policy.enabledRegexMatching ? 'patterns' : 'values'} added yet.
            Click the button above to add one.
          </div>
        ) : (
          <div className="values-list">
            {policy.values.map((value, index) => (
              <div key={index} className="value-item">
                <Input
                  value={value}
                  onChange={(e) => {
                    const newValues = [...policy.values];
                    newValues[index] = e.target.value;
                    updateField('values', newValues);
                  }}
                  placeholder={policy.enabledRegexMatching ? 
                    "e.g., ^api\\..*" : 
                    "e.g., GET, POST"
                  }
                />
                <button
                  className="remove-value-button"
                  onClick={() => {
                    const newValues = policy.values.filter((_, i) => i !== index);
                    updateField('values', newValues);
                  }}
                  aria-label="Remove value"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 