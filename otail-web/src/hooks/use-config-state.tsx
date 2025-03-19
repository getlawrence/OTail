import { useCallback, useState } from 'react';
import { Policy } from '@/types/policy';
import { makeDecision } from '@/lib/policy/evaluator';
import { buildPolicy } from '@/lib/policy/builder';
import { parseYamlConfig } from '@/lib/config/parser';
import { usePolicyState } from './use-policy-state';
import { useEvaluation } from './use-evaluation';

interface ConfigMode {
    mode: 'Edit' | 'Test';
}

export const useConfigState = (initialPolicies?: Policy[]) => {
    const [mode, setMode] = useState<ConfigMode['mode']>('Edit');
    const policyState = usePolicyState(initialPolicies);
    const evaluation = useEvaluation();

    const toggleMode = useCallback(() => {
        setMode(prev => {
            const newMode = prev === 'Edit' ? 'Test' : 'Edit';
            if (newMode === 'Test') {
                window.dispatchEvent(new Event('testModeActivated'));
            }
            return newMode;
        });
    }, []);

    const handleViewerChange = useCallback(async (value: string) => {
        if (mode === 'Test') {
            try {
                const parsedData = JSON.parse(value);
                const decision = await makeDecision(parsedData, policyState.policies.map(buildPolicy));
                evaluation.updateEvaluationResults(decision.policyDecisions, decision.finalDecision);
            } catch (error) {
                console.error('Invalid trace data:', error);
            }
        } else {
            try {
                const parsedConfig = parseYamlConfig(value);
                if (parsedConfig.policies && Array.isArray(parsedConfig.policies)) {
                    policyState.updatePolicies(parsedConfig.policies);
                }
            } catch (error) {
                console.error('Failed to parse YAML:', error);
            }
        }
    }, [mode, policyState, evaluation]);

    return {
        // Policy state
        policies: policyState.policies,
        updatePolicies: policyState.updatePolicies,
        handleAddPolicy: policyState.addPolicy,
        handleUpdatePolicy: policyState.updatePolicy,
        handleRemovePolicy: policyState.removePolicy,
        importPolicies: policyState.importPolicies,

        // Evaluation state
        evaluationResults: evaluation.evaluationResults,
        finalDecision: evaluation.finalDecision,

        // Mode state
        mode,
        toggleMode,
        handleViewerChange,
    };
};
