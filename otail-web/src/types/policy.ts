import { StatusCode } from "./trace";

export const POLICY_TYPES = [
  'always_sample',
  'and',
  'boolean_attribute',
  'composite',
  'latency',
  'numeric_attribute',
  'ottl_condition',
  'probabilistic',
  'rate_limiting',
  'span_count',
  'status_code',
  'string_attribute',
  'trace_state',
] as const;

export type PolicyType = typeof POLICY_TYPES[number];

export interface BasePolicy {
    name: string;
    type: PolicyType;
  }
  
  export interface NumericTagPolicy extends BasePolicy {
    type: 'numeric_attribute';
    key: string;
    minValue: number;
    maxValue: number;
    invertMatch?: boolean;
  }
  
  export interface ProbabilisticPolicy extends BasePolicy {
    type: 'probabilistic';
    samplingPercentage: number;
    hashSalt?: string;
  }
  
  export interface RateLimitingPolicy extends BasePolicy {
    type: 'rate_limiting';
    spansPerSecond: number;
  }
  
  export interface StatusCodePolicy extends BasePolicy {
    type: 'status_code';
    statusCodes: StatusCode[];
  }
  
  export interface StringAttributePolicy extends BasePolicy {
    type: 'string_attribute';
    key: string;
    values: string[];
    enabledRegexMatching: boolean;
    cacheMaxSize?: number;
    invertMatch?: boolean;
  }
  
  export interface LatencyPolicy extends BasePolicy {
    type: 'latency';
    thresholdMs: number;
    upperThresholdMs?: number;
  }
  
  export interface AlwaysSamplePolicy extends BasePolicy {
    type: 'always_sample';
  }
  
  export interface BooleanTagPolicy extends BasePolicy {
    type: 'boolean_attribute';
    key: string;
    value: boolean;
    invertMatch?: boolean;
  }
  
  export interface CompositePolicy extends BasePolicy {
    type: 'composite';
    maxTotalSpansPerSecond?: number;
    policyOrder?: string[];
    rateAllocation?: Array<{
      policy: string;
      percent: number;
    }>;
    subPolicies: Policy[];
    operator: 'and' | 'or';
  }
  
  export interface OttlPolicy extends BasePolicy {
    type: 'ottl_condition';
    errorMode?: string;
    spanConditions?: string[];
    spanEventConditions?: string[];
  }
  
  export interface SpanCountPolicy extends BasePolicy {
    type: 'span_count';
    minSpans: number;
    maxSpans: number;
  }
  
  export interface TraceStatePolicy extends BasePolicy {
    type: 'trace_state';
    key: string;
    values: string[];
  }
  
  export interface AndPolicy extends BasePolicy {
    type: 'and';
    subPolicies: Policy[];
  }
  
  export type Policy = 
    | NumericTagPolicy 
    | ProbabilisticPolicy 
    | RateLimitingPolicy 
    | StatusCodePolicy 
    | StringAttributePolicy 
    | LatencyPolicy 
    | AlwaysSamplePolicy
    | BooleanTagPolicy
    | CompositePolicy
    | NumericTagPolicy
    | OttlPolicy
    | SpanCountPolicy
    | TraceStatePolicy
    | AndPolicy;