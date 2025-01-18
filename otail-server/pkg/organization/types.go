package organization

import "time"

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
	CreateOrganization(name string) (string, error)
	GetOrganization(id string) (*OrganizationDetails, error)
	JoinOrganization(name string, userId string, email string, invite string) (bool, error)
	CreateInvite(organizationId string, email string) (*OrganizationInvite, error)
	ValidateInvite(token string) (*OrganizationInvite, error)
	AddRootUser(orgId string, userId string, email string) error
	CreateAPIToken(orgId string, userId string, description string) (*APIToken, error)
	ValidateAPIToken(token string) (*APIToken, error)
	DeleteAPIToken(orgId string, tokenId string) error
}

type OrgStore interface {
	CreateOrganization(name string) (string, error)
	OrganizationExists(name string) bool
	GetOrganization(id string) (*Organization, error)
	GetOrganizationMembers(id string) ([]OrganizationMember, error)
	GetOrganizationInvites(id string) ([]OrganizationInvite, error)
	SaveInvite(invite *OrganizationInvite) error
	GetInvite(token string) (*OrganizationInvite, error)
	MarkInviteAsUsed(token string) error
	AddUserToOrganization(organizationId string, userId string, email string, role string) error
	CreateAPIToken(token *APIToken) error
	GetAPITokenByToken(token string) (*APIToken, error)
	GetAPITokens(orgId string) ([]APIToken, error)
	DeleteAPIToken(orgId string, tokenId string) error
	Close() error
}
