import { Trace, Decision } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";

export class AlwaysSampleEvaluator extends BasePolicyEvaluator {
    evaluate(trace: Trace): Decision {
        return Decision.Sampled;
    }
}
