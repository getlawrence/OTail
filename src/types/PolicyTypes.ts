export type PolicyType = 
  | 'numeric_tag'
  | 'probabilistic'
  | 'rate_limiting'
  | 'status_code'
  | 'string_attribute'
  | 'latency'
  | 'always_sample'
  | 'boolean_tag'
  | 'composite'
  | 'numeric_tag'
  | 'ottl'
  | 'span_count'
  | 'string_tag'
  | 'trace_state'
  | 'and';

export interface BasePolicy {
  name: string;
  type: PolicyType;
  enabled: boolean;
}

export interface NumericTagPolicy extends BasePolicy {
  type: 'numeric_tag';
  key: string;
  minValue: number;
  maxValue: number;
}

export interface ProbabilisticPolicy extends BasePolicy {
  type: 'probabilistic';
  samplingPercentage: number;
}

export interface RateLimitingPolicy extends BasePolicy {
  type: 'rate_limiting';
  spansPerSecond: number;
}

export interface StatusCodePolicy extends BasePolicy {
  type: 'status_code';
  statusCodes: string[];
}

export interface StringAttributePolicy extends BasePolicy {
  type: 'string_attribute';
  key: string;
  values: string[];
}

export interface LatencyPolicy extends BasePolicy {
  type: 'latency';
  thresholdMs: number;
}

export interface AlwaysSamplePolicy extends BasePolicy {
  type: 'always_sample';
}

export interface BooleanTagPolicy extends BasePolicy {
  type: 'boolean_tag';
  key: string;
  value: boolean;
}

export interface CompositePolicy extends BasePolicy {
  type: 'composite';
  subPolicies: Policy[];
  operator: 'and' | 'or';
}

export interface NumericTagPolicy extends BasePolicy {
  type: 'numeric_tag';
  key: string;
  minValue: number;
  maxValue: number;
}

export interface OttlPolicy extends BasePolicy {
  type: 'ottl';
  expression: string;
}

export interface SpanCountPolicy extends BasePolicy {
  type: 'span_count';
  minSpans: number;
  maxSpans: number;
}

export interface StringTagPolicy extends BasePolicy {
  type: 'string_tag';
  key: string;
  values: string[];
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
  | StringTagPolicy
  | TraceStatePolicy
  | AndPolicy;