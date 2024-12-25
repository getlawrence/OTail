import { useCallback, useState } from 'react';
import { Policy, PolicyType } from '@/types/policy';
import { Decision } from '@/types/trace';
import { buildPolicy } from '@/lib/policy/builder';
import { createNewPolicy } from '@/lib/policy/utils';
import { parseYamlConfig } from '@/lib/config/parser';
import { TailSamplingConfig } from '@/types/tailsampling';
import { makeDecision } from '@/lib/policy/evaluator';

type Mode = 'Edit' | 'Test';

interface ConfigState {
    config: TailSamplingConfig;
    simulationData: string;
    mode: Mode;
    finalDecision: Decision;
    evaluationResults?: Record<string, Decision>;
}

export const useConfigState = (policies?: Policy[]) => {
    const [state, setState] = useState<ConfigState>({
        config: { policies: policies || [] },
        simulationData: '',
        mode: 'Edit',
        finalDecision: Decision.NotSampled,
        evaluationResults: undefined,
    });

    const toggleMode = useCallback(() => {
        setState(prev => ({ ...prev, mode: prev.mode === 'Edit' ? 'Test' : 'Edit' }));
    }, []);

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

    const handleViewerChange = useCallback((value: string) => {
        if (state.mode === 'Test') {
            try {
                const parsedData = JSON.parse(value);
                const decision = makeDecision(parsedData, state.config.policies.map(buildPolicy));
                setState(prev => ({
                    ...prev,
                    evaluationResults: decision.policyDecisions,
                    finalDecision: decision.finalDecision,
                }));
            } catch (error) {
                console.error('Invalid trace data:', error);
            }
        } else {
            try {
                const parsedConfig = parseYamlConfig(value);
                if (parsedConfig.policies && Array.isArray(parsedConfig.policies)) {
                    setState(prev => ({ ...prev, config: parsedConfig }));
                }
            } catch (error) {
                console.error('Failed to parse YAML:', error);
            }
        }
    }, [state.mode, state.config.policies]);
    return {
        state,
        toggleMode,
        updatePolicies,
        handleAddPolicy,
        handleUpdatePolicy,
        handleRemovePolicy,
        handleViewerChange,
    };
};