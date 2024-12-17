import { Trace, Resource, Span } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { hasResourceOrSpanWithCondition, invertHasResourceOrSpanWithCondition } from "./util";

export class NumericAttributeFilterEvaluator extends BasePolicyEvaluator {
    constructor(name: string, private key: string, private minValue: number, private maxValue: number, private invertMatch?: boolean) {
        super(name);
    }
    evaluate(trace: Trace) {
        if (this.invertMatch) {
            return invertHasResourceOrSpanWithCondition(
                trace,
                (resource: Resource) => {
                    const value = resource.attributes[this.key];
                    if (value !== undefined && typeof value === 'number') {
                        return !(value >= this.minValue && value <= this.maxValue);
                    }
                    return true;
                },
                (span: Span) => {
                    const value = span.attributes[this.key];
                    if (value !== undefined && typeof value === 'number') {
                        return !(value >= this.minValue && value <= this.maxValue);
                    }
                    return true;
                }
            );
        }

        return hasResourceOrSpanWithCondition(
            trace,
            (resource: Resource) => {
                const value = resource.attributes[this.key];
                if (value !== undefined && typeof value === 'number') {
                    return value >= this.minValue && value <= this.maxValue;
                }
                return false;
            },
            (span: Span) => {
                const value = span.attributes[this.key];
                if (value !== undefined && typeof value === 'number') {
                    return value >= this.minValue && value <= this.maxValue;
                }
                return false;
            }
        );
    }
}