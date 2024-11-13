import { load } from 'js-yaml';
import { TailSamplingConfig } from '../types/ConfigTypes';
import { Policy, PolicyType } from '../types/PolicyTypes';

export const parseYamlConfig = (yaml: string): TailSamplingConfig => {
  try {
    const parsed = load(yaml) as any;
    
    if (!parsed?.processors?.tail_sampling) {
      throw new Error('Invalid configuration: Missing tail_sampling processor');
    }

    const tailSampling = parsed.processors.tail_sampling;

    return {
      decisionWait: tailSampling.decision_wait || 10,
      numTraces: tailSampling.num_traces || 100,
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
    enabled: config.enabled ?? true,
  };

  const policyConfig = config[type];
  
  switch (type) {
    case 'numeric_tag':
      return {
        ...basePolicy,
        type: 'numeric_tag' as const,
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
      return {
        ...basePolicy,
        type: 'string_attribute' as const,
        key: policyConfig.key || '',
        values: policyConfig.values || [],
      };
    case 'composite':
      return {
        ...basePolicy,
        type: 'composite' as const,
        operator: policyConfig.operator || 'and',
        subPolicies: policyConfig.sub_policies?.map(parsePolicyConfig) || [],
      };
    default:
      throw new Error(`Unsupported policy type: ${type}`);
  }
};

const getPolicyType = (config: any): PolicyType => {
  const types: PolicyType[] = [
    'numeric_tag', 'probabilistic', 'rate_limiting', 'status_code',
    'string_attribute', 'latency', 'always_sample', 'boolean_tag',
    'composite', 'ottl', 'span_count', 'string_tag', 'trace_state'
  ];

  const foundType = types.find(type => config[type]);
  if (!foundType) {
    throw new Error('Invalid policy configuration: Missing policy type');
  }

  return foundType;
}; 