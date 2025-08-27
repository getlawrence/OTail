import { PolicyEvaluator, AsyncPolicyEvaluator, evaluatePolicy } from '../evaluators/BaseEvaluator';
import { Trace, Decision, DecisionResult } from '@/types/trace';


export const makeDecision = async (trace: Trace, policies: (PolicyEvaluator | AsyncPolicyEvaluator)[]): Promise<DecisionResult> => {
    let finalDecision: Decision = Decision.NotSampled;

    const samplingDecision: Record<Decision, boolean> = {
        [Decision.Error]: false,
        [Decision.Sampled]: false,
        [Decision.NotSampled]: false,
        [Decision.InvertSampled]: false,
        [Decision.InvertNotSampled]: false,
        [Decision.Dropped]: false
    };
    const policyDecisions: Record<string, Decision> = {}

    for (const policy of policies) {
        try {
            const decision = await evaluatePolicy(policy, trace);
            samplingDecision[decision] = true;
            policyDecisions[policy.policyName] = decision;

            // Break early if dropped. This can drastically reduce tick/decision latency.
            // Dropped decisions take precedence over all others and can't be overridden.
            if (decision === Decision.Dropped) {
                break;
            }

        } catch (error) {
            samplingDecision[Decision.Error] = true;
            console.error('Sampling policy error', error);
        }
    }

    if (samplingDecision[Decision.Dropped]) {
        finalDecision = Decision.Dropped;
    } else if (samplingDecision[Decision.InvertNotSampled]) {
        finalDecision = Decision.NotSampled;
    } else if (samplingDecision[Decision.Sampled]) {
        finalDecision = Decision.Sampled;
    } else if (samplingDecision[Decision.InvertSampled] && !samplingDecision[Decision.NotSampled]) {
        finalDecision = Decision.Sampled;
    }
    return {
        finalDecision,
        policyDecisions
    };
}