import { Policy } from '../types/PolicyTypes';
import { Trace, Decision } from '../types/TraceTypes';

export interface PolicyEvaluator {
  evaluate(trace: Trace): Decision;
}