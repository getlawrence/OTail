package evaluator

import (
	"context"

	"github.com/getlawrence/otail/wasm/ottl/filter"
	"github.com/open-telemetry/opentelemetry-collector-contrib/pkg/ottl"
	"github.com/open-telemetry/opentelemetry-collector-contrib/pkg/ottl/contexts/ottlspan"
	"github.com/open-telemetry/opentelemetry-collector-contrib/pkg/ottl/contexts/ottlspanevent"
	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.uber.org/zap"
)

// SamplingDecision represents the outcome of evaluating spans against OTTL conditions
type SamplingDecision string

const (
	Sampled    SamplingDecision = "Sampled"
	NotSampled SamplingDecision = "NotSampled"
)

// OTTLEvaluator handles the evaluation of OTTL expressions against trace data
type OTTLEvaluator struct {
	spanBoolExpr      *ottl.ConditionSequence[ottlspan.TransformContext]
	spanEventBoolExpr *ottl.ConditionSequence[ottlspanevent.TransformContext]
	traces            ptrace.Traces
}

// NewOTTLEvaluator creates a new evaluator with the provided OTTL conditions
func NewOTTLEvaluator(
	spanCondition string,
	spanEventCondition string,
	errMode ottl.ErrorMode,
	logger *zap.Logger,
) (*OTTLEvaluator, error) {
	settings := component.TelemetrySettings{}
	settings.Logger = logger

	var spanBoolExpr *ottl.ConditionSequence[ottlspan.TransformContext]
	var spanEventBoolExpr *ottl.ConditionSequence[ottlspanevent.TransformContext]

	if spanCondition != "" {
		var err error
		spanBoolExpr, err = filter.NewBoolExprForSpan(
			[]string{spanCondition},
			filter.StandardSpanFuncs(),
			errMode,
			settings,
		)
		if err != nil {
			return nil, err
		}
	}

	if spanEventCondition != "" {
		var err error
		spanEventBoolExpr, err = filter.NewBoolExprForSpanEvent(
			[]string{spanEventCondition},
			filter.StandardSpanEventFuncs(),
			errMode,
			settings,
		)
		if err != nil {
			return nil, err
		}
	}

	return &OTTLEvaluator{
		spanBoolExpr:      spanBoolExpr,
		spanEventBoolExpr: spanEventBoolExpr,
	}, nil
}

// Evaluate processes the loaded trace data against the OTTL conditions
func (e *OTTLEvaluator) Evaluate(ctx context.Context, traces ptrace.Traces) (SamplingDecision, error) {
	for i := 0; i < traces.ResourceSpans().Len(); i++ {
		rs := traces.ResourceSpans().At(i)
		resource := rs.Resource()

		for j := 0; j < rs.ScopeSpans().Len(); j++ {
			ss := rs.ScopeSpans().At(j)
			scope := ss.Scope()

			for k := 0; k < ss.Spans().Len(); k++ {
				span := ss.Spans().At(k)

				// Evaluate span condition
				if e.spanBoolExpr != nil {
					match, err := e.evaluateSpan(ctx, span, scope, resource, ss, rs)
					if err != nil {
						return NotSampled, err
					}
					if match {
						return Sampled, nil
					}
				}

				// Evaluate span events
				if e.spanEventBoolExpr != nil {
					match, err := e.evaluateSpanEvents(ctx, span, scope, resource, ss, rs)
					if err != nil {
						return NotSampled, err
					}
					if match {
						return Sampled, nil
					}
				}
			}
		}
	}

	return NotSampled, nil
}

// evaluateSpan checks if a single span matches the span condition
func (e *OTTLEvaluator) evaluateSpan(
	ctx context.Context,
	span ptrace.Span,
	scope pcommon.InstrumentationScope,
	resource pcommon.Resource,
	ss ptrace.ScopeSpans,
	rs ptrace.ResourceSpans,
) (bool, error) {
	spanCtx := ottlspan.NewTransformContext(span, scope, resource, ss, rs)
	return e.spanBoolExpr.Eval(ctx, spanCtx)
}

// evaluateSpanEvents checks if any event in a span matches the span event condition
func (e *OTTLEvaluator) evaluateSpanEvents(
	ctx context.Context,
	span ptrace.Span,
	scope pcommon.InstrumentationScope,
	resource pcommon.Resource,
	ss ptrace.ScopeSpans,
	rs ptrace.ResourceSpans,
) (bool, error) {
	spanEvents := span.Events()
	for l := 0; l < spanEvents.Len(); l++ {
		event := spanEvents.At(l)
		eventCtx := ottlspanevent.NewTransformContext(event, span, scope, resource, ss, rs)

		match, err := e.spanEventBoolExpr.Eval(ctx, eventCtx)
		if err != nil {
			return false, err
		}
		if match {
			return true, nil
		}
	}

	return false, nil
}
