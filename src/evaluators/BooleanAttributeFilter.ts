import { Trace, Decision, Resource, Span } from "../types/TraceTypes";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { hasResourceOrSpanWithCondition, invertHasResourceOrSpanWithCondition } from "./util";

export class BooleanAttributeFilterEvaluator extends BasePolicyEvaluator {
    constructor(name: string, private key: string, private value: boolean, private invertMatch?: boolean) {
        super(name);
    }
    evaluate(trace: Trace): Decision {
        if (this.invertMatch) {
            return invertHasResourceOrSpanWithCondition(
                trace,
                (resource: Resource): boolean => {
                    const value = resource.attributes[this.key];
                    return !value || value !== this.value;
                },
                (span: Span): boolean => {
                    const value = span.attributes[this.key]
                    return !value || value !== this.value;
                },
            )
        }
        return hasResourceOrSpanWithCondition(
            trace,
            (resource: Resource): boolean => {
                const value = resource.attributes[this.key]
                return !!value || value === this.value
            },
            (span: Span): boolean => {
                const value = span.attributes[this.key]
                return !!value || value === this.value
            })
    }
}