import React from 'react';
import { Policy } from '../types/PolicyTypes';
import { ProbabilisticPolicyEditor } from './PolicyEditors/ProbabilisticPolicyEditor';
import { NumericTagPolicyEditor } from './PolicyEditors/NumericAttributePolicyEditor';

interface PolicyCardProps {
  policy: Policy;
  onUpdate: (updatedPolicy: Policy) => void;
  onRemove: () => void;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onUpdate, onRemove }) => {
  const renderPolicyEditor = () => {
    switch (policy.type) {
      case 'numeric_tag':
        return <NumericTagPolicyEditor policy={policy} onUpdate={onUpdate} />;
      case 'probabilistic':
        return <ProbabilisticPolicyEditor policy={policy} onUpdate={onUpdate} />;
      // Add other policy types...
      default:
        return <div>Unknown policy type</div>;
    }
  };

  return (
    <div className="policy-card">
      <div className="policy-card-header">
        <h3>{policy.name}</h3>
        <button onClick={onRemove}>Remove</button>
      </div>
      <div className="policy-card-content">
        {renderPolicyEditor()}
      </div>
    </div>
  );
}; 