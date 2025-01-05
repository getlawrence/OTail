import React from 'react';
import { PolicyCard } from '../policy-card';
import { createNewPolicy } from '@/lib/policy/utils';
import { AndPolicy, Policy } from '@/types/policy';
import { PolicyType } from '@/types/policy';
import { PolicySelect } from '../policy-select';

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
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Sub Policies</h4>
                    <PolicySelect onSelect={handleAddSubPolicy} />
                </div>
                
                <div className="space-y-3">
                    {policy.subPolicies.map((subPolicy, index) => (
                        <PolicyCard
                            key={index}
                            policy={subPolicy}
                            onUpdate={(updatedPolicy) => handleUpdateSubPolicy(index, updatedPolicy)}
                            onRemove={() => handleRemoveSubPolicy(index)}
                            nested={true}
                        />
                    ))}
                    
                    {policy.subPolicies.length === 0 && (
                        <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground">
                            No sub-policies added yet. Click "Add Policy" to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 