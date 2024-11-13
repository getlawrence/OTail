import React from 'react';
import { CompositePolicy, Policy, PolicyType } from '../../types/PolicyTypes';
import { PolicyCard } from '../PolicyCard/PolicyCard';
import { createNewPolicy } from '../../utils/policyUtils';
import './CompositePolicyEditor.css';

interface CompositePolicyEditorProps {
  policy: CompositePolicy;
  onUpdate: (policy: CompositePolicy) => void;
}

export const CompositePolicyEditor: React.FC<CompositePolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
  const handleOperatorChange = (operator: 'and' | 'or') => {
    onUpdate({
      ...policy,
      operator,
    });
  };

  const handleAddSubPolicy = (type: PolicyType) => {
    const newPolicy = createNewPolicy(type);
    onUpdate({
      ...policy,
      subPolicies: [...policy.subPolicies, newPolicy],
    });
  };

  const handleUpdateSubPolicy = (index: number, updatedPolicy: Policy) => {
    const newSubPolicies = [...policy.subPolicies];
    newSubPolicies[index] = updatedPolicy;
    onUpdate({
      ...policy,
      subPolicies: newSubPolicies,
    });
  };

  const handleRemoveSubPolicy = (index: number) => {
    onUpdate({
      ...policy,
      subPolicies: policy.subPolicies.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="composite-policy-editor">
      <div className="operator-selector">
        <label className="form-label">Operator</label>
        <select
          value={policy.operator}
          onChange={(e) => handleOperatorChange(e.target.value as 'and' | 'or')}
          className="form-input"
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>
      </div>
      <div className="sub-policies">
        <h4>Sub Policies</h4>
        {policy.subPolicies.map((subPolicy, index) => (
          <PolicyCard
            key={index}
            policy={subPolicy}
            onUpdate={(updatedPolicy) => handleUpdateSubPolicy(index, updatedPolicy)}
            onRemove={() => handleRemoveSubPolicy(index)}
          />
        ))}
        <select
          onChange={(e) => handleAddSubPolicy(e.target.value as PolicyType)}
          value=""
          className="form-input"
        >
          <option value="" disabled>Add Sub Policy</option>
          <option value="numeric_attribute">Numeric Attribute</option>
          <option value="string_attribute">String Attribute</option>
          {/* Add other policy types */}
        </select>
      </div>
    </div>
  );
}; 