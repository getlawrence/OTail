import { useState, FC} from 'react';
import Editor from '@monaco-editor/react';
import OtelConfigVisualizer from '../components/OtelConfigVisualizer';

const defaultConfig = `receivers:
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
    endpoint: tempo:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]`;

const OtelConfig: FC<{config?: string}> = ({config}) => {
  const [yamlConfig, setYamlConfig] = useState(config ?? defaultConfig);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <h1 className="text-2xl font-bold">OpenTelemetry Collector Configuration Visualizer</h1>
      <div className="grid grid-cols-2 gap-4 flex-grow">
        <div className="h-[600px] border rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={yamlConfig}
            onChange={(value) => setYamlConfig(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <OtelConfigVisualizer yamlConfig={yamlConfig} />
        </div>
      </div>
    </div>
  );
};

export default OtelConfig;
