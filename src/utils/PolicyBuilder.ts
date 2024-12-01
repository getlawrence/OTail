import { AlwaysSampleEvaluator } from "../evaluators/AlwaysSample";
import { AndEvaluator } from "../evaluators/And";
import { PolicyEvaluator } from "../evaluators/BaseEvaluator";
import { BooleanAttributeFilterEvaluator } from "../evaluators/BooleanAttributeFilter";
import { LatencyEvaluator } from "../evaluators/Latency";
import { StringAttributeEvaluator } from "../evaluators/StringAttribute";
import { AndPolicy, Policy } from "../types/PolicyTypes";

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

export const getNewAndPolicy  = (policy: AndPolicy) => {
    const subPolicies =  policy.subPolicies.map(getSharedPolicyEvaluator);
    return new AndEvaluator(policy.name, subPolicies);
}
export const buildPolicy = getSharedPolicyEvaluator;