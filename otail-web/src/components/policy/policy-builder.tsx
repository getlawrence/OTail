'use client'

import { FC } from 'react';
import { PolicyCard } from './policy-card';
import { Policy, PolicyType } from '@/types/policy';
import { Decision } from '@/types/trace';
import { PolicySelect } from './policy-select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PolicyBuilderProps {
  policies: Policy[]
  addPolicy: (type: PolicyType) => void
  updatePolicy: (index: number, updatedPolicy: Policy) => void
  removePolicy: (index: number, policy: Policy) => void
  evaluationResult?: Record<string, Decision>
}

export const PolicyBuilder = ({
  policies,
  addPolicy,
  updatePolicy,
  removePolicy,
  evaluationResult,
}: PolicyBuilderProps) => {
  return (
    <div className="space-y-2">
      {/* List of policies */}
      {policies.map((policy, index) => (
        <PolicyCard
          key={index}
          policy={policy}
          onUpdate={(updatedPolicy) => updatePolicy(index, updatedPolicy)}
          onRemove={() => removePolicy(index, policy)}
          samplingDecision={evaluationResult?.[policy.name]}
        />
      ))}

      {/* Add step button at the bottom */}
      <PolicySelect
        onSelect={addPolicy}
        trigger={
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span>Add Policy</span>
          </Button>
        }
      />
    </div>
  );
};
