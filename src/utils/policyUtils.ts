import { Policy, PolicyType } from '../types/PolicyTypes';

export const createNewPolicy = (type: PolicyType): Policy => {
  const basePolicy = {
    name: `New ${type} Policy`,
    type,
  };

  switch (type) {
    case 'numeric_attribute':
      return {
        ...basePolicy,
        type: 'numeric_attribute',
        key: '',
        minValue: 0,
        maxValue: 100,
      };
    case 'probabilistic':
      return {
        ...basePolicy,
        type: 'probabilistic',
        samplingPercentage: 10,
      };
    case 'rate_limiting':
      return {
        ...basePolicy,
        type: 'rate_limiting',
        spansPerSecond: 100,
      };
    case 'status_code':
      return {
        ...basePolicy,
        type: 'status_code',
        statusCodes: [],
      };
    case 'string_attribute':
      return {
        ...basePolicy,
        type: 'string_attribute',
        key: '',
        values: [],
        enabledRegexMatching: false,
        cacheMaxSize: undefined,
        invertMatch: false,
      };
    case 'latency':
      return {
        ...basePolicy,
        type: 'latency',
        thresholdMs: 1000
      };
    case 'always_sample':
      return {
        ...basePolicy,
        type: 'always_sample',
      };
    case 'boolean_attribute':
      return {
        ...basePolicy,
        type: 'boolean_attribute',
        key: '',
        value: false,
      };
    case 'composite':
      return {
        ...basePolicy,
        type: 'composite',
        subPolicies: [],
        operator: 'and',
      };
    case 'ottl_condition':
      return {
        ...basePolicy,
        type: 'ottl_condition',
        spanConditions: [],
        spanEventConditions: [],
        errorMode: 'ignore',
      };
    case 'span_count':
      return {
        ...basePolicy,
        type: 'span_count',
        minSpans: 0,
        maxSpans: 100,
      };
    case 'trace_state':
      return {
        ...basePolicy,
        type: 'trace_state',
        key: '',
        values: [],
      };
    case 'and':
      return {
        ...basePolicy,
        type: 'and',
        subPolicies: [],
      };
    default:
      throw new Error(`Unknown policy type: ${type}`);
  }
}; 