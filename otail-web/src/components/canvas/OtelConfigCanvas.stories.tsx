import type { Meta, StoryObj } from '@storybook/react';
import OtelConfigCanvas from './OtelConfigCanvas';

const meta: Meta<typeof OtelConfigCanvas> = {
  title: 'Canvas/OtelConfigCanvas',
  component: OtelConfigCanvas,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ 
        height: '100vh', 
        width: '100%', 
        position: 'relative',
        backgroundColor: '#f5f5f5'
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OtelConfigCanvas>;

export const Default: Story = {
  args: {
    onChange: (yaml) => console.log('YAML changed:', yaml),
  },
};

export const WithInitialConfig: Story = {
  args: {
    initialYaml: `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024

exporters:
  otlp:
    endpoint: otel-collector:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]`,
    onChange: (yaml) => console.log('YAML changed:', yaml),
  },
};

export const WithTracesOnly: Story = {
  args: {
    initialYaml: `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 1s

exporters:
  otlp:
    endpoint: otel-collector:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]`,
    onChange: (yaml) => console.log('YAML changed:', yaml),
  },
};

export const WithComplexPipeline: Story = {
  args: {
    initialYaml: `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:14250

processors:
  batch:
    timeout: 1s
  memory_limiter:
    check_interval: 1s
    limit_mib: 1000
  k8sattributes:
    auth_type: serviceAccount
  resource:
    attributes:
      - key: deployment.environment
        value: production
        action: upsert

exporters:
  otlp:
    endpoint: otel-collector:4317
    tls:
      insecure: true
  logging:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp, jaeger]
      processors: [memory_limiter, k8sattributes, resource, batch]
      exporters: [otlp, logging]`,
    onChange: (yaml) => console.log('YAML changed:', yaml),
  },
}; 