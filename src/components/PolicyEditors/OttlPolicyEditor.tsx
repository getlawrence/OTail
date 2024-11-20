import React from 'react';
import { OttlPolicy } from '../../types/PolicyTypes';
import { Editor } from '@monaco-editor/react';

interface OttlPolicyEditorProps {
  policy: OttlPolicy;
  onUpdate: (policy: OttlPolicy) => void;
}

export const OttlPolicyEditor: React.FC<OttlPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  // Helper function to update span conditions
  const handleSpanConditionUpdate = (index: number, value: string) => {
    const newConditions = [...(policy.spanConditions || [])];
    newConditions[index] = value;
    onUpdate({
      ...policy,
      spanConditions: newConditions,
    });
  };

  // Helper function to update span event conditions
  const handleSpanEventConditionUpdate = (index: number, value: string) => {
    const newConditions = [...(policy.spanEventConditions || [])];
    newConditions[index] = value;
    onUpdate({
      ...policy,
      spanEventConditions: newConditions,
    });
  };

  // Add new condition handlers
  const handleAddSpanCondition = () => {
    onUpdate({
      ...policy,
      spanConditions: [...(policy.spanConditions || []), ''],
    });
  };

  const handleAddSpanEventCondition = () => {
    onUpdate({
      ...policy,
      spanEventConditions: [...(policy.spanEventConditions || []), ''],
    });
  };

  // Remove condition handlers
  const handleRemoveSpanCondition = (index: number) => {
    onUpdate({
      ...policy,
      spanConditions: (policy.spanConditions || []).filter((_, i) => i !== index),
    });
  };

  const handleRemoveSpanEventCondition = (index: number) => {
    onUpdate({
      ...policy,
      spanEventConditions: (policy.spanEventConditions || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="policy-editor">
      <div className="form-field">
        <label className="form-label">Error Mode</label>
        <select
          className="form-input"
          value={policy.errorMode || 'ignore'}
          onChange={(e) => onUpdate({
            ...policy,
            errorMode: e.target.value,
          })}
        >
          <option value="ignore">Ignore</option>
          <option value="propagate">Propagate</option>
        </select>
      </div>

      <div className="form-field">
        <label className="form-label">Span Conditions</label>
        {(policy.spanConditions || []).map((condition, index) => (
          <div key={index} className="condition-item">
            <Editor
              height="100px"
              defaultLanguage="plaintext"
              value={condition}
              onChange={(value) => handleSpanConditionUpdate(index, value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                theme: 'vs-light',
              }}
            />
            <button
              className="remove-button"
              onClick={() => handleRemoveSpanCondition(index)}
              aria-label="Remove condition"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="add-button"
          onClick={handleAddSpanCondition}
        >
          Add Span Condition
        </button>
      </div>

      <div className="form-field">
        <label className="form-label">Span Event Conditions</label>
        {(policy.spanEventConditions || []).map((condition, index) => (
          <div key={index} className="condition-item">
            <Editor
              height="100px"
              defaultLanguage="plaintext"
              value={condition}
              onChange={(value) => handleSpanEventConditionUpdate(index, value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                theme: 'vs-light',
              }}
            />
            <button
              className="remove-button"
              onClick={() => handleRemoveSpanEventCondition(index)}
              aria-label="Remove condition"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="add-button"
          onClick={handleAddSpanEventCondition}
        >
          Add Span Event Condition
        </button>
      </div>
    </div>
  );
}; 