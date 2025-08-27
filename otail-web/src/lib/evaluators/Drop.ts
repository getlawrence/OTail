import { Trace, Decision } from "@/types/trace";
import { BasePolicyEvaluator, PolicyEvaluator } from "./BaseEvaluator";

export class DropEvaluator extends BasePolicyEvaluator {
    private subPolicies: PolicyEvaluator[];

    constructor(name: string, subPolicies: PolicyEvaluator[]) {
        super(name);
        this.subPolicies = subPolicies;
    }

    evaluate(trace: Trace): Decision {
        // If all sub-policies return Sampled, return Dropped
        // Otherwise, return NotSampled
        for (const subPolicy of this.subPolicies) {
            const decision = subPolicy.evaluate(trace);
            if (decision !== Decision.Sampled) {
                return Decision.NotSampled;
            }
        }
        return Decision.Dropped;
    }
}
