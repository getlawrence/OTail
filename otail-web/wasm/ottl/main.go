package main

import (
	"context"
	"errors"
	"syscall/js"

	"github.com/mottibec/otail/wasm/ottl/evaluator"
	"github.com/open-telemetry/opentelemetry-collector-contrib/pkg/ottl"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.uber.org/zap"
)

// Result represents the outcome of an evaluation operation
type Result struct {
	Decision evaluator.SamplingDecision
	Error    error
}

// NewResult creates a new result object suitable for returning to JavaScript
func NewResult(decision evaluator.SamplingDecision, err error) js.Value {
	errStr := ""
	if err != nil {
		errStr = err.Error()
	}

	return js.ValueOf(map[string]interface{}{
		"decision": string(decision),
		"error":    errStr,
	})
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
		evaluator, err := evaluator.NewOTTLEvaluator(spanCondition, spanEventCondition, errMode, zapLogger)
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
