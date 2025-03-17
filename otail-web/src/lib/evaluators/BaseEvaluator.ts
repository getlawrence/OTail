import { Trace, Decision } from '@/types/trace';

export interface PolicyEvaluator {
  policyName: string;
  evaluate(trace: Trace): Decision;
}

export interface AsyncPolicyEvaluator {
  policyName: string;
  evaluateAsync(trace: Trace): Promise<Decision>;
}

export abstract class BasePolicyEvaluator implements PolicyEvaluator {
  public policyName: string;
  
  constructor(policyName: string) {
    this.policyName = policyName;
  }
  
  abstract evaluate(trace: Trace): Decision;
}

export abstract class BaseAsyncPolicyEvaluator implements PolicyEvaluator, AsyncPolicyEvaluator {
  public policyName: string;
  
  constructor(policyName: string) {
    this.policyName = policyName;
  }
  
  // Default implementation that calls the async version
  evaluate(trace: Trace): Decision {
    // For sync evaluators that need to call the async version
    // This forces synchronous execution of the async method
    // NOTE: This approach should be used carefully as it blocks the thread
    let decision: Decision | undefined;
    let error: any;
    
    // Execute the async function synchronously
    const promise = this.evaluateAsync(trace).then(
      result => { decision = result; },
      err => { error = err; }
    );
    
    // Wait for the promise to complete (synchronously)
    this.waitForPromise(promise);
    
    // Handle results
    if (error) throw error;
    if (!decision) throw new Error("No decision was returned");
    
    return decision;
  }
  
  abstract evaluateAsync(trace: Trace): Promise<Decision>;
  
  private waitForPromise(promise: Promise<any>): void {
    // This is a primitive way to block until the promise resolves
    // Only suitable for specific use cases where you absolutely must block
    const startTime = Date.now();
    const timeout = 30000; // 30 seconds timeout
    
    while (true) {
      // Check if the promise has resolved
      const promiseStatus = (promise as any)._status;
      if (promiseStatus === 1 || promiseStatus === 2) break;
      
      // Timeout safety
      if (Date.now() - startTime > timeout) {
        throw new Error("Timeout waiting for async evaluation to complete");
      }
      
      // Spin wait (not ideal but needed for sync blocking)
      // In practice, you might want to use a more sophisticated approach
    }
  }
}

export async function evaluatePolicy(
  policyEvaluator: PolicyEvaluator | AsyncPolicyEvaluator,
  trace: Trace
): Promise<Decision> {
  // Check if the evaluator has an async method
  if ('evaluateAsync' in policyEvaluator) {
    return await (policyEvaluator as AsyncPolicyEvaluator).evaluateAsync(trace);
  }
  
  // Fall back to synchronous evaluation
  return Promise.resolve((policyEvaluator as PolicyEvaluator).evaluate(trace));
}