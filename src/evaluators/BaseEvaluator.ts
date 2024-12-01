import { Trace, Decision } from '../types/TraceTypes';

export interface PolicyEvaluator {
  policyName: string;
  evaluate(trace: Trace): Decision;
}

export abstract class BasePolicyEvaluator implements PolicyEvaluator {
  public policyName: string
  constructor(policyName: string) {
    this.policyName = policyName;
  }
  abstract evaluate(trace: Trace): Decision;
}