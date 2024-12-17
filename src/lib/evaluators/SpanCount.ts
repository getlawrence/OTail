import { Trace, Decision } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { getSpanCount } from "./util";

export class SpanCountEvaluator extends BasePolicyEvaluator {
    constructor(name: string, private minSpans: number, private maxSpans: number) {
        super(name)
    }
    evaluate(trace: Trace): Decision {
        const spanCount = getSpanCount(trace);
        if (this.maxSpans === 0 && spanCount >= this.minSpans) {
            return Decision.Sampled;
        }
        if (spanCount >= this.minSpans && spanCount <= this.maxSpans) {
            return Decision.Sampled;
        }
        return Decision.NotSampled;
    }
}