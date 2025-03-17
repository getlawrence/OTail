import { load } from 'js-yaml';
import { TailSamplingConfig } from '@/types/tailsampling';
import { Policy, PolicyType, StringAttributePolicy, CompositePolicy } from '@/types/policy';

export const parseYamlConfig = (yaml: string): TailSamplingConfig => {
  try {
    const parsed = load(yaml) as any;

    if (!parsed?.tail_sampling) {
      throw new Error('Invalid configuration: Missing tail_sampling processor');
    }

    const tailSampling = parsed.tail_sampling;

    return {
      policies: tailSampling.policies?.map(parsePolicyConfig) || [],
    };
  } catch (error) {
    console.error('Error parsing YAML:', error);
    throw error;
  }
};

const parsePolicyConfig = (config: any): Policy => {
  const type = getPolicyType(config);
  const basePolicy = {
    name: config.name || 'Unnamed Policy',
    type,
  };

  const policyConfig = config[type];

  switch (type) {
    case 'numeric_attribute':
      return {
        ...basePolicy,
        type: 'numeric_attribute' as const,
        key: policyConfig.key || '',
        minValue: policyConfig.min_value || 0,
        maxValue: policyConfig.max_value || 100,
      };
    case 'probabilistic':
      return {
        ...basePolicy,
        type: 'probabilistic' as const,
        samplingPercentage: policyConfig.sampling_percentage || 10,
      };
    case 'rate_limiting':
      return {
        ...basePolicy,
        type: 'rate_limiting' as const,
        spansPerSecond: policyConfig.spans_per_second || 100,
      };
    case 'status_code':
      return {
        ...basePolicy,
        type: 'status_code' as const,
        statusCodes: policyConfig.status_codes || [],
      };
    case 'string_attribute':
      return parseStringAttributeConfig(policyConfig);
    case 'composite':
      return parseCompositeConfig(policyConfig, basePolicy);
    case 'ottl_condition':
      return {
        ...basePolicy,
        type: 'ottl_condition' as const,
        spanConditions: policyConfig.span_conditions || [],
        spanEventConditions: policyConfig.span_event_conditions || [],
        errorMode: policyConfig.error_mode || 'ignore',
      };
    case 'latency':
      return {
        ...basePolicy,
        type: 'latency' as const,
        thresholdMs: policyConfig.threshold_ms || 100,
        upperThresholdMs: policyConfig.upper_threshold_ms,
      };
    case 'always_sample':
      return {
        ...basePolicy,
        type: 'always_sample' as const,
      };
    case 'boolean_attribute':
      return {
        ...basePolicy,
        type: 'boolean_attribute' as const,
        key: policyConfig.key || '',
        value: policyConfig.value ?? true,
      };
    case 'span_count':
      return {
        ...basePolicy,
        type: 'span_count' as const,
        minSpans: policyConfig.min_spans || 0,
        maxSpans: policyConfig.max_spans || 1000,
      };
    case 'trace_state':
      return {
        ...basePolicy,
        type: 'trace_state' as const,
        key: policyConfig.key || '',
        values: policyConfig.values || [],
      };
    case 'and':
      return {
        ...basePolicy,
        type: 'and' as const,
        subPolicies: policyConfig.and_sub_policy?.map(parsePolicyConfig) || [],
      };
    case 'ottl_condition':
      return {
        ...basePolicy,
        type: 'ottl_condition' as const,
        errorMode: policyConfig.error_mode || 'ignore',
        spanConditions: policyConfig.span_conditions || [],
        spanEventConditions: policyConfig.span_event_conditions || [],
      };
    default:
      throw new Error(`Unsupported policy type: ${type}`);
  }
};

const parseStringAttributeConfig = (config: any): StringAttributePolicy => {
  return {
    type: 'string_attribute',
    name: config.name || 'String Attribute Policy',
    key: config.key || '',
    values: config.values || [],
    enabledRegexMatching: config.enabled_regex_matching || false,
    cacheMaxSize: config.cache_max_size,
    invertMatch: config.invert_match || false,
  };
};

const getPolicyType = (config: any): PolicyType => {
  const types: PolicyType[] = [
    'numeric_attribute', 'probabilistic', 'rate_limiting', 'status_code',
    'string_attribute', 'latency', 'always_sample', 'boolean_attribute',
  'composite', 'ottl_condition', 'span_count', 'string_attribute', 'trace_state', 'and'
  ];
  const foundType = types.find(type => config.type === type);
  if (!foundType) {
    throw new Error('Invalid policy configuration: Missing policy type');
  }

  return foundType;
};

const parseCompositeConfig = (
  config: any, 
  basePolicy: Pick<Policy, 'name' | 'type'>
): CompositePolicy => {
  const composite = config.composite;
  
  const policy: CompositePolicy = {
    ...basePolicy,
    type: 'composite',
    operator: composite.operator || 'and',
    subPolicies: composite.composite_sub_policy.map(parsePolicyConfig),
    maxTotalSpansPerSecond: composite.max_total_spans_per_second,
    policyOrder: composite.policy_order,
  };

  if (composite.rate_allocation) {
    policy.rateAllocation = composite.rate_allocation.map((allocation: { policy: any; percent: any; }) => ({
      policy: allocation.policy,
      percent: allocation.percent,
    }));
  }

  return policy;
};