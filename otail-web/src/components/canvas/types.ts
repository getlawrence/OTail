export type PipelineType = 'traces' | 'metrics' | 'logs' | 'extensions';

export interface PipelineConfig {
  receivers: string[];
  processors: string[];
  exporters: string[];
}

export interface ServiceConfig {
  pipelines: {
    [key: string]: PipelineConfig;
  };
  extensions: string[];
}

export interface ReceiverConfig {
  [key: string]: any;
}

export interface ProcessorConfig {
  [key: string]: any;
}

export interface ExporterConfig {
  [key: string]: any;
}

export interface ConnectorConfig {
  [key: string]: any;
}

export interface ExtensionConfig {
  [key: string]: any;
}

export interface OtelConfig {
  receivers: Record<string, ReceiverConfig>;
  processors: Record<string, ProcessorConfig>;
  exporters: Record<string, ExporterConfig>;
  connectors: Record<string, ConnectorConfig>;
  extensions: Record<string, ExtensionConfig>;
  service: ServiceConfig;
}

export interface OtelConfigBuilderProps {
  onChange?: (yaml: string) => void;
  initialYaml?: string;
}