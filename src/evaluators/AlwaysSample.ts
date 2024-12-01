import { Trace, Decision } from "../types/TraceTypes";
import { BasePolicyEvaluator } from "./BaseEvaluator";

export class AlwaysSampleEvaluator extends BasePolicyEvaluator {
    evaluate(trace: Trace): Decision {
        return Decision.Sampled;
    }
}
