package telemetry

import (
	"context"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

type Metrics struct {
	organizationCreated    metric.Int64Counter
	organizationInvites    metric.Int64Counter
	organizationJoins      metric.Int64Counter
	apiTokensCreated       metric.Int64Counter
	activeOrganizations    metric.Int64UpDownCounter
	membersPerOrganization metric.Int64Histogram
	operationDuration      metric.Float64Histogram
}

var globalMetrics *Metrics

func InitMetrics(ctx context.Context) (*Metrics, error) {
	meter := otel.GetMeterProvider().Meter("github.com/getlawrence/otail-server")

	organizationCreated, err := meter.Int64Counter(
		"organization.created_total",
		metric.WithDescription("Total number of organizations created"),
	)
	if err != nil {
		return nil, err
	}

	organizationInvites, err := meter.Int64Counter(
		"organization.invites_total",
		metric.WithDescription("Total number of organization invites sent"),
	)
	if err != nil {
		return nil, err
	}

	organizationJoins, err := meter.Int64Counter(
		"organization.joins_total",
		metric.WithDescription("Total number of users joining organizations"),
	)
	if err != nil {
		return nil, err
	}

	apiTokensCreated, err := meter.Int64Counter(
		"organization.api_tokens_total",
		metric.WithDescription("Total number of API tokens created"),
	)
	if err != nil {
		return nil, err
	}

	activeOrganizations, err := meter.Int64UpDownCounter(
		"organization.active_total",
		metric.WithDescription("Total number of active organizations"),
	)
	if err != nil {
		return nil, err
	}

	membersPerOrganization, err := meter.Int64Histogram(
		"organization.members",
		metric.WithDescription("Distribution of members per organization"),
	)
	if err != nil {
		return nil, err
	}

	operationDuration, err := meter.Float64Histogram(
		"operation.duration_seconds",
		metric.WithDescription("Duration of operations in seconds"),
		metric.WithUnit("s"),
	)
	if err != nil {
		return nil, err
	}

	globalMetrics = &Metrics{
		organizationCreated:    organizationCreated,
		organizationInvites:    organizationInvites,
		organizationJoins:      organizationJoins,
		apiTokensCreated:       apiTokensCreated,
		activeOrganizations:    activeOrganizations,
		membersPerOrganization: membersPerOrganization,
		operationDuration:      operationDuration,
	}

	return globalMetrics, nil
}

// GetMetrics returns the global metrics instance
func GetMetrics() *Metrics {
	return globalMetrics
}

// RecordOrganizationCreated records a new organization creation
func (m *Metrics) RecordOrganizationCreated(ctx context.Context, attributes ...metric.AddOption) {
	m.organizationCreated.Add(ctx, 1, attributes...)
	m.activeOrganizations.Add(ctx, 1, attributes...)
}

// RecordOrganizationInvite records a new organization invite
func (m *Metrics) RecordOrganizationInvite(ctx context.Context, attributes ...metric.AddOption) {
	m.organizationInvites.Add(ctx, 1, attributes...)
}

// RecordOrganizationJoin records a new member joining an organization
func (m *Metrics) RecordOrganizationJoin(ctx context.Context, attributes ...metric.AddOption) {
	m.organizationJoins.Add(ctx, 1, attributes...)
}

// RecordAPITokenCreated records a new API token creation
func (m *Metrics) RecordAPITokenCreated(ctx context.Context, attributes ...metric.AddOption) {
	m.apiTokensCreated.Add(ctx, 1, attributes...)
}

// RecordMembersCount records the current number of members in an organization
func (m *Metrics) RecordMembersCount(ctx context.Context, count int64, attributes ...metric.RecordOption) {
	m.membersPerOrganization.Record(ctx, count, attributes...)
}

// RecordOperationDuration records the duration of an operation
func (m *Metrics) RecordOperationDuration(ctx context.Context, duration float64, attributes ...metric.RecordOption) {
	m.operationDuration.Record(ctx, duration, attributes...)
}
