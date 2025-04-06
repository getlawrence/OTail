import { SchemaField } from '@/components/shared/DynamicForm/types';

export type ComponentType = 'receiver' | 'processor' | 'exporter' | 'connector';

export interface ComponentSchema {
  type: ComponentType;
  displayName: string;
  fields: Record<string, SchemaField>;
}

export const componentSchemas: Record<string, Record<string, ComponentSchema>> = {
  // Receivers
  receivers: {
    otlp: {
      type: 'receiver',
      displayName: 'OTLP',
      fields: {
        protocols: {
          type: 'object',
          label: 'Protocols',
          required: true,
          fields: {
            grpc: {
              type: 'object',
              label: 'gRPC',
              fields: {
                endpoint: {
                  type: 'string',
                  label: 'Endpoint',
                  placeholder: 'Enter gRPC endpoint',
                },
                tls: {
                  type: 'boolean',
                  label: 'Enable TLS',
                  default: false,
                },
              },
            },
            http: {
              type: 'object',
              label: 'HTTP',
              fields: {
                endpoint: {
                  type: 'string',
                  label: 'Endpoint',
                  placeholder: 'Enter HTTP endpoint',
                },
              },
            },
          },
        },
      },
    },
    jaeger: {
      type: 'receiver',
      displayName: 'Jaeger',
      fields: {
        protocols: {
          type: 'object',
          label: 'Protocols',
          required: true,
          fields: {
            thrift_http: {
              type: 'object',
              label: 'Thrift HTTP',
              fields: {
                endpoint: {
                  type: 'string',
                  label: 'Endpoint',
                  placeholder: 'Enter Thrift HTTP endpoint',
                  default: ':14268',
                },
              },
            },
            thrift_binary: {
              type: 'object',
              label: 'Thrift Binary',
              fields: {
                endpoint: {
                  type: 'string',
                  label: 'Endpoint',
                  placeholder: 'Enter Thrift Binary endpoint',
                  default: ':6832',
                },
              },
            },
          },
        },
      },
    },
    zipkin: {
      type: 'receiver',
      displayName: 'Zipkin',
      fields: {
        endpoint: {
          type: 'string',
          label: 'Endpoint',
          required: true,
          placeholder: 'Enter Zipkin endpoint',
          default: ':9411/api/v2/spans',
        },
      },
    },
    prometheus: {
      type: 'receiver',
      displayName: 'Prometheus',
      fields: {
        config: {
          type: 'object',
          label: 'Configuration',
          required: true,
          fields: {
            scrape_configs: {
              type: 'array',
              label: 'Scrape Configs',
              itemType: 'object',
              fields: {
                job_name: {
                  type: 'string',
                  label: 'Job Name',
                  required: true,
                },
                scrape_interval: {
                  type: 'string',
                  label: 'Scrape Interval',
                  default: '15s',
                },
                static_configs: {
                  type: 'array',
                  label: 'Static Configs',
                  itemType: 'object',
                  fields: {
                    targets: {
                      type: 'array',
                      label: 'Targets',
                      itemType: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    kafka: {
      type: 'receiver',
      displayName: 'Kafka',
      fields: {
        brokers: {
          type: 'array',
          label: 'Brokers',
          required: true,
          itemType: 'string',
          placeholder: 'Enter broker address',
        },
        topic: {
          type: 'string',
          label: 'Topic',
          required: true,
          placeholder: 'Enter Kafka topic',
        },
        encoding: {
          type: 'enum',
          label: 'Encoding',
          options: ['otlp_proto', 'otlp_json', 'jaeger_proto', 'jaeger_json', 'zipkin_proto', 'zipkin_json'],
          default: 'otlp_proto',
        },
      },
    },
    opencensus: {
      type: 'receiver',
      displayName: 'OpenCensus',
      fields: {
        endpoint: {
          type: 'string',
          label: 'Endpoint',
          required: true,
          placeholder: 'Enter OpenCensus endpoint',
          default: ':55678',
        },
        transport: {
          type: 'enum',
          label: 'Transport',
          options: ['grpc', 'http'],
          default: 'grpc',
        },
      },
    },
    fluentforward: {
      type: 'receiver',
      displayName: 'Fluent Forward',
      fields: {
        endpoint: {
          type: 'string',
          label: 'Endpoint',
          required: true,
          placeholder: 'Enter Fluent Forward endpoint',
          default: '0.0.0.0:24224',
        },
      },
    },
    hostmetrics: {
      type: 'receiver',
      displayName: 'Host Metrics',
      fields: {
        collection_interval: {
          type: 'string',
          label: 'Collection Interval',
          required: true,
          default: '60s',
          placeholder: 'Enter collection interval (e.g., 60s)',
        },
        scrapers: {
          type: 'multiselect',
          label: 'Scrapers',
          options: ['cpu', 'disk', 'load', 'filesystem', 'memory', 'network', 'paging', 'process'],
          default: ['cpu', 'memory', 'disk', 'network'],
        },
      },
    },
  },

  processors: {
    // Processors
    batch: {
      type: 'processor',
      displayName: 'Batch',
      fields: {
        timeout: {
          type: 'string',
          label: 'Timeout',
          required: true,
          default: '200ms',
          placeholder: 'Enter timeout (e.g., 200ms)',
        },
        send_batch_size: {
          type: 'number',
          label: 'Send Batch Size',
          required: true,
          default: 100,
        },
      },
    },
    memory_limiter: {
      type: 'processor',
      displayName: 'Memory Limiter',
      fields: {
        check_interval: {
          type: 'string',
          label: 'Check Interval',
          required: true,
          default: '1s',
          placeholder: 'Enter check interval (e.g., 1s)',
        },
        limit_percentage: {
          type: 'number',
          label: 'Limit Percentage',
          required: true,
          default: 80,
          placeholder: 'Enter memory limit percentage',
        },
        spike_limit_percentage: {
          type: 'number',
          label: 'Spike Limit Percentage',
          required: true,
          default: 20,
          placeholder: 'Enter spike limit percentage',
        },
      },
    },
    tail_sampling: {
      type: 'processor',
      displayName: 'Tail Sampling',
      fields: {
        decision_wait: {
          type: 'string',
          label: 'Decision Wait',
          required: true,
          default: '30s',
          placeholder: 'Enter decision wait time (e.g., 30s)',
        },
        num_traces: {
          type: 'number',
          label: 'Number of Traces',
          required: true,
          default: 50000,
        },
      },
    },
    probabilistic_sampling: {
      type: 'processor',
      displayName: 'Probabilistic Sampling',
      fields: {
        sampling_percentage: {
          type: 'number',
          label: 'Sampling Percentage',
          required: true,
          default: 10,
          placeholder: 'Enter sampling percentage (0-100)',
        },
      },
    },
    span: {
      type: 'processor',
      displayName: 'Span',
      fields: {
        name: {
          type: 'object',
          label: 'Name Configuration',
          fields: {
            from_attributes: {
              type: 'array',
              label: 'From Attributes',
              itemType: 'string',
              placeholder: 'Enter attribute name',
            },
            separator: {
              type: 'string',
              label: 'Separator',
              default: ':',
            },
          },
        },
      },
    },
    filter: {
      type: 'processor',
      displayName: 'Filter',
      fields: {
        spans: {
          type: 'object',
          label: 'Spans Filter',
          fields: {
            include: {
              type: 'object',
              label: 'Include',
              fields: {
                match_type: {
                  type: 'enum',
                  label: 'Match Type',
                  options: ['strict', 'regexp'],
                  default: 'strict',
                },
                attributes: {
                  type: 'array',
                  label: 'Attributes',
                  itemType: 'object',
                  fields: {
                    key: {
                      type: 'string',
                      label: 'Key',
                      required: true,
                    },
                    value: {
                      type: 'string',
                      label: 'Value',
                      required: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    resource: {
      type: 'processor',
      displayName: 'Resource',
      fields: {
        attributes: {
          type: 'array',
          label: 'Attributes',
          itemType: 'object',
          fields: {
            key: {
              type: 'string',
              label: 'Key',
              required: true,
            },
            value: {
              type: 'string',
              label: 'Value',
              required: true,
            },
            action: {
              type: 'enum',
              label: 'Action',
              options: ['insert', 'update', 'upsert', 'delete'],
              default: 'insert',
            },
          },
        },
      },
    },
    transform: {
      type: 'processor',
      displayName: 'Transform',
      fields: {
        trace_statements: {
          type: 'array',
          label: 'Trace Statements',
          itemType: 'object',
          fields: {
            context: {
              type: 'string',
              label: 'Context',
              default: 'span',
            },
            statements: {
              type: 'array',
              label: 'Statements',
              itemType: 'string',
            },
          },
        },
      },
    },
    k8s_attributes: {
      type: 'processor',
      displayName: 'K8s Attributes',
      fields: {
        auth_type: {
          type: 'enum',
          label: 'Auth Type',
          options: ['serviceAccount', 'kubeConfig', 'none'],
          default: 'serviceAccount',
        },
        passthrough: {
          type: 'boolean',
          label: 'Passthrough',
          default: false,
        },
        extract: {
          type: 'multiselect',
          label: 'Extract',
          options: ['metadata', 'annotations', 'labels'],
          default: ['metadata', 'labels'],
        },
      },
    },
  },
  // Exporters
  exporters: {
    otlp: {
      type: 'exporter',
      displayName: 'OTLP',
      fields: {
        endpoint: {
          type: 'string',
          label: 'Endpoint',
          required: true,
          placeholder: 'Enter OTLP endpoint',
        },
        tls: {
          type: 'boolean',
          label: 'Enable TLS',
          default: false,
        },
      },
    },
    zipki: {
      type: 'exporter',
      displayName: 'Zipkin',
      fields: {
        endpoint: {
          type: 'string',
          label: 'Endpoint',
          required: true,
          placeholder: 'Enter Zipkin endpoint',
          default: 'http://zipkin:9411/api/v2/spans',
        },
        format: {
          type: 'enum',
          label: 'Format',
          options: ['json', 'proto'],
          default: 'json',
        },
      },
    },
    prometheus: {
      type: 'exporter',
      displayName: 'Prometheus',
      fields: {
        endpoint: {
          type: 'string',
          label: 'Endpoint',
          required: true,
          placeholder: 'Enter Prometheus endpoint',
          default: ':8889',
        },
        namespace: {
          type: 'string',
          label: 'Namespace',
          placeholder: 'Enter metrics namespace',
        },
      },
    },
    logging: {
      type: 'exporter',
      displayName: 'Logging',
      fields: {
        verbosity: {
          type: 'enum',
          label: 'Verbosity',
          options: ['detailed', 'normal', 'basic'],
          default: 'normal',
        },
        sampling_initial: {
          type: 'number',
          label: 'Sampling Initial',
          default: 2,
        },
        sampling_thereafter: {
          type: 'number',
          label: 'Sampling Thereafter',
          default: 500,
        },
      },
    },
    file: {
      type: 'exporter',
      displayName: 'File',
      fields: {
        path: {
          type: 'string',
          label: 'File Path',
          required: true,
          placeholder: 'Enter file path',
        },
        rotation: {
          type: 'object',
          label: 'Rotation',
          fields: {
            max_size_mb: {
              type: 'number',
              label: 'Max Size (MB)',
              default: 100,
            },
            max_age_days: {
              type: 'number',
              label: 'Max Age (Days)',
              default: 0,
            },
            max_backups: {
              type: 'number',
              label: 'Max Backups',
              default: 5,
            },
          },
        },
      },
    },
    kafka: {
      type: 'exporter',
      displayName: 'Kafka',
      fields: {
        brokers: {
          type: 'array',
          label: 'Brokers',
          required: true,
          itemType: 'string',
          placeholder: 'Enter broker address',
        },
        topic: {
          type: 'string',
          label: 'Topic',
          required: true,
          placeholder: 'Enter Kafka topic',
        },
        encoding: {
          type: 'enum',
          label: 'Encoding',
          options: ['otlp_proto', 'otlp_json'],
          default: 'otlp_proto',
        },
      },
    },
    elasticsearch: {
      type: 'exporter',
      displayName: 'Elasticsearch',
      fields: {
        endpoints: {
          type: 'array',
          label: 'Endpoints',
          required: true,
          itemType: 'string',
          placeholder: 'Enter Elasticsearch endpoint',
        },
        index: {
          type: 'string',
          label: 'Index',
          default: 'traces',
        },
        mapping: {
          type: 'enum',
          label: 'Mapping',
          options: ['ecs', 'ecs-1.0.0', 'otel-v1'],
          default: 'otel-v1',
        },
      },
    },
    awsxray: {
      type: 'exporter',
      displayName: 'AWS X-Ray',
      fields: {
        region: {
          type: 'string',
          label: 'AWS Region',
          required: true,
          placeholder: 'Enter AWS region',
        },
        role_arn: {
          type: 'string',
          label: 'Role ARN',
          placeholder: 'Enter IAM Role ARN (optional)',
        },
        endpoint: {
          type: 'string',
          label: 'Endpoint',
          placeholder: 'Enter custom endpoint (optional)',
        },
      },
    },

    // Connectors
    count: {
      type: 'connector',
      displayName: 'Count',
      fields: {
        spans: {
          type: 'object',
          label: 'Spans',
          fields: {
            '*': {
              type: 'object',
              label: 'Metric Name',
              fields: {
                description: {
                  type: 'string',
                  label: 'Description',
                  default: 'The number of spans observed.',
                },
                conditions: {
                  type: 'array',
                  label: 'Conditions',
                  itemType: 'string',
                  placeholder: 'Enter OTTL condition',
                },
                attributes: {
                  type: 'array',
                  label: 'Attributes',
                  itemType: 'object',
                  fields: {
                    key: {
                      type: 'string',
                      label: 'Key',
                      required: true,
                      placeholder: 'Attribute key',
                    },
                    default_value: {
                      type: 'string',
                      label: 'Default Value',
                      placeholder: 'Default value if attribute is missing',
                    },
                  },
                },
              },
            },
          },
        },
        spanevents: {
          type: 'object',
          label: 'Span Events',
          fields: {
            '*': {
              type: 'object',
              label: 'Metric Name',
              fields: {
                description: {
                  type: 'string',
                  label: 'Description',
                  default: 'The number of span events observed.',
                },
                conditions: {
                  type: 'array',
                  label: 'Conditions',
                  itemType: 'string',
                  placeholder: 'Enter OTTL condition',
                },
                attributes: {
                  type: 'array',
                  label: 'Attributes',
                  itemType: 'object',
                  fields: {
                    key: {
                      type: 'string',
                      label: 'Key',
                      required: true,
                      placeholder: 'Attribute key',
                    },
                    default_value: {
                      type: 'string',
                      label: 'Default Value',
                      placeholder: 'Default value if attribute is missing',
                    },
                  },
                },
              },
            },
          },
        },
        metrics: {
          type: 'object',
          label: 'Metrics',
          fields: {
            '*': {
              type: 'object',
              label: 'Metric Name',
              fields: {
                description: {
                  type: 'string',
                  label: 'Description',
                  default: 'The number of metrics observed.',
                },
                conditions: {
                  type: 'array',
                  label: 'Conditions',
                  itemType: 'string',
                  placeholder: 'Enter OTTL condition',
                },
              },
            },
          },
        },
        datapoints: {
          type: 'object',
          label: 'Data Points',
          fields: {
            '*': {
              type: 'object',
              label: 'Metric Name',
              fields: {
                description: {
                  type: 'string',
                  label: 'Description',
                  default: 'The number of data points observed.',
                },
                conditions: {
                  type: 'array',
                  label: 'Conditions',
                  itemType: 'string',
                  placeholder: 'Enter OTTL condition',
                },
                attributes: {
                  type: 'array',
                  label: 'Attributes',
                  itemType: 'object',
                  fields: {
                    key: {
                      type: 'string',
                      label: 'Key',
                      required: true,
                      placeholder: 'Attribute key',
                    },
                    default_value: {
                      type: 'string',
                      label: 'Default Value',
                      placeholder: 'Default value if attribute is missing',
                    },
                  },
                },
              },
            },
          },
        },
        logs: {
          type: 'object',
          label: 'Logs',
          fields: {
            '*': {
              type: 'object',
              label: 'Metric Name',
              fields: {
                description: {
                  type: 'string',
                  label: 'Description',
                  default: 'The number of log records observed.',
                },
                conditions: {
                  type: 'array',
                  label: 'Conditions',
                  itemType: 'string',
                  placeholder: 'Enter OTTL condition',
                },
                attributes: {
                  type: 'array',
                  label: 'Attributes',
                  itemType: 'object',
                  fields: {
                    key: {
                      type: 'string',
                      label: 'Key',
                      required: true,
                      placeholder: 'Attribute key',
                    },
                    default_value: {
                      type: 'string',
                      label: 'Default Value',
                      placeholder: 'Default value if attribute is missing',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    span_metrics: {
      type: 'connector',
      displayName: 'Span Metrics',
      fields: {
        metrics: {
          type: 'array',
          label: 'Metrics',
          itemType: 'object',
          fields: {
            name: {
              type: 'string',
              label: 'Metric Name',
              required: true,
            },
            description: {
              type: 'string',
              label: 'Description',
            },
            unit: {
              type: 'string',
              label: 'Unit',
              default: 'ms',
            },
            mode: {
              type: 'enum',
              label: 'Mode',
              options: ['delta', 'cumulative'],
              default: 'cumulative',
            },
          },
        },
        dimensions: {
          type: 'array',
          label: 'Dimensions',
          itemType: 'string',
          placeholder: 'Enter attribute to use as dimension',
        },
      },
    },
    log_dedup: {
      type: 'processor',
      displayName: 'Log Dedup',
      fields: {
        interval: {
          type: 'string',
          label: 'Interval',
          required: true,
          default: '10s',
          placeholder: 'Enter interval (e.g., 10s)',
        },
        log_count_attribute: {
          type: 'string',
          label: 'Log Count Attribute',
          required: true,
          default: 'log_count',
          placeholder: 'Enter log count attribute name',
        },
        timezone: {
          type: 'string',
          label: 'Timezone',
          required: true,
          default: 'UTC',
          placeholder: 'Enter timezone (e.g., America/New_York)',
        },
        conditions: {
          type: 'array',
          label: 'Conditions',
          itemType: 'string',
          placeholder: 'Enter OTTL expression',
        },
        include_fields: {
          type: 'array',
          label: 'Include Fields',
          itemType: 'string',
          placeholder: 'Enter field name (e.g., body.timestamp)',
        },
        exclude_fields: {
          type: 'array',
          label: 'Exclude Fields',
          itemType: 'string',
          placeholder: 'Enter field name (e.g., body.timestamp)',
        },
      },
    },
    metricstransform: {
      type: 'processor',
      displayName: 'Metrics Transform',
      fields: {
        transforms: {
          type: 'array',
          label: 'Transforms',
          itemType: 'object',
          fields: {
            include: {
              type: 'string',
              label: 'Include',
              required: true,
              placeholder: 'Enter metric name pattern',
            },
            match_type: {
              type: 'enum',
              label: 'Match Type',
              options: ['strict', 'regexp'],
              default: 'strict',
            },
            action: {
              type: 'enum',
              label: 'Action',
              options: ['update', 'insert', 'combine'],
              default: 'update',
            },
            new_name: {
              type: 'string',
              label: 'New Name',
              placeholder: 'Enter new metric name',
            },
            operations: {
              type: 'array',
              label: 'Operations',
              itemType: 'object',
              fields: {
                action: {
                  type: 'enum',
                  label: 'Operation Action',
                  options: ['add_label', 'update_label', 'delete_label_value', 'toggle_scalar_data_type', 'experimental_scale_value', 'aggregate_labels', 'aggregate_label_values'],
                  required: true,
                },
                label: {
                  type: 'string',
                  label: 'Label',
                  placeholder: 'Enter label name',
                },
                new_label: {
                  type: 'string',
                  label: 'New Label',
                  placeholder: 'Enter new label name',
                },
                new_value: {
                  type: 'string',
                  label: 'New Value',
                  placeholder: 'Enter new value',
                },
                label_value: {
                  type: 'string',
                  label: 'Label Value',
                  placeholder: 'Enter label value',
                },
                label_set: {
                  type: 'array',
                  label: 'Label Set',
                  itemType: 'string',
                  placeholder: 'Enter label name',
                },
                aggregation_type: {
                  type: 'enum',
                  label: 'Aggregation Type',
                  options: ['sum', 'mean', 'min', 'max', 'count', 'median'],
                  placeholder: 'Select aggregation type',
                },
                experimental_scale: {
                  type: 'number',
                  label: 'Scale Value',
                  placeholder: 'Enter scale value',
                },
                aggregated_values: {
                  type: 'array',
                  label: 'Aggregated Values',
                  itemType: 'string',
                  placeholder: 'Enter value to aggregate',
                },
              },
            },
          },
        },
      },
    },
  },
};
