import { StringAttributeEvaluator } from '../evaluators/StringAttributeEvaluator';
import { Policy } from '../types/PolicyTypes';
import { Trace, EvaluationResult } from '../types/TraceTypes';

export const evaluatePolicy = (policy: Policy, traceData: Trace): EvaluationResult => {
    switch (policy.type) {
        case 'string_attribute':
            return new StringAttributeEvaluator(policy).evaluate(traceData);
        default:
            throw new Error(`Unsupported policy type: ${policy.type}`);
    }
};