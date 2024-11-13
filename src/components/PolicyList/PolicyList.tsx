import React from 'react';
import { Policy } from '../../types/PolicyTypes';
import { PolicyCard } from '../PolicyCard/PolicyCard';

interface PolicyListProps {
  policies: Policy[];
  onUpdatePolicy: (index: number, policy: Policy) => void;
  onRemovePolicy: (index: number) => void;
}

export const PolicyList: React.FC<PolicyListProps> = ({
  policies,
  onUpdatePolicy,
  onRemovePolicy,
}) => {
  return (
    <div className="policy-list">
      {policies.map((policy, index) => (
        <PolicyCard
          key={index}
          policy={policy}
          onUpdate={(updatedPolicy) => onUpdatePolicy(index, updatedPolicy)}
          onRemove={() => onRemovePolicy(index)}
        />
      ))}
    </div>
  );
}; 