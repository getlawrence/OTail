import { Trace, Decision, Span } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";
import { hasSpanWithCondition } from "./util";

export class TraceStateEvaluator extends BasePolicyEvaluator {
    private key: string;
    private valuesMap: Set<string>;

    constructor(name: string, key: string, values: string[]) {
        super(name);
        this.key = key;
        // Initialize values map, filtering out invalid values
        this.valuesMap = new Set(
            values.filter(value => value && (key.length + value.length) < 256)
        );
    }

    evaluate(trace: Trace): Decision {
        return hasSpanWithCondition(trace, (span: Span) => {
            if (!span.traceState) {
                return false;
            }

            try {
                const pairs = span.traceState.split(',').map(pair => {
                    const [key, value] = pair.trim().split('=');
                    return { key: key.trim(), value: value.trim() };
                });

                const matchingPair = pairs.find(pair => pair.key === this.key);
                if (!matchingPair) {
                    return false;
                }

                return this.valuesMap.has(matchingPair.value);
            } catch (err) {
                return false;
            }
        });
    }
}