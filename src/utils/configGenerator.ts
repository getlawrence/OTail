import { dump } from 'js-yaml';
import { TailSamplingConfig } from '../types/ConfigTypes';

export const generateYamlConfig = (config: TailSamplingConfig): string => {
  const processorConfig = {
    processors: {
      tail_sampling: {
        decision_wait: config.decisionWait || 10,
        num_traces: config.numTraces || 100,
        policies: config.policies.map(policy => {
          const basePolicy = {
            name: policy.name,
            type: policy.type,
            enabled: policy.enabled,
          };

          switch (policy.type) {
            case 'numeric_tag':
              return {
                ...basePolicy,
                numeric_tag: {
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
          }
        }),
      },
    },
  };

  return dump(processorConfig);
}; 