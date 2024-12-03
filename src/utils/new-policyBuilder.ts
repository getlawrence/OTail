import { AlwaysSampleEvaluator } from "../evaluators/AlwaysSample";
import { AndEvaluator } from "../evaluators/And";
import { PolicyEvaluator } from "../evaluators/BaseEvaluator";
import { BooleanAttributeFilterEvaluator } from "../evaluators/BooleanAttributeFilter";
import { LatencyEvaluator } from "../evaluators/Latency";
import { StringAttributeEvaluator } from "../evaluators/StringAttribute";
import { AndPolicy, CompositePolicy, Policy } from "../types/PolicyTypes";

const getSharedPolicyEvaluator = (policy: Policy): PolicyEvaluator => {
    switch (policy.type) {
        case 'always_sample':
            return new AlwaysSampleEvaluator(policy.name);
        case 'string_attribute':
            return new StringAttributeEvaluator(policy.name, policy.key, policy.values, policy.enabledRegexMatching, policy.cacheMaxSize, policy.invertMatch);
        case 'boolean_attribute':
            return new BooleanAttributeFilterEvaluator(policy.name, policy.key, policy.value, policy.invertMatch)
        case 'latency':
            return new LatencyEvaluator(policy.name, policy.thresholdMs, policy.upperThresholdMs ?? 0);
        case 'and':
            return getNewAndPolicy(policy);
        default:
            console.error(`Unsupported policy type: ${policy.type}`);
            return new AlwaysSampleEvaluator(policy.name);
    }
};

export const getNewAndPolicy = (policy: AndPolicy) => {
    const subPolicies = policy.subPolicies.map(getSharedPolicyEvaluator);
    return new AndEvaluator(policy.name, subPolicies);
}

const getNewCompositePolicy = (policy: CompositePolicy) => {
    const rateAllocationsMap = getRateAllocationMap(policy)
    const subPolicyEvalParams: Record<string, { evaluator: PolicyEvaluator, maxSpansPerSecond: number }> = {}
    for (const subPolicy of policy.subPolicies) {
        const policyEval = getCompositeSubPolicyEvaluator(subPolicy)
        const evalParams = {
            evaluator: policyEval,
            maxSpansPerSecond: rateAllocationsMap[policy.name],
        }
        subPolicyEvalParams[policy.name] = evalParams

    }
}

const getRateAllocationMap = (policy: CompositePolicy) => {
    const rateAllocationsMap: Record<string, number> = {}
    const maxTotalSPS = policy.maxTotalSpansPerSecond ?? 0;

    const defaultSPS = maxTotalSPS / policy.subPolicies.length;
    for (const rAlloc of policy.rateAllocation ?? []) {
        if (rAlloc.percent > 0) {
            rateAllocationsMap[rAlloc.policy] = ((rAlloc.percent) / 100) * maxTotalSPS
        } else {
            rateAllocationsMap[rAlloc.policy] = defaultSPS
        }
    }
    return rateAllocationsMap
}

const getCompositeSubPolicyEvaluator = (policy: Policy) => {
    switch (policy.type) {
        case 'and':
            return getNewAndPolicy(policy)
        default:
            return getSharedPolicyEvaluator(policy)
    }
}

export const buildPolicy = getSharedPolicyEvaluator;