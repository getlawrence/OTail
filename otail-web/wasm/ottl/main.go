package main

import (
	"context"
	"errors"
	"syscall/js"

	"github.com/mottibec/otail/wasm/ottl/filter"
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

// Result represents the outcome of an evaluation operation
type Result struct {
	Decision SamplingDecision
	Error    error
}

// NewResult creates a new result object suitable for returning to JavaScript
func NewResult(decision SamplingDecision, err error) js.Value {
	errStr := ""
	if err != nil {
		errStr = err.Error()
	}

	return js.ValueOf(map[string]interface{}{
		"decision": string(decision),
		"error":    errStr,
	})
}

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

	spanBoolExpr, err := filter.NewBoolExprForSpan(
		[]string{spanCondition},
		filter.StandardSpanFuncs(),
		errMode,
		settings,
	)
	if err != nil {
		return nil, err
	}

	spanEventBoolExpr, err := filter.NewBoolExprForSpanEvent(
		[]string{spanEventCondition},
		filter.StandardSpanEventFuncs(),
		errMode,
		settings,
	)
	if err != nil {
		return nil, err
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
				match, err := e.evaluateSpan(ctx, span, scope, resource, ss, rs)
				if err != nil {
					return NotSampled, err
				}
				if match {
					return Sampled, nil
				}

				// Evaluate span events
				match, err = e.evaluateSpanEvents(ctx, span, scope, resource, ss, rs)
				if err != nil {
					return NotSampled, err
				}
				if match {
					return Sampled, nil
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

func parseTraceData(jsonData string) (ptrace.Traces, error) {
	tracesUnmarshaler := &ptrace.JSONUnmarshaler{}
	return tracesUnmarshaler.UnmarshalTraces([]byte(jsonData))
}

// createJSEvaluateFunction creates the JavaScript callable function
func createJSEvaluateFunction() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// Validate arguments
		if len(args) < 4 {
			return NewResult("", errors.New("invalid number of arguments"))
		}

		// Extract parameters
		otelData := args[0].String()
		spanCondition := args[1].String()
		spanEventCondition := args[2].String()
		errMode := ottl.ErrorMode(args[3].String())

		zapLogger := zap.NewExample()

		// Create evaluator
		evaluator, err := NewOTTLEvaluator(spanCondition, spanEventCondition, errMode, zapLogger)
		if err != nil {
			return NewResult("", err)
		}

		// Load trace data
		traces, err := parseTraceData(otelData)
		if err != nil {
			return NewResult("", err)
		}

		// Run evaluation
		decision, err := evaluator.Evaluate(context.Background(), traces)
		return NewResult(decision, err)
	})
}

func main() {
	// Register the JavaScript function
	js.Global().Set("evaluateOTTL", createJSEvaluateFunction())

	// Keep the program running
	<-make(chan struct{})
}
