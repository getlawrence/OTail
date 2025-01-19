package organization

import (
	"context"
	"time"
)

const (
	RoleAdmin  = "admin"
	RoleMember = "member"
)

type Organization struct {
	ID        string    `json:"id" bson:"_id"`
	Name      string    `json:"name" bson:"name"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

type OrganizationInvite struct {
	OrganizationID string    `json:"organization_id" bson:"organization_id"`
	Email          string    `json:"email" bson:"email"`
	CreatedAt      time.Time `json:"created_at" bson:"created_at"`
	ExpiresAt      time.Time `json:"expires_at" bson:"expires_at"`
	Token          string    `json:"token" bson:"token"`
	Used           bool      `json:"used" bson:"used"`
}

type OrganizationMember struct {
	UserID   string    `json:"user_id" bson:"user_id"`
	Email    string    `json:"email" bson:"email"`
	JoinedAt time.Time `json:"joined_at" bson:"joined_at"`
	Role     string    `json:"role" bson:"role"`
}

type APIToken struct {
	ID             string    `json:"id" bson:"_id"`
	OrganizationID string    `json:"organization_id" bson:"organization_id"`
	Token          string    `json:"token" bson:"token"`
	CreatedAt      time.Time `json:"created_at" bson:"created_at"`
	CreatedBy      string    `json:"created_by" bson:"created_by"`
	Description    string    `json:"description" bson:"description"`
}

type OrganizationDetails struct {
	Organization
	Members   []OrganizationMember `json:"members"`
	Invites   []OrganizationInvite `json:"invites"`
	APITokens []APIToken           `json:"tokens"`
}

type OrgService interface {
	CreateOrganization(ctx context.Context, name string) (string, error)
	GetOrganization(ctx context.Context, id string) (*OrganizationDetails, error)
	JoinOrganization(ctx context.Context, name string, userId string, email string, invite string) (bool, error)
	CreateInvite(ctx context.Context, organizationId string, email string) (*OrganizationInvite, error)
	ValidateInvite(ctx context.Context, token string) (*OrganizationInvite, error)
	AddRootUser(ctx context.Context, orgId string, userId string, email string) error
	CreateAPIToken(ctx context.Context, orgId string, userId string, description string) (*APIToken, error)
	ValidateAPIToken(ctx context.Context, token string) (*APIToken, error)
	DeleteAPIToken(ctx context.Context, orgId string, tokenId string) error
}

type OrgStore interface {
	CreateOrganization(ctx context.Context, name string) (string, error)
	OrganizationExists(ctx context.Context, name string) bool
	GetOrganization(ctx context.Context, id string) (*Organization, error)
	GetOrganizationMembers(ctx context.Context, id string) ([]OrganizationMember, error)
	GetOrganizationInvites(ctx context.Context, id string) ([]OrganizationInvite, error)
	SaveInvite(ctx context.Context, invite *OrganizationInvite) error
	GetInvite(ctx context.Context, token string) (*OrganizationInvite, error)
	MarkInviteAsUsed(ctx context.Context, token string) error
	AddUserToOrganization(ctx context.Context, organizationId string, userId string, email string, role string) error
	CreateAPIToken(ctx context.Context, token *APIToken) error
	GetAPITokenByToken(ctx context.Context, token string) (*APIToken, error)
	GetAPITokens(ctx context.Context, orgId string) ([]APIToken, error)
	DeleteAPIToken(ctx context.Context, orgId string, tokenId string) error
	Close(ctx context.Context) error
}
