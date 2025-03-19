import { useCallback, useState } from 'react';
import { Policy } from '@/types/policy';

export const usePolicyState = (initialPolicies?: Policy[]) => {
    const [policies, setPolicies] = useState<Policy[]>(initialPolicies || []);

    const updatePolicies = useCallback((newPolicies: Policy[]) => {
        setPolicies(newPolicies);
    }, []);

    const addPolicy = useCallback((policyOrPolicies: Policy | Policy[]) => {
        setPolicies(prev => 
            Array.isArray(policyOrPolicies)
                ? [...prev, ...policyOrPolicies]
                : [...prev,  policyOrPolicies]
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
