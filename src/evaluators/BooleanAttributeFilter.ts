import { Trace, Decision, Resource, Span } from "../types/TraceTypes";
import { PolicyEvaluator } from "./BaseEvaluator";
import { hasResourceOrSpanWithCondition, invertHasResourceOrSpanWithCondition } from "./util";

export class BooleanAttributeFilterEvaluator implements PolicyEvaluator {
    constructor(private key: string, private value: boolean, private invertMatch?: boolean) {
    }
    evaluate(trace: Trace): Decision {
        const that = this;
        if (this.invertMatch) {
            return invertHasResourceOrSpanWithCondition(
                trace,
                (resource: Resource): boolean => {
                    const v = resource.attributes[that.key];
                    return v != that.value;
                },
                (span: Span): boolean => {
                    const v = span.attributes[that.key]
                    return v != that.value;
                },
            )
        }
        return hasResourceOrSpanWithCondition(
            trace,
            (resource: Resource): boolean => {
                const v = resource.attributes[that.key]
                return v == that.value
            },
            (span: Span): boolean => {
                const v = span.attributes[that.key]
                return v == this.value
            })
    }
}