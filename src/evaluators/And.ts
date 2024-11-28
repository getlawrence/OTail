import { AndPolicy, Policy } from "../types/PolicyTypes";
import { Trace, Decision } from "../types/TraceTypes";
import { PolicyEvaluator } from "./BaseEvaluator";

export class AndEvaluator implements PolicyEvaluator {
    private subPolicies: PolicyEvaluator[];

    constructor(subPolicies: PolicyEvaluator[]) {
        this.subPolicies = subPolicies;
    }

    evaluate(trace: Trace): Decision {
        for (const subPolicy of this.subPolicies) {
            if (!subPolicy.evaluate(trace)) {
                return Decision.NotSampled;
            }
        }
        return Decision.Sampled;
    }
}