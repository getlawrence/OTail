import { Policy } from '@/types/policy';
import { usePolicyState } from './use-policy-state';
import { useEvaluation } from './use-evaluation';
import { useSimulation } from './use-simulation';

export const usePolicyConfig = (initialPolicies?: Policy[]) => {
    const policyState = usePolicyState(initialPolicies);
    const evaluation = useEvaluation();
    const simulation = useSimulation();

    return {
        // Policy management
        policies: policyState.policies,
        updatePolicies: policyState.updatePolicies,
        handleAddPolicy: policyState.addPolicy,
        handleUpdatePolicy: policyState.updatePolicy,
        handleRemovePolicy: policyState.removePolicy,
        importPolicies: policyState.importPolicies,

        // Evaluation
        evaluationResults: evaluation.evaluationResults,
        finalDecision: evaluation.finalDecision,
        updateEvaluationResults: evaluation.updateEvaluationResults,

        // Simulation
        simulationData: simulation.simulationData,
        updateSimulationData: simulation.updateSimulationData,
    };
};
