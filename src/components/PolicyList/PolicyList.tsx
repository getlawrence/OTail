import React from 'react';
import { Policy } from '../../types/PolicyTypes';
import { PolicyCard } from '../PolicyCard/PolicyCard';
import './PolicyList.css';
import { EvaluationResult } from '../../types/TraceTypes';

interface PolicyListProps {
  policies: Policy[];
  onUpdatePolicy: (index: number, policy: Policy) => void;
  onRemovePolicy: (index: number) => void;
  evaluationResult?: Record<string, EvaluationResult>;
}

export const PolicyList: React.FC<PolicyListProps> = ({
  policies,
  onUpdatePolicy,
  onRemovePolicy,
  evaluationResult
}) => {
  return (
    <div className="policy-list">
      {policies.map((policy, index) => (
        <PolicyCard
          key={index}
          policy={policy}
          onUpdate={(updatedPolicy) => onUpdatePolicy(index, updatedPolicy)}
          onRemove={() => onRemovePolicy(index)}
          evaluationResult={evaluationResult?.[policy.name]}
        />
      ))}
    </div>
  );
}; 