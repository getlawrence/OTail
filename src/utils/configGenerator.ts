import { dump } from 'js-yaml';
import { TailSamplingConfig } from '../types/ConfigTypes';
import { CompositePolicy, Policy, StringAttributePolicy } from '../types/PolicyTypes';

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
      return generateStringAttributePolicyConfig(policy);
    case 'latency':
      return {
        ...basePolicy,
        latency: {
          threshold_ms: policy.thresholdMs,
          upper_threshold_ms: policy.upperThresholdMs,
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
      return generateCompositeConfig(policy);
    case 'and':
      return {
        ...basePolicy,
        and: {
          and_sub_policy: policy.subPolicies.map((subPolicy: Policy) =>
            generatePolicyConfig(subPolicy)
          ),
        },
      };
    case 'ottl_condition':
      return {
        ...basePolicy,
        ottl_condition: {
          span_conditions: policy.spanConditions,
          span_event_conditions: policy.spanEventConditions,
          error_mode: policy.errorMode,
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

const generateStringAttributePolicyConfig = (policy: StringAttributePolicy) => {
  const config: any = {
    name: policy.name,
    type: policy.type,
    string_attribute: {
      key: policy.key,
      values: policy.values,
    }
  };

  if (policy.enabledRegexMatching) {
    config.string_attribute.enabled_regex_matching = true;
    if (policy.cacheMaxSize !== undefined) {
      config.string_attribute.cache_max_size = policy.cacheMaxSize;
    }
  }

  if (policy.invertMatch) {
    config.string_attribute.invert_match = true;
  }

  return config;
};

const generateCompositeConfig = (policy: CompositePolicy): any => {
  const config: any = {
    name: policy.name,
    type: policy.type,
    composite: {
      ...(policy.maxTotalSpansPerSecond && {
        max_total_spans_per_second: policy.maxTotalSpansPerSecond,
      }),
      composite_sub_policy: policy.subPolicies.map(generatePolicyConfig),
    },
  };

  // Add policy order if defined
  if (policy.policyOrder?.length) {
    config.composite.policy_order = policy.policyOrder;
  }

  // Add rate allocation if defined
  if (policy.rateAllocation?.length) {
    config.composite.rate_allocation = policy.rateAllocation.map(allocation => ({
      policy: allocation.policy,
      percent: allocation.percent,
    }));
  }

  return config;
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