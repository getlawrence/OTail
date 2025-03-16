import { Trace, Decision } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";

declare global {
  interface Window {
    evaluateOTTL: (traceJSON: string, spanConditions: string, spanEventConditions: string, errorMode: string) => {
      error: boolean;
      decision: number;
      message?: string;
    };
    Go: any;
  }
}

export class OttlEvaluator extends BasePolicyEvaluator {
  private errorMode: string;
  private spanConditions: string[];
  private spanEventConditions: string[];
  private wasmInitialized: boolean = false;
  private wasmInstance: WebAssembly.Instance | null = null;
  private go: any = null;

  constructor(policyName: string, errorMode: string, spanConditions: string[], spanEventConditions: string[]) {
    super(policyName);
    this.errorMode = errorMode || 'ignore';
    this.spanConditions = spanConditions || [];
    this.spanEventConditions = spanEventConditions || [];
  }

  /**
   * Initializes the WebAssembly module for OTTL evaluation
   */
  private async initWasm(): Promise<void> {
    if (this.wasmInitialized) {
      return;
    }

    try {
      // Load the Go WASM runtime
      const go = new window.Go();
      this.go = go;

      // Fetch and instantiate the WebAssembly module
      const wasmResponse = await fetch('/wasm/ottl.wasm');
      const wasmBuffer = await wasmResponse.arrayBuffer();
      const wasmResult = await WebAssembly.instantiate(wasmBuffer, go.importObject);
      this.wasmInstance = wasmResult.instance;

      // Start the Go WASM runtime
      this.go.run(this.wasmInstance);
      this.wasmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OTTL WASM evaluator:', error);
      throw new Error(`Failed to initialize OTTL WASM evaluator: ${error}`);
    }
  }

  /**
   * Ensures the WASM module is loaded and ready for evaluation
   */
  private async ensureWasmReady(): Promise<void> {
    if (!this.wasmInitialized) {
      // Load the Go WASM runtime script if it hasn't been loaded yet
      if (!window.Go) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/wasm/wasm_exec.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load wasm_exec.js'));
          document.head.appendChild(script);
        });
      }

      await this.initWasm();
    }
  }

  /**
   * Evaluates a trace against the OTTL expressions
   */
  async evaluateAsync(trace: Trace): Promise<Decision> {
    try {
      await this.ensureWasmReady();

      // Convert trace to JSON
      const traceJSON = JSON.stringify(trace);
      const result = window.evaluateOTTL(traceJSON, this.spanConditions.join(','), this.spanEventConditions.join(','), this.errorMode);

      if (result.error) {
        console.error('OTTL span condition evaluation error:', result.message);
        if (this.errorMode === 'propagate') {
          return Decision.Error;
        }
        return Decision.NotSampled;
      }

      // If the condition matched, return the decision
      if (result.decision === Decision.Sampled) {
        return Decision.Sampled;
      }

      // If no conditions matched, return NotSampled
      return Decision.NotSampled;
    } catch (error) {
      console.error('Failed to evaluate OTTL expression:', error);
      return Decision.Error;
    }
  }

  /**
   * Synchronous version of evaluate that returns NotSampled for initial rendering
   * and then updates the decision asynchronously
   */
  evaluate(trace: Trace): Decision {
    // Start the async evaluation
    this.evaluateAsync(trace).then(decision => {
      // This could trigger an update or callback if needed
      console.log(`OTTL Evaluation complete: ${Decision[decision]}`);
    });

    // Return NotSampled by default for synchronous calls
    return Decision.NotSampled;
  }
}
