import React from 'react';
import { CompositePolicy, Policy, PolicyType } from '../../types/PolicyTypes';
import { PolicyCard } from '../PolicyCard/PolicyCard';
import { Input } from '../common/Input';
import { createNewPolicy } from '../../utils/policyUtils';

export const CompositePolicyEditor: React.FC<{
  policy: CompositePolicy;
  onUpdate: (policy: CompositePolicy) => void;
}> = ({ policy, onUpdate }) => {
  const movePolicy = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= policy.subPolicies.length) return;

    const newPolicies = [...policy.subPolicies];
    const [movedPolicy] = newPolicies.splice(fromIndex, 1);
    newPolicies.splice(toIndex, 0, movedPolicy);

    onUpdate({
      ...policy,
      subPolicies: newPolicies,
      policyOrder: newPolicies.map(p => p.name)
    });
  };

  const handleAddSubPolicy = (type: PolicyType) => {
    const newPolicy = createNewPolicy(type);
    onUpdate({
      ...policy,
      subPolicies: [...policy.subPolicies, newPolicy],
      policyOrder: [...(policy.policyOrder || []), newPolicy.name]
    });
  };

  const handleUpdateSubPolicy = (index: number, updatedPolicy: Policy) => {
    const newPolicies = [...policy.subPolicies];
    const oldName = newPolicies[index].name;
    newPolicies[index] = updatedPolicy;

    onUpdate({
      ...policy,
      subPolicies: newPolicies,
      policyOrder: (policy.policyOrder || []).map(name =>
        name === oldName ? updatedPolicy.name : name
      )
    });
  };

  const handleRemoveSubPolicy = (index: number) => {
    const removedPolicy = policy.subPolicies[index];
    onUpdate({
      ...policy,
      subPolicies: policy.subPolicies.filter((_, i) => i !== index),
      policyOrder: (policy.policyOrder || []).filter(name => name !== removedPolicy.name)
    });
  };

  return (
    <div className="composite-policy-editor">
      <div className="config-section">
        <h3>Basic Configuration</h3>
        <Input
          label="Max Total Spans Per Second"
          type="number"
          min="0"
          value={policy.maxTotalSpansPerSecond}
          onChange={(e) => onUpdate({
            ...policy,
            maxTotalSpansPerSecond: Number(e.target.value)
          })}
          helpText="Maximum number of spans to process per second (0 for unlimited)"
        />
      </div>

      <div className="config-section">
        <h3>Sub Policies</h3>
        <div className="policy-order-info">
          <span>Use the arrows to change policy execution order</span>
        </div>

        <div className="sub-policies">
          {policy.subPolicies.map((subPolicy, index) => (
            <div key={subPolicy.name} className="policy-item">
              <div className="policy-order-controls">
                <div className="policy-order-number">{index + 1}</div>
                <div className="order-buttons">
                  <button
                    className="order-button"
                    onClick={() => movePolicy(index, index - 1)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="order-button"
                    onClick={() => movePolicy(index, index + 1)}
                    disabled={index === policy.subPolicies.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <div className="policy-content">
                <PolicyCard
                  policy={subPolicy}
                  onUpdate={(updatedPolicy) => handleUpdateSubPolicy(index, updatedPolicy)}
                  onRemove={() => handleRemoveSubPolicy(index)}
                />
              </div>
            </div>
          ))}
        </div>

        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddSubPolicy(e.target.value as PolicyType);
              e.target.value = '';
            }
          }}
          value=""
          className="form-input"
        >
          <option value="">Add Sub Policy...</option>
          <option value="numeric_attribute">Numeric Attribute</option>
          <option value="probabilistic">Probabilistic</option>
          <option value="rate_limiting">Rate Limiting</option>
          <option value="status_code">Status Code</option>
          <option value="string_attribute">String Attribute</option>
          <option value="latency">Latency</option>
          <option value="always_sample">Always Sample</option>
          <option value="boolean_attribute">Boolean Attribute</option>
        </select>
      </div>
    </div>
  );
};