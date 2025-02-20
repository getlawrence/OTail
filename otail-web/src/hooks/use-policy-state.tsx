import { useCallback, useState } from 'react';
import { Policy, PolicyType } from '@/types/policy';
import { createNewPolicy } from '@/lib/policy/utils';

interface PolicyState {
    policies: Policy[];
}

export const usePolicyState = (initialPolicies?: Policy[]) => {
    const [policies, setPolicies] = useState<Policy[]>(initialPolicies || []);

    const updatePolicies = useCallback((newPolicies: Policy[]) => {
        setPolicies(newPolicies);
    }, []);

    const addPolicy = useCallback((typeOrPolicies: PolicyType | Policy[]) => {
        setPolicies(prev => 
            Array.isArray(typeOrPolicies)
                ? [...prev, ...typeOrPolicies]
                : [...prev, createNewPolicy(typeOrPolicies)]
        );
    }, []);

    const updatePolicy = useCallback((index: number, updatedPolicy: Policy) => {
        setPolicies(prev => prev.map((policy, i) =>
            i === index ? updatedPolicy : policy
        ));
    }, []);

    const removePolicy = useCallback((index: number) => {
        setPolicies(prev => prev.filter((_, i) => i !== index));
    }, []);

    const importPolicies = useCallback((newPolicies: Policy[]) => {
        setPolicies(prev => [...prev, ...newPolicies]);
    }, []);

    return {
        policies,
        updatePolicies,
        addPolicy,
        updatePolicy,
        removePolicy,
        importPolicies,
    };
};
