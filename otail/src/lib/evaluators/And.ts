import { Trace, Decision } from "@/types/trace";
import { BasePolicyEvaluator, PolicyEvaluator } from "./BaseEvaluator";

export class AndEvaluator extends BasePolicyEvaluator {
    private subPolicies: PolicyEvaluator[];

    constructor(name: string, subPolicies: PolicyEvaluator[]) {
        super(name);
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