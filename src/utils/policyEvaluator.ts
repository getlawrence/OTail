import { AlwaysSampleEvaluator } from '../evaluators/AlwaysSample';
import { BooleanAttributeFilterEvaluator } from '../evaluators/BooleanAttributeFilter';
import { LatemcyEvaluator } from '../evaluators/Latency';
import { StringAttributeEvaluator } from '../evaluators/StringAttribute';
import { Policy } from '../types/PolicyTypes';
import { Trace, Decision } from '../types/TraceTypes';

export const evaluatePolicy = (policy: Policy, traceData: Trace): Decision => {
    switch (policy.type) {
        case 'always_sample':
            return new AlwaysSampleEvaluator().evaluate(traceData);
        case 'string_attribute':
            return new StringAttributeEvaluator(policy).evaluate(traceData);
        case 'boolean_attribute':
            return new BooleanAttributeFilterEvaluator(policy.key, policy.value, policy.invertMatch).evaluate(traceData)
        case 'latency':
            return new LatemcyEvaluator(policy.thresholdMs, policy.upperThresholdMs ?? 0).evaluate(traceData);
        default:
            throw new Error(`Unsupported policy type: ${policy.type}`);
    }
};