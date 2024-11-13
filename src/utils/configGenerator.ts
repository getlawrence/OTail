import { dump } from 'js-yaml';
import { TailSamplingConfig } from '../types/ConfigTypes';
import { Policy } from '../types/PolicyTypes';

const generatePolicyConfig = (policy: Policy): Record<string, any> => {
  const basePolicy = {
    name: policy.name,
    type: policy.type
  };

  switch (policy.type) {
    case 'numeric_attribute':
      return {
        ...basePolicy,
        numeric_attribute: {
          key: policy.key,
          min_value: policy.minValue,
          max_value: policy.maxValue,
        },
      };
    case 'probabilistic':
      return {
        ...basePolicy,
        probabilistic: {
          sampling_percentage: policy.samplingPercentage,
        },
      };
    case 'rate_limiting':
      return {
        ...basePolicy,
        rate_limiting: {
          spans_per_second: policy.spansPerSecond,
        },
      };
    case 'status_code':
      return {
        ...basePolicy,
        status_code: {
          status_codes: policy.statusCodes,
        },
      };
    case 'string_attribute':
      return {
        ...basePolicy,
        string_attribute: {
          key: policy.key,
          values: policy.values,
        },
      };
    case 'latency':
      return {
        ...basePolicy,
        latency: {
          threshold_ms: policy.thresholdMs,
        },
      };
    case 'always_sample':
      return basePolicy;
    case 'boolean_attribute':
      return {
        ...basePolicy,
        boolean_attribute: {
          key: policy.key,
          value: policy.value,
        },
      };
    case 'composite':
      return {
        ...basePolicy,
        composite: {
          operator: policy.operator,
          sub_policies: policy.subPolicies.map(subPolicy =>
            generatePolicyConfig(subPolicy)
          ),
        },
      };
    case 'and':
      return {
        ...basePolicy,
        and: {
          sub_policies: policy.subPolicies.map(subPolicy =>
            generatePolicyConfig(subPolicy)
          ),
        },
      };
    case 'ottl_condition':
      return {
        ...basePolicy,
        ottl_condition: {
          expression: policy.expression,
        },
      };
    case 'span_count':
      return {
        ...basePolicy,
        span_count: {
          min_spans: policy.minSpans,
          max_spans: policy.maxSpans,
        },
      };
    case 'trace_state':
      return {
        ...basePolicy,
        trace_state: {
          key: policy.key,
          values: policy.values,
        },
      };
    default:
      return basePolicy;
  }
};

export const generateYamlConfig = (config: TailSamplingConfig): string => {
  const processorConfig = {
    processors: {
      tail_sampling: {
        decision_wait: config.decisionWait || 10,
        num_traces: config.numTraces || 100,
        policies: config.policies.map(generatePolicyConfig).filter(Boolean),
      },
    },
  };

  return dump(processorConfig);
}; 