export type StatusCode = 'OK' | 'ERROR' | 'UNSET';
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceState?: string;
  name: string;
  kind: string;
  startTime: number;
  endTime: number;
  attributes: Record<string, any>;
  status: {
    code: StatusCode;
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

export const defaultTrace: Trace = {
  traceId: "abcdef0123456789",
  resourceSpans: [
    {
      resource: {
        attributes: {
          "service.name": "example-service",
          "deployment.environment": "production"
        }
      },
      scopeSpans: [
        {
          spans: [
            {
              traceId: "abcdef0123456789",
              spanId: "span123",
              parentSpanId: "parent456",
              name: "process-request",
              kind: "SERVER",
              startTime: 1673510400000,
              endTime: 1673510401000,
              attributes: {
                "http.method": "GET",
                "http.url": "/api/data",
                "http.status_code": 200
              },
              status: {
                code: "OK",
                message: "Request processed successfully"
              },
              events: [
                {
                  time: 1673510400500,
                  name: "cache.hit",
                  attributes: {
                    "cache.key": "user-123"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};