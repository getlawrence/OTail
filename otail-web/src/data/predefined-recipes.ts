import { Recipe } from '@/types/policy';

export const PREDEFINED_RECIPES: Recipe[] = [
  {
    id: 'stg-env',
    name: 'Staging Environment',
    createdAt: '2025-02-20T00:00:00.000Z',
    policies: [
      {
        name: 'staging env',
        type: 'and',
        subPolicies: [
          {
            name: 'env',
            type: 'string_attribute',
            key: 'deployment.environment.name',
            values: ['staging'],
            enabledRegexMatching: false,
          },
          {
            name: 'always sample',
            type: 'always_sample',
          },
        ],
      }]
  },
  {
    id: 'low-sampling',
    name: 'Noisy Endpoint',
    createdAt: '2025-02-20T00:00:00.000Z',
    policies: [
      {
        name: 'noisy url',
        type: 'and',
        subPolicies: [
          {
            name: 'endpoint',
            type: 'string_attribute',
            key: 'http.url',
            values: ['.*\endpoint_name$'],
            enabledRegexMatching: true,
          },
          {
            name: 'rate',
            type: 'probabilistic',
            samplingPercentage: 10
          }]
      }
    ]
  },
  {
    id: 'production-ready',
    name: 'Production Ready',
    createdAt: '2025-02-20T00:00:00.000Z',
    policies: [
      {
        name: 'Errors',
        type: 'status_code',
        statusCodes: ['ERROR']
      },
      {
        name: 'High Latency',
        type: 'latency',
        thresholdMs: 2000
      },
      {
        name: 'Background Sample',
        type: 'probabilistic',
        samplingPercentage: 5
      }
    ]
  }
];
