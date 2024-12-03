import { Decision, Span, Trace, Resource, ScopeSpan } from "../types/TraceTypes";

export const hasResourceOrSpanWithCondition = (
    td: Trace,
    shouldSampleResource: (resource: Resource) => boolean,
    shouldSampleSpan: (span: Span) => boolean): Decision => {
    for (let i = 0; i < td.resourceSpans.length; i++) {
        const rs = td.resourceSpans[i];
        const resource = rs.resource;
        if (shouldSampleResource(resource)) {
            return Decision.Sampled
        }

        if (hasInstrumentationLibrarySpanWithCondition(rs.scopeSpans, shouldSampleSpan)) {
            return Decision.Sampled
        }
    }
    return Decision.NotSampled
}

// invertHasResourceOrSpanWithCondition iterates through all the resources and instrumentation library spans until any
// callback returns false.
export const invertHasResourceOrSpanWithCondition = (
    td: Trace,
    shouldSampleResource: (resource: Resource) => boolean,
    shouldSampleSpan: (span: Span) => boolean,
): Decision => {
    for (let i = 0; i < td.resourceSpans.length; i++) {
        const rs = td.resourceSpans[i];
        const resource = rs.resource;
        if (!shouldSampleResource(resource)) {
            return Decision.InvertNotSampled
        }

        if (!invertHasInstrumentationLibrarySpanWithCondition(rs.scopeSpans, shouldSampleSpan)) {
            return Decision.InvertNotSampled
        }
    }
    return Decision.InvertSampled
}

// hasSpanWithCondition iterates through all the instrumentation library spans until any callback returns true.
export const hasSpanWithCondition = (td: Trace, shouldSample: (span: Span) => boolean): Decision => {
    for (let i = 0; i < td.resourceSpans.length; i++) {
        const rs = td.resourceSpans[i];

        if (hasInstrumentationLibrarySpanWithCondition(rs.scopeSpans, shouldSample)) {
            return Decision.Sampled
        }
    }
    return Decision.NotSampled
}

export const hasInstrumentationLibrarySpanWithCondition = (ilss: ScopeSpan[], check: (span: Span) => boolean): boolean => {
    for (let i = 0; i < ilss.length; i++) {
        const ils = ilss[i]
        for (let j = 0; j < ils.spans.length; j++) {
            const span = ils.spans[j];
            if (check(span)) {
                return true
            }
        }
    }
    return false
}

export const invertHasInstrumentationLibrarySpanWithCondition = (ilss: ScopeSpan[], check: (span: Span) => boolean): boolean => {
    for (let i = 0; i < ilss.length; i++) {
        const ils = ilss[i];

        for (let j = 0; j < ils.spans.length; j++) {
            const span = ils.spans[j]

            if (!check(span)) {
                return false
            }
        }
    }
    return true
}


export const getSpanCount = (trace: Trace) => {
    return trace.resourceSpans.length;
}