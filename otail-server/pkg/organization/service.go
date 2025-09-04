package organization

import (
	"context"
	"fmt"
	"time"

	"github.com/getlawrence/otail-server/pkg/auth"
	"github.com/getlawrence/otail-server/pkg/telemetry"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
)

var (
	jwtSecret = []byte("your-secret-key") // TODO: Move to configuration
	tracer    = otel.Tracer("github.com/getlawrence/otail-server/pkg/organization")
)

type orgService struct {
	store OrgStore
}

func NewOrgService(orgStore OrgStore) *orgService {
	return &orgService{
		store: orgStore,
	}
}

func (o *orgService) CreateOrganization(ctx context.Context, name string) (string, error) {
	start := time.Now()
	ctx, span := tracer.Start(ctx, "CreateOrganization")
	defer span.End()
	span.SetAttributes(attribute.String("organization.name", name))

	if name == "" {
		span.RecordError(ErrOrganizationNameRequired)
		span.SetStatus(codes.Error, "organization name required")
		return "", ErrOrganizationNameRequired
	}

	exists := o.store.OrganizationExists(ctx, name)
	if exists {
		span.RecordError(ErrOrganizationExists)
		span.SetStatus(codes.Error, "organization already exists")
		return "", ErrOrganizationExists
	}

	id, err := o.store.CreateOrganization(ctx, name)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to create organization")
		return "", err
	}

	// Record metrics
	metrics := telemetry.GetMetrics()
	metrics.RecordOrganizationCreated(ctx, metric.WithAttributes(
		attribute.String("organization.id", id),
		attribute.String("organization.name", name),
	))
	metrics.RecordOperationDuration(ctx, time.Since(start).Seconds(), metric.WithAttributes(
		attribute.String("operation", "CreateOrganization"),
	))

	span.SetAttributes(attribute.String("organization.id", id))
	return id, nil
}

func (o *orgService) CreateInvite(ctx context.Context, organizationId string, email string) (*OrganizationInvite, error) {
	start := time.Now()
	ctx, span := tracer.Start(ctx, "CreateInvite")
	defer span.End()
	span.SetAttributes(attribute.String("organization.id", organizationId), attribute.String("email", email))

	// Create expiration time (24 hours from now)
	expiresAt := time.Now().Add(24 * time.Hour)

	// Create JWT token with email claim
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"organization_id": organizationId,
		"email":           email,
		"exp":             expiresAt.Unix(),
		"iat":             time.Now().Unix(),
	})

	// Sign token
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to sign token")
		return nil, err
	}

	// Create invite
	invite := &OrganizationInvite{
		OrganizationID: organizationId,
		Email:          email,
		CreatedAt:      time.Now(),
		ExpiresAt:      expiresAt,
		Token:          tokenString,
		Used:           false,
	}

	// Store invite
	err = o.store.SaveInvite(ctx, invite)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to save invite")
		return nil, err
	}

	// Record metrics
	metrics := telemetry.GetMetrics()
	metrics.RecordOrganizationInvite(ctx, metric.WithAttributes(
		attribute.String("organization.id", organizationId),
	))
	metrics.RecordOperationDuration(ctx, time.Since(start).Seconds(), metric.WithAttributes(
		attribute.String("operation", "CreateInvite"),
	))

	return invite, nil
}

func (o *orgService) ValidateInvite(ctx context.Context, tokenString string) (*OrganizationInvite, error) {
	ctx, span := tracer.Start(ctx, "ValidateInvite")
	defer span.End()
	span.SetAttributes(attribute.String("token", tokenString))

	// Parse token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrUnexpectedSigningMethod
		}
		return jwtSecret, nil
	})

	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to parse token")
		return nil, err
	}

	if !token.Valid {
		span.RecordError(ErrInvalidToken)
		span.SetStatus(codes.Error, "invalid token")
		return nil, ErrInvalidToken
	}

	// Get claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		span.RecordError(ErrInvalidTokenClaims)
		span.SetStatus(codes.Error, "invalid token claims")
		return nil, ErrInvalidTokenClaims
	}

	// Get email from claims
	email, ok := claims["email"].(string)
	if !ok {
		span.RecordError(ErrInvalidEmailInToken)
		span.SetStatus(codes.Error, "invalid email in token")
		return nil, ErrInvalidEmailInToken
	}

	// Get invite from store
	invite, err := o.store.GetInvite(ctx, tokenString)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to get invite")
		return nil, err
	}

	// Check if invite is already used
	if invite.Used {
		span.RecordError(ErrInviteAlreadyUsed)
		span.SetStatus(codes.Error, "invite already used")
		return nil, ErrInviteAlreadyUsed
	}

	// Verify email matches
	if invite.Email != email {
		span.RecordError(ErrEmailDoesNotMatchInvite)
		span.SetStatus(codes.Error, "email does not match invite")
		return nil, ErrEmailDoesNotMatchInvite
	}

	return invite, nil
}

func (o *orgService) AddRootUser(ctx context.Context, orgId string, userId string, email string) error {
	ctx, span := tracer.Start(ctx, "AddRootUser")
	defer span.End()
	span.SetAttributes(attribute.String("organization.id", orgId), attribute.String("user.id", userId), attribute.String("email", email))

	return o.store.AddUserToOrganization(ctx, orgId, userId, email, RoleAdmin)
}

