import { Trace, Decision } from "@/types/trace";
import { BasePolicyEvaluator } from "./BaseEvaluator";

const DEFAULT_HASH_SALT = "default-hash-seed";
const FNV_OFFSET_BASIS = 2166136261; // 32-bit FNV offset basis
const FNV_PRIME = 16777619; // 32-bit FNV prime

export class ProbabilisticEvaluator extends BasePolicyEvaluator {
    private readonly threshold: number;
    private readonly hashSalt: string;

    constructor(name: string, hashSalt: string = '', samplingPercentage: number) {
        super(name);
        if (samplingPercentage < 0 || samplingPercentage > 100) {
            throw new Error('Sampling percentage must be between 0 and 100');
        }
        this.hashSalt = hashSalt || DEFAULT_HASH_SALT;
        this.threshold = this.calculateThreshold(samplingPercentage / 100);
    }

    evaluate(trace: Trace): Decision {
        const traceId = trace.resourceSpans[0].scopeSpans[0].spans[0].traceId;
        if (!traceId) {
            return Decision.NotSampled;
        }
        if (this.hashTraceId(traceId) <= this.threshold) {
            return Decision.Sampled;
        }
        return Decision.NotSampled;
    }

    private calculateThreshold(ratio: number): number {
        return Math.floor(0xFFFFFFFF * ratio); // Use full 32-bit range
    }

    private hashTraceId(traceId: string): number {
        let hash = FNV_OFFSET_BASIS;

        // Hash the salt first
        const saltBytes = new TextEncoder().encode(this.hashSalt);
        for (const byte of saltBytes) {
            hash ^= byte;
            hash = ((hash * FNV_PRIME) >>> 0); // Keep as 32-bit unsigned
        }

        // Convert hex string to bytes
        const cleanHex = traceId.replace(/-/g, '');
        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
        }

        // Hash the trace ID bytes
        for (const byte of bytes) {
            hash ^= byte;
            hash = ((hash * FNV_PRIME) >>> 0); // Keep as 32-bit unsigned
        }

        return hash;
    }
}