import React from 'react';
import { CompositePolicy, Policy, PolicyType } from '@/types/policy';
import { PolicyCard } from '../policy-card';
import { Input } from '../ui/input';
import { createNewPolicy } from '@/lib/policy/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { PolicySelect } from '../policy-select';

interface SubPolicyItemProps {
    policy: Policy;
    index: number;
    total: number;
    onMove: (direction: 'up' | 'down') => void;
    onUpdate: (policy: Policy) => void;
    onRemove: () => void;
}

const SubPolicyItem: React.FC<SubPolicyItemProps> = ({
    policy,
    index,
    total,
    onMove,
    onUpdate,
    onRemove,
}) => (
    <Card className="mb-4 group hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                    </span>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMove('up')}
                            disabled={index === 0}
                            className="h-6 hover:bg-primary/10"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMove('down')}
                            disabled={index === total - 1}
                            className="h-6 hover:bg-primary/10"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-grow">
                    <PolicyCard policy={policy} onUpdate={onUpdate} onRemove={onRemove} />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
);

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
        <div className='space-y-8'>
            <div className="space-y-6">
                <div className="p-6 rounded-lg border">
                    <Label htmlFor="maxSpans" className="text-lg font-semibold">Max Total Spans Per Second</Label>
                    <div className="mt-2 relative">
                        <Input
                            id="maxSpans"
                            type="number"
                            min="0"
                            value={policy.maxTotalSpansPerSecond}
                            onChange={(e) => onUpdate({
                                ...policy,
                                maxTotalSpansPerSecond: Number(e.target.value)
                            })}
                            className="w-full max-w-sm pr-12 focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            spans/s
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Sub Policies</h3>
                        <PolicySelect onSelect={handleAddSubPolicy} />
                    </div>
                    {policy.subPolicies.map((subPolicy, index) => (
                        <SubPolicyItem
                            key={subPolicy.name}
                            policy={subPolicy}
                            index={index}
                            total={policy.subPolicies.length}
                            onMove={(direction) => {
                                const newIndex = direction === 'up' ? index - 1 : index + 1;
                                movePolicy(index, newIndex);
                            }}
                            onUpdate={(updatedPolicy) => handleUpdateSubPolicy(index, updatedPolicy)}
                            onRemove={() => handleRemoveSubPolicy(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};