func (o *orgService) JoinOrganization(ctx context.Context, name string, userId string, email string, inviteToken string) (bool, error) {
	start := time.Now()
	ctx, span := tracer.Start(ctx, "JoinOrganization")
	defer span.End()
	span.SetAttributes(attribute.String("organization.name", name), attribute.String("user.id", userId), attribute.String("email", email), attribute.String("invite.token", inviteToken))

	// Validate invite and check email
	invite, err := o.ValidateInvite(ctx, inviteToken)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to validate invite")
		return false, err
	}

	// Verify email matches invite
	if invite.Email != email {
		span.RecordError(ErrEmailDoesNotMatchInvite)
		span.SetStatus(codes.Error, "email does not match invite")
		return false, ErrEmailDoesNotMatchInvite
	}

	// Add user to organization
	err = o.store.AddUserToOrganization(ctx, invite.OrganizationID, userId, email, RoleMember)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to add user to organization")
		return false, err
	}

	// Mark invite as used
	err = o.store.MarkInviteAsUsed(ctx, inviteToken)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to mark invite as used")
		return false, err
	}

	// Record metrics
	metrics := telemetry.GetMetrics()
	metrics.RecordOrganizationJoin(ctx, metric.WithAttributes(
		attribute.String("organization.id", invite.OrganizationID),
		attribute.String("user.id", userId),
	))
	metrics.RecordOperationDuration(ctx, time.Since(start).Seconds(), metric.WithAttributes(
		attribute.String("operation", "JoinOrganization"),
	))

	return true, nil
}

func (o *orgService) GetOrganization(ctx context.Context, id string) (*OrganizationDetails, error) {
	start := time.Now()
	ctx, span := tracer.Start(ctx, "GetOrganization")
	defer span.End()
	span.SetAttributes(attribute.String("organization.id", id))

	org, err := o.store.GetOrganization(ctx, id)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to get organization")
		return nil, fmt.Errorf("failed to get organization: %w", err)
	}

	members, err := o.store.GetOrganizationMembers(ctx, id)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to get organization members")
		return nil, fmt.Errorf("failed to get organization members: %w", err)
	}

	invites, err := o.store.GetOrganizationInvites(ctx, id)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to get organization invites")
		return nil, fmt.Errorf("failed to get organization invites: %w", err)
	}

	tokens, err := o.store.GetAPITokens(ctx, id)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to get organization api tokens")
		return nil, fmt.Errorf("failed to get organization api tokens: %w", err)
	}

	// Record metrics
	metrics := telemetry.GetMetrics()
	metrics.RecordMembersCount(ctx, int64(len(members)), metric.WithAttributes(
		attribute.String("organization.id", id),
	))
	metrics.RecordOperationDuration(ctx, time.Since(start).Seconds(), metric.WithAttributes(
		attribute.String("operation", "GetOrganization"),
	))

	return &OrganizationDetails{
		Organization: *org,
		Members:      members,
		Invites:      invites,
		APITokens:    tokens,
	}, nil
}

func (o *orgService) CreateAPIToken(ctx context.Context, orgId string, userId string, description string) (*APIToken, error) {
	start := time.Now()
	ctx, span := tracer.Start(ctx, "CreateAPIToken")
	defer span.End()
	span.SetAttributes(attribute.String("organization.id", orgId), attribute.String("user.id", userId), attribute.String("description", description))

	token, err := auth.GenerateAPIToken()
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to generate api token")
		return nil, err
	}

	apiToken := &APIToken{
		ID:             uuid.New().String(),
		OrganizationID: orgId,
		Token:          token,
		CreatedAt:      time.Now(),
		CreatedBy:      userId,
		Description:    description,
	}

	err = o.store.CreateAPIToken(ctx, apiToken)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to create api token")
		return nil, err
	}

	// Record metrics
	metrics := telemetry.GetMetrics()
	metrics.RecordAPITokenCreated(ctx, metric.WithAttributes(
		attribute.String("organization.id", orgId),
		attribute.String("user.id", userId),
	))
	metrics.RecordOperationDuration(ctx, time.Since(start).Seconds(), metric.WithAttributes(
		attribute.String("operation", "CreateAPIToken"),
	))

	return apiToken, nil
}

func (o *orgService) ValidateAPIToken(ctx context.Context, token string) (*APIToken, error) {
	ctx, span := tracer.Start(ctx, "ValidateAPIToken")
	defer span.End()
	span.SetAttributes(attribute.String("token", token))

	apiToken, err := o.store.GetAPITokenByToken(ctx, token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to validate token")
		return nil, err
	}

	// Mark that the organization has connected an agent
	err = o.store.MarkAgentConnected(ctx, apiToken.OrganizationID)
	if err != nil {
		// Log the error but don't fail the token validation
		span.RecordError(err)
	}

	return apiToken, nil
}

func (o *orgService) DeleteAPIToken(ctx context.Context, orgId string, tokenId string) error {
	ctx, span := tracer.Start(ctx, "DeleteAPIToken")
	defer span.End()
	span.SetAttributes(attribute.String("organization.id", orgId), attribute.String("token.id", tokenId))

	return o.store.DeleteAPIToken(ctx, orgId, tokenId)
}
