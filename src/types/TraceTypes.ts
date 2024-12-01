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
  resourceSpans: ResourceSpan[]
}

export interface Resource {
  attributes: Record<string, any>;
}

export interface ResourceSpan {
  resource: Resource;
  scopeSpans: ScopeSpan[]
}

export interface ScopeSpan {
  spans: Span[];
}

export enum Decision {
  Sampled,
  NotSampled,
  InvertNotSampled,
  InvertSampled,
  Error
}

export interface DecisionResult {
  finalDecision: Decision;
  policyDecisions: Record<string, Decision>;
}