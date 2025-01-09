import { useCallback, useState } from 'react';
import { Policy, PolicyType } from '@/types/policy';
import { Decision } from '@/types/trace';
import { buildPolicy } from '@/lib/policy/builder';
import { createNewPolicy } from '@/lib/policy/utils';
import { parseYamlConfig } from '@/lib/config/parser';
import { makeDecision } from '@/lib/policy/evaluator';

interface PolicyConfigState {
    config: { policies: Policy[] };
    simulationData: string;
    evaluationResults?:  Record<string, Decision>;
    finalDecision: Decision;
}

export const usePolicyConfig = (initialPolicies?: Policy[]) => {
    const [state, setState] = useState<PolicyConfigState>({
        config: { policies: initialPolicies || [] },
        simulationData: '',
        finalDecision: Decision.NotSampled,
        evaluationResults: undefined,
    });

    const updatePolicies = useCallback((newPolicies: Policy[]) => {
        setState(prev => ({
            ...prev,
            config: { ...prev.config, policies: newPolicies },
        }));
    }, []);

    const handleAddPolicy = useCallback((type: PolicyType) => {
        setState(prev => ({
            ...prev,
            config: {
                ...prev.config,
                policies: [...prev.config.policies, createNewPolicy(type)],
            },
        }));
    }, []);

    const handleUpdatePolicy = useCallback((index: number, updatedPolicy: Policy) => {
        setState(prev => ({
            ...prev,
            config: {
                ...prev.config,
                policies: prev.config.policies.map((policy, i) =>
                    i === index ? updatedPolicy : policy
                ),
            },
        }));
    }, []);

    const handleRemovePolicy = useCallback((index: number) => {
        setState(prev => ({
            ...prev,
            config: {
                ...prev.config,
                policies: prev.config.policies.filter((_, i) => i !== index),
            },
        }));
    }, []);

    const updateEvaluationResults = useCallback((evaluationResults:  Record<string, Decision>, finalDecision: Decision) => {
        setState(prev => ({
            ...prev,
            evaluationResults,
            finalDecision,
        }));
    }, []);

    return {
        state,
        updatePolicies,
        handleAddPolicy,
        handleUpdatePolicy,
        handleRemovePolicy,
        updateEvaluationResults,
    };
};

interface ConfigModeState {
    mode: 'Edit' | 'Test';
}

export const useConfigMode = () => {
    const [state, setState] = useState<ConfigModeState>({
        mode: 'Edit',
    });

    const toggleMode = useCallback(() => {
        setState(prev => ({ ...prev, mode: prev.mode === 'Edit' ? 'Test' : 'Edit' }));
    }, []);

    return {
        mode: state.mode,
        toggleMode,
    };
};

// Keep the original hook for backward compatibility, but implement it using the new hooks
export const useConfigState = (policies?: Policy[]) => {
    const policyConfig = usePolicyConfig(policies);
    const { mode, toggleMode } = useConfigMode();

    const handleViewerChange = useCallback((value: string) => {
        console.log("test", value);
        if (mode === 'Test') {
            try {
                const parsedData = JSON.parse(value);
                const decision = makeDecision(parsedData, policyConfig.state.config.policies.map(buildPolicy));
                policyConfig.updateEvaluationResults(decision.policyDecisions, decision.finalDecision);
            } catch (error) {
                console.error('Invalid trace data:', error);
            }
        } else {
            try {
                const parsedConfig = parseYamlConfig(value);
                if (parsedConfig.policies && Array.isArray(parsedConfig.policies)) {
                    policyConfig.updatePolicies(parsedConfig.policies);
                }
            } catch (error) {
                console.error('Failed to parse YAML:', error);
            }
        }
    }, [mode, policyConfig]);

    return {
        state: {
            ...policyConfig.state,
            mode,
        },
        toggleMode,
        updatePolicies: policyConfig.updatePolicies,
        handleAddPolicy: policyConfig.handleAddPolicy,
        handleUpdatePolicy: policyConfig.handleUpdatePolicy,
        handleRemovePolicy: policyConfig.handleRemovePolicy,
        handleViewerChange,
    };
};