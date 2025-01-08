package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"

	"go.uber.org/zap"
)

type LogEntry struct {
	Timestamp          time.Time         `json:"timestamp"`
	TraceId            string            `json:"traceId"`
	SpanId             string            `json:"spanId"`
	TraceFlags         uint8             `json:"traceFlags"`
	SeverityText       string            `json:"severityText"`
	SeverityNumber     uint8             `json:"severityNumber"`
	ServiceName        string            `json:"serviceName"`
	InstanceId         string            `json:"instanceId"`
	Body               string            `json:"body"`
	ResourceSchemaUrl  string            `json:"resourceSchemaUrl"`
	ResourceAttributes map[string]string `json:"resourceAttributes,omitempty"`
	ScopeSchemaUrl     string            `json:"scopeSchemaUrl"`
	ScopeName          string            `json:"scopeName"`
	ScopeVersion       string            `json:"scopeVersion"`
	ScopeAttributes    map[string]string `json:"scopeAttributes,omitempty"`
	LogAttributes      map[string]string `json:"logAttributes,omitempty"`
}

type Client struct {
	ctx          context.Context
	cancelFunc   context.CancelFunc
	conn         driver.Conn
	databaseName string
	clusterName  string
	healthy      bool
	logger       *zap.Logger
}

func NewClient(dsn string, logger *zap.Logger) (*Client, error) {
	var (
		ctx       = context.Background()
		conn, err = clickhouse.Open(&clickhouse.Options{
			Addr: []string{"clickhouse:9000"},
			Auth: clickhouse.Auth{
				Database: "default",
				Username: "default",
				Password: "default",
			},
			Debugf: func(format string, v ...interface{}) {
				fmt.Printf(format, v)
			},
		})
	)

	if err != nil {
		return nil, err
	}

	if err := conn.Ping(ctx); err != nil {
		if exception, ok := err.(*clickhouse.Exception); ok {
			return nil, exception
		}
		return nil, err
	}
	c := &Client{
		ctx:          ctx,
		cancelFunc:   nil,
		conn:         conn,
		databaseName: "default",
		clusterName:  "default",
		healthy:      true,
		logger:       logger,
	}
	return c, nil
}

func (c *Client) QueryLogs(ctx context.Context, serviceInstanceID string, startTime, endTime time.Time, limit int) ([]LogEntry, error) {
	query := `
		SELECT
			Timestamp,
			TraceId,
			SpanId,
			TraceFlags,
			SeverityText,
			SeverityNumber,
			ServiceName,
			InstanceId,
			Body,
			ResourceSchemaUrl,
			ResourceAttributes,
			ScopeSchemaUrl,
			ScopeName,
			ScopeVersion,
			ScopeAttributes,
			LogAttributes
		FROM default.otel_logs
		WHERE InstanceId = ?
		ORDER BY Timestamp DESC
		LIMIT 1000`

	rows, err := c.conn.Query(ctx, query, serviceInstanceID)
	if err != nil {
		return nil, fmt.Errorf("failed to query logs: %w", err)
	}
	defer rows.Close()

	var logs []LogEntry
	for rows.Next() {
		var log LogEntry
		if err := rows.Scan(
			&log.Timestamp,
			&log.TraceId,
			&log.SpanId,
			&log.TraceFlags,
			&log.SeverityText,
			&log.SeverityNumber,
			&log.ServiceName,
			&log.InstanceId,
			&log.Body,
			&log.ResourceSchemaUrl,
			&log.ResourceAttributes,
			&log.ScopeSchemaUrl,
			&log.ScopeName,
			&log.ScopeVersion,
			&log.ScopeAttributes,
			&log.LogAttributes,
		); err != nil {
			return nil, fmt.Errorf("failed to scan log entry: %w", err)
		}
		logs = append(logs, log)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %w", err)
	}

	return logs, nil
}

func (c *Client) StreamLogs(ctx context.Context, serviceName string) (<-chan LogEntry, error) {
	logChan := make(chan LogEntry)

	query := `
		SELECT
			Timestamp,
			TraceId,
			SpanId,
			TraceFlags,
			SeverityText,
			SeverityNumber,
			ServiceName,
			InstanceId,
			Body,
			ResourceSchemaUrl,
			ResourceAttributes,
			ScopeSchemaUrl,
			ScopeName,
			ScopeVersion,
			ScopeAttributes,
			LogAttributes
		FROM default.otel_logs
		WHERE ServiceName = ?
		ORDER BY Timestamp DESC
		LIMIT 1000
	`

	go func() {
		defer close(logChan)

		rows, err := c.conn.Query(ctx, query, serviceName)
		if err != nil {
			c.logger.Error("failed to query logs for streaming", zap.Error(err))
			return
		}
		defer rows.Close()

		for rows.Next() {
			var log LogEntry
			if err := rows.Scan(
				&log.Timestamp,
				&log.TraceId,
				&log.SpanId,
				&log.TraceFlags,
				&log.SeverityText,
				&log.SeverityNumber,
				&log.ServiceName,
				&log.InstanceId,
				&log.Body,
				&log.ResourceSchemaUrl,
				&log.ResourceAttributes,
				&log.ScopeSchemaUrl,
				&log.ScopeName,
				&log.ScopeVersion,
				&log.ScopeAttributes,
				&log.LogAttributes,
			); err != nil {
				c.logger.Error("failed to scan log entry for streaming", zap.Error(err))
				return
			}

			select {
			case logChan <- log:
			case <-ctx.Done():
				return
			}
		}

		if err := rows.Err(); err != nil {
			c.logger.Error("error iterating over rows for streaming", zap.Error(err))
		}
	}()

	return logChan, nil
}

func (c *Client) Close() error {
	return c.conn.Close()
}
