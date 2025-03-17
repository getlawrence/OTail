import { Trace, Decision, StatusCode, Span } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { hasSpanWithCondition } from "./util";

export class StatusCodeFilterEvaluator extends BasePolicyEvaluator {
    constructor(name: string, private statusCodeString: StatusCode[]) {
        super(name)
    }
    evaluate(trace: Trace): Decision {
        return hasSpanWithCondition(trace, (span: Span) => {
            for (const statusCode of this.statusCodeString) {
                if (span.status?.code === statusCode) {
                    return true
                }
            }
            return false
        })
    }
}