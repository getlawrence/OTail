export type PipelineType = 'traces' | 'metrics' | 'logs';

export interface PipelineConfig {
  receivers: string[];
  processors: string[];
  exporters: string[];
}

export interface ServiceConfig {
  pipelines: {
    [key: string]: PipelineConfig;
  };
}

export interface OtelConfig {
  receivers: Record<string, any>;
  processors: Record<string, any>;
  exporters: Record<string, any>;
  service: ServiceConfig;
}

export interface OtelConfigBuilderProps {
  onChange?: (yaml: string) => void;
  initialYaml?: string;
}