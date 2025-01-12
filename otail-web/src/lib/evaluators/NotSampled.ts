import { Trace, Decision } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";

export class NotSampledEvaluator extends BasePolicyEvaluator {
    evaluate(_trace: Trace): Decision {
        return Decision.NotSampled;
    }
}
