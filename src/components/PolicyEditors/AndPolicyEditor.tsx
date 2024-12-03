import React from 'react';
import { AndPolicy, Policy, PolicyType } from '../../types/PolicyTypes';
import { PolicyCard } from '../PolicyCard/PolicyCard';
import { createNewPolicy } from '../../utils/policyUtils';
import { SubPolicySelect } from '../common/SubPolicySelect';

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
        <SubPolicySelect onSelect={handleAddSubPolicy} />
      </div>
    </div>
  );
}; 