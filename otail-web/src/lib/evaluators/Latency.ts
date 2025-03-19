import { Trace, Decision, Span } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { hasSpanWithCondition } from "./util";

export class LatencyEvaluator extends BasePolicyEvaluator {
    constructor(name: string, private thresholdMs: number, private upperThresholdMs: number) {
        super(name);
    }
    evaluate(trace: Trace): Decision {
        let minTime: bigint = BigInt(Number.MAX_SAFE_INTEGER);
        let maxTime: bigint = BigInt(Number.MIN_SAFE_INTEGER);

        return hasSpanWithCondition(trace, (span: Span) => {
            if (BigInt(span.startTimeUnixNano) < minTime) {
                minTime = BigInt(span.startTimeUnixNano);
            }
            if (BigInt(span.endTimeUnixNano) > maxTime) {
                maxTime = BigInt(span.endTimeUnixNano);
            }
            const duration = maxTime - minTime;

            if (this.upperThresholdMs === 0) {
                return duration >= BigInt(this.thresholdMs * 1e6);
            }
            return duration >= BigInt(this.thresholdMs * 1e6) && duration <= BigInt(this.upperThresholdMs * 1e6);
        })
    }
}