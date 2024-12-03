import { Trace, Decision } from "../types/TraceTypes";
import { BasePolicyEvaluator, PolicyEvaluator } from "./BaseEvaluator";

interface SubPolicy {
    evaluator: PolicyEvaluator;
    allocatedSPS: number;
    sampledSPS: number;
}

export class CompositeEvaluator extends BasePolicyEvaluator {
    private subPolicies: SubPolicy[];

    constructor(name: string, subPolicyEvalParams: any[]) {
        super(name);
        this.subPolicies = subPolicyEvalParams.map(param => {
            return {
                evaluator: param.evaluator,
                allocatedSPS: param.maxSpansPerSecond,
                sampledSPS: 0
            }
        })
    }

    evaluate(trace: Trace): Decision {
        for (const subPolicy of this.subPolicies) {
            if (!subPolicy.evaluator.evaluate(trace)) {
                return Decision.NotSampled;
            }
        }
        return Decision.Sampled;
    }
}