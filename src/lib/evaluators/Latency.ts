import { Trace, Decision, Span } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { hasSpanWithCondition } from "./util";

export class LatencyEvaluator extends BasePolicyEvaluator {
    constructor(name: string, private thresholdMs: number, private upperThresholdMs: number) {
        super(name);
    }
    evaluate(trace: Trace): Decision {
        let minTime: number = Infinity;
        let maxTime: number = -Infinity;

        return hasSpanWithCondition(trace, (span: Span) => {
            if (span.startTime < minTime) {
                minTime = span.startTime;
            }
            if (span.endTime > maxTime) {
                maxTime = span.endTime;
            }
            const duration = maxTime - minTime;

            if (this.upperThresholdMs === 0) {
                return duration >= this.thresholdMs;
            }
            return duration >= this.thresholdMs && duration <= this.upperThresholdMs;
        })
    }
}