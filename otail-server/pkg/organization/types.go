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

type OrganizationDetails struct {
	Organization
	Members []OrganizationMember `json:"members"`
	Invites []OrganizationInvite `json:"invites"`
}

type OrgService interface {
	CreateOrganization(name string) (string, error)
	GetOrganization(id string) (*OrganizationDetails, error)
	JoinOrganization(name string, userId string, email string, invite string) (bool, error)
	CreateInvite(organizationId string) (*OrganizationInvite, error)
	ValidateInvite(token string) (*OrganizationInvite, error)
	AddRootUser(orgId string, userId string, email string) error
}
