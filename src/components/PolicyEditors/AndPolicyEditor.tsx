import React from 'react';
import { AndPolicy, Policy, PolicyType } from '../../types/PolicyTypes';
import { PolicyCard } from '../PolicyCard/PolicyCard';
import { createNewPolicy } from '../../utils/policyUtils';

interface AndPolicyEditorProps {
  policy: AndPolicy;
  onUpdate: (policy: AndPolicy) => void;
}

export const AndPolicyEditor: React.FC<AndPolicyEditorProps> = ({
  policy,
  onUpdate,
}) => {
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
    <div className="and-policy-editor">
      <div className="sub-policies">
        <h4>Sub Policies</h4>
        {policy.subPolicies.map((subPolicy, index) => (
          <PolicyCard
            key={index}
            policy={subPolicy}
            onUpdate={(updatedPolicy) => handleUpdateSubPolicy(index, updatedPolicy)}
            onRemove={() => handleRemoveSubPolicy(index)}
            nested={true}
          />
        ))}
        <select
          onChange={(e) => handleAddSubPolicy(e.target.value as PolicyType)}
          value=""
          className="form-input"
        >
          <option value="" disabled>Add Sub Policy</option>
          <option value="numeric_attribute">Numeric Attribute</option>
          <option value="probabilistic">Probabilistic</option>
          <option value="rate_limiting">Rate Limiting</option>
          <option value="status_code">Status Code</option>
          <option value="string_attribute">String Attribute</option>
          <option value="latency">Latency</option>
          <option value="always_sample">Always Sample</option>
          <option value="boolean_attribute">Boolean Attribute</option>
          <option value="ottl_condition">OTTL Condition</option>
          <option value="span_count">Span Count</option>
          <option value="trace_state">Trace State</option>
        </select>
      </div>
    </div>
  );
}; 