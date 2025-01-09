package supervisor

import (
	"context"
	"io"
	"sync"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	globallog "go.opentelemetry.io/otel/log"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	"go.uber.org/zap"
)

type LoggerConfig struct {
	Endpoint      string
	Insecure      bool
	resourceAttrs map[string]string
}

type OwnLogger struct {
	logger     *zap.Logger
	buffer     [][]byte
	mu         sync.Mutex
	configured bool
}

func NewOwnLogger(logger *zap.Logger) *OwnLogger {
	logger.Info("Creating own logger")
	return &OwnLogger{
		logger: logger,
		buffer: make([][]byte, 0),
	}
}

func (ol *OwnLogger) Configure(ctx context.Context, cfg LoggerConfig) error {
	ol.logger.Info("Configuring own logger", zap.String("endpoint", cfg.Endpoint), zap.Bool("insecure", cfg.Insecure))
	provider, err := ol.newLoggerProvider(ctx, cfg)
	if err != nil {
		return err
	}
	global.SetLoggerProvider(provider)

	ol.mu.Lock()
	defer ol.mu.Unlock()

	// Process any buffered messages
	for _, msg := range ol.buffer {
		SendLog(ctx, string(msg))
	}
	ol.buffer = nil
	ol.configured = true

	return nil
}

func (ol *OwnLogger) newLoggerProvider(ctx context.Context, cfg LoggerConfig) (*log.LoggerProvider, error) {
	opts := []otlploggrpc.Option{
		otlploggrpc.WithEndpoint(cfg.Endpoint),
	}
	if cfg.Insecure {
		opts = append(opts, otlploggrpc.WithInsecure())
	}

	logExporter, err := otlploggrpc.New(ctx, opts...)
	if err != nil {
		return nil, err
	}

	attributeKeys := make([]attribute.KeyValue, 0, len(cfg.resourceAttrs))
	for k, v := range cfg.resourceAttrs {
		attributeKeys = append(attributeKeys, attribute.String(k, v))
	}

	loggerProvider := log.NewLoggerProvider(log.WithResource(resource.NewWithAttributes(
		semconv.SchemaURL,
		attributeKeys...)), log.WithProcessor(log.NewBatchProcessor(logExporter)))
	return loggerProvider, nil
}

func (ol *OwnLogger) Write(p []byte) (n int, err error) {
	ol.mu.Lock()
	defer ol.mu.Unlock()

	if !ol.configured {
		// Buffer the message if logger is not configured
		ol.buffer = append(ol.buffer, append([]byte(nil), p...))
		return len(p), nil
	}

	SendLog(context.Background(), string(p))
	return len(p), nil
}

func SendLog(ctx context.Context, message string) {
	provider := global.GetLoggerProvider()
	logger := provider.Logger("supervisor")
	var record globallog.Record
	record.SetBody(globallog.StringValue(message))
	logger.Emit(ctx, record)
}

// Ensure OwnLogger implements io.Writer
var _ io.Writer = (*OwnLogger)(nil)
