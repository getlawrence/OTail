'use client'

import { FC } from 'react';
import { PolicyCard } from './policy-card';
import { Policy, PolicyType } from '@/types/policy';
import { Decision } from '@/types/trace';
import { PolicySelect } from './policy-select';


interface PolicyBuilderProps {
  policies: Policy[]
  addPolicy: (type: PolicyType) => void
  updatePolicy: (index: number, updatedPolicy: Policy) => void
  removePolicy: (index: number) => void
  evaluationResult?: Record<string, Decision>
}

export const PolicyBuilder: FC<PolicyBuilderProps> = ({ policies, addPolicy, updatePolicy, removePolicy, evaluationResult }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <PolicySelect onSelect={addPolicy} />
      </div>
      <div className="space-y-4">
        {policies.map((policy, index) => (
          <PolicyCard
            key={index}
            policy={policy}
            onUpdate={(updatedPolicy) => updatePolicy(index, updatedPolicy)}
            onRemove={() => removePolicy(index)}
            samplingDecision={evaluationResult?.[policy.name]}
          />
        ))}
      </div>
    </div>
  )
}
