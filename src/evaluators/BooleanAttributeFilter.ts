import { Trace, Decision, Resource, Span } from "../types/TraceTypes";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { hasResourceOrSpanWithCondition, invertHasResourceOrSpanWithCondition } from "./util";

export class BooleanAttributeFilterEvaluator extends BasePolicyEvaluator {
    constructor(name: string, private key: string, private value: boolean, private invertMatch?: boolean) {
        super(name);
    }
    evaluate(trace: Trace): Decision {
        const that = this;
        if (this.invertMatch) {
            return invertHasResourceOrSpanWithCondition(
                trace,
                (resource: Resource): boolean => {
                    const v = resource.attributes[that.key];
                    return v !== that.value;
                },
                (span: Span): boolean => {
                    const v = span.attributes[that.key]
                    return v !== that.value;
                },
            )
        }
        return hasResourceOrSpanWithCondition(
            trace,
            (resource: Resource): boolean => {
                const v = resource.attributes[that.key]
                return v === that.value
            },
            (span: Span): boolean => {
                const v = span.attributes[that.key]
                return v === this.value
            })
    }
}