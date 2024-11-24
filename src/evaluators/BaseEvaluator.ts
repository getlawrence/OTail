import { Policy } from '../types/PolicyTypes';
import { Trace, EvaluationResult } from '../types/TraceTypes';

export interface PolicyEvaluator {
  evaluate(trace: Trace): EvaluationResult;
}

export abstract class BasePolicyEvaluator implements PolicyEvaluator {
  protected policy: Policy;

  constructor(policy: Policy) {
    this.policy = policy;
  }

  abstract evaluate(trace: Trace): EvaluationResult;
} 