export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: string;
  startTime: number;
  endTime: number;
  attributes: Record<string, any>;
  status: {
    code: 'OK' | 'ERROR' | 'UNSET';
    message?: string;
  };
  events: Array<{
    time: number;
    name: string;
    attributes: Record<string, any>;
  }>;
}

export interface Trace {
  traceId: string;
  spans: Span[];
}

export interface EvaluationResult {
  sampled: boolean;
  reason?: string;
} 