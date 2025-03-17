export type StatusCode = 'OK' | 'ERROR' | 'UNSET';
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceState?: string;
  name: string;
  kind: number;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Record<string, any>;
  status?: Partial<{
    code: StatusCode;
    message?: string;
  }>;
  events?: Array<{
    time: number;
    name: string;
    attributes: Record<string, any>;
  }>;
}

export interface Trace {
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
  scope: Scope;
  spans: Span[];
}

export interface Scope {
  name: string;
  version: string;
  attributes: Record<string, any>;
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
  resourceSpans: [
    {
      resource: {
        attributes: [
          {
            key: "service.name",
            value: {
              stringValue: "example-service"
            }
          },
          {
              key: "deployment.environment",
              value: {
                stringValue: "production"
              }
          }
        ]
      },
      scopeSpans: [
        {
          scope: {
            name: "my.library",
            version: "1.0.0",
            attributes: [
              {
                key: "my.scope.attribute",
                value: {
                  stringValue: "some scope attribute"
                }
              }
            ]
          },
          spans: [
            {
              traceId: "5b8efff798038103d269b633813fc60c",
              spanId: "eee19b7ec3c1b174",
              parentSpanId: "eee19b7ec3c1b173",
              name: "process-request",
              startTimeUnixNano: "1544712660000000000",
              endTimeUnixNano: "1544712661000000000",
              kind: 2,
              attributes: [
                {
                  key: "http.method",
                  value: {
                    stringValue: "GET"
                  }
                },
                {
                  key: "http.url",
                  value: {
                    stringValue: "http://example.com/api/data"
                  }
                },
                {
                  key: "http.status_code",
                  value: {
                    stringValue: "200"
                  }
                }
              ],
              status: {}
            }
          ]
        }
      ]
    }
  ]
}