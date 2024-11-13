import { Policy } from './PolicyTypes';

export interface TailSamplingConfig {
  policies: Policy[];
  decisionWait?: number;
  numTraces?: number;
} 