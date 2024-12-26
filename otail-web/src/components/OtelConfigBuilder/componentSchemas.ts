interface SchemaField {
  type: 'string' | 'number' | 'boolean';
  label: string;
  required?: boolean;
  default?: any;
  placeholder?: string;
}

export interface ComponentSchema {
  fields: Record<string, SchemaField>;
}

export const componentSchemas: Record<string, ComponentSchema> = {
  otlp: {
    fields: {
      endpoint: {
        type: 'string',
        label: 'Endpoint',
        required: true,
        placeholder: 'Enter OTLP endpoint',
      },
      protocol: {
        type: 'string',
        label: 'Protocol',
        required: true,
        default: 'grpc',
      },
      tls: {
        type: 'boolean',
        label: 'Enable TLS',
        default: false,
      },
    },
  },
  batch: {
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
  tail_sampling: {
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
  // Add more component schemas as needed
};

export type ComponentType = keyof typeof componentSchemas;
