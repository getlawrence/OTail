import { BasePolicyEvaluator } from './BaseEvaluator';
import { Trace } from '../types/TraceTypes';
import { hasResourceOrSpanWithCondition, invertHasResourceOrSpanWithCondition } from './util';

const DEFAULT_CACHE_SIZE = 128;


export class StringAttributeEvaluator extends BasePolicyEvaluator {
    private key: string;
    private matcher: (value: string) => boolean;
    private invertMatch: boolean;
    private regexStrSetting?: {
        matchedAttrs: Map<string, boolean>;
        filterList: RegExp[];
    };

    constructor(
        name: string,
        key: string,
        values: string[],
        regexMatchEnabled: boolean,
        evictSize: number = DEFAULT_CACHE_SIZE,
        invertMatch: boolean = false
    ) {
        super(name)
        this.key = key
        this.invertMatch = invertMatch;

        if (regexMatchEnabled) {
            const filterList = this.addFilters(values);
            this.regexStrSetting = {
                matchedAttrs: new Map<string, boolean>(),
                filterList: filterList
            };

            this.matcher = (toMatch: string) => {
                if (!this.regexStrSetting) return false;

                const cached = this.regexStrSetting.matchedAttrs.get(toMatch);
                if (cached !== undefined) {
                    return cached;
                }

                const result = this.regexStrSetting.filterList.some(r => r.test(toMatch));
                this.regexStrSetting.matchedAttrs.set(toMatch, result);
                return result;
            };
        } else {
            const valuesMap = new Set(values.filter(v => v !== ''));
            this.matcher = (toMatch: string) => valuesMap.has(toMatch);
        }
    }

    private addFilters(exprs: string[]): RegExp[] {
        return exprs.map(expr => new RegExp(`^${expr}$`));
    }

    evaluate(trace: Trace) {
        if (this.invertMatch) {
            return invertHasResourceOrSpanWithCondition(
                trace,
                (resource) => {
                    const value = resource.attributes[this.key];
                    return !value || !this.matcher(value.toString());
                },
                (span) => {
                    const value = span.attributes[this.key];
                    return !value || !this.matcher(value.toString());
                }
            );
        }

        return hasResourceOrSpanWithCondition(
            trace,
            (resource) => {
                const value = resource.attributes[this.key];
                return !!value && this.matcher(value.toString());
            },
            (span) => {
                const value = span.attributes[this.key];
                return !!value && this.matcher(value.toString());
            }
        );
    }
}