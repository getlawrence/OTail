import React from 'react';
import { PolicyCard } from '../policy-card';
import { createNewPolicy } from '@/lib/policy/utils';
import { DropPolicy, Policy } from '@/types/policy';
import { PolicyType } from '@/types/policy';
import { PolicySelect } from '../policy-select';

interface DropPolicyEditorProps {
    policy: DropPolicy;
    onUpdate: (policy: DropPolicy) => void;
}

export const DropPolicyEditor: React.FC<DropPolicyEditorProps> = ({
    policy,
    onUpdate,
}) => {
    const handleAddSubPolicy = (type: PolicyType) => {
        const newPolicy = createNewPolicy(type);
        onUpdate({
            ...policy,
            drop: {
                ...policy.drop,
                drop_sub_policy: [...policy.drop.drop_sub_policy, newPolicy],
            },
        });
    };

    const handleUpdateSubPolicy = (index: number, updatedPolicy: Policy) => {
        const newSubPolicies = [...policy.drop.drop_sub_policy];
        newSubPolicies[index] = updatedPolicy;
        onUpdate({
            ...policy,
            drop: {
                ...policy.drop,
                drop_sub_policy: newSubPolicies,
            },
        });
    };

    const handleRemoveSubPolicy = (index: number) => {
        onUpdate({
            ...policy,
            drop: {
                ...policy.drop,
                drop_sub_policy: policy.drop.drop_sub_policy.filter((_, i) => i !== index),
            },
        });
    };

    return (
        <div className="drop-policy-editor">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Drop Sub Policies</h4>
                    <PolicySelect onSelect={handleAddSubPolicy} />
                </div>
                
                <div className="space-y-3">
                    {policy.drop.drop_sub_policy.map((subPolicy, index) => (
                        <PolicyCard
                            key={index}
                            policy={subPolicy}
                            onUpdate={(updatedPolicy) => handleUpdateSubPolicy(index, updatedPolicy)}
                            onRemove={() => handleRemoveSubPolicy(index)}
                            nested={true}
                        />
                    ))}
                    
                    {policy.drop.drop_sub_policy.length === 0 && (
                        <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground">
                            No drop sub-policies added yet. Click "Add Policy" to get started.
                        </div>
                    )}
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <p><strong>Note:</strong> This policy will return a "Dropped" decision when all sub-policies return "Sampled". 
                    Otherwise, it returns "Not Sampled".</p>
                </div>
            </div>
        </div>
    );
};
