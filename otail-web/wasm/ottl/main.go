//go:build js && wasm

package main

import (
	"errors"
	"syscall/js"
)

const (
	Sampled    = "Sampled"
	NotSampled = "NotSampled"
)

func NewReturnType(value any, err error) js.Value {
	return js.ValueOf(map[string]any{
		"decision": value,
		"logs":     "",
		"error":    err,
	})
}

func jsEvaluate() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 4 {
			return NewReturnType("", errors.New("invalid number of arguments"))
		}
		return NewReturnType(Sampled, nil)
	})
}

func main() {
	js.Global().Set("evaluateOTTL", jsEvaluate())
	<-make(chan struct{})
}
