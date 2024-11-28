import { Trace, Decision } from "../types/TraceTypes";
import { PolicyEvaluator } from "./BaseEvaluator";

export class AlwaysSampleEvaluator implements PolicyEvaluator {
    evaluate(trace: Trace): Decision {
        return Decision.Sampled;
    }
}
