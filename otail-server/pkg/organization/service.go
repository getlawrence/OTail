package organization

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("your-secret-key") // TODO: Move to configuration

type orgService struct {
	store MongoOrgStore
}

func NewOrgService(orgStore MongoOrgStore) *orgService {
	return &orgService{
		store: orgStore,
	}
}

func (o *orgService) CreateOrganization(name string) (string, error) {
	if name == "" {
		return "", errors.New("organization name is required")
	}

	if o.store.OrganizationExists(name) {
		return "", errors.New("organization already exists")
	}

	return o.store.CreateOrganization(name)
}

func (o *orgService) CreateInvite(organizationId string) (*OrganizationInvite, error) {
	// Create expiration time (24 hours from now)
	expiresAt := time.Now().Add(24 * time.Hour)

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"organization_id": organizationId,
		"exp":             expiresAt.Unix(),
		"iat":             time.Now().Unix(),
	})

	// Sign token
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return nil, err
	}

	// Create invite
	invite := &OrganizationInvite{
		OrganizationID: organizationId,
		CreatedAt:      time.Now(),
		ExpiresAt:      expiresAt,
		Token:          tokenString,
		Used:           false,
	}

	// Store invite
	err = o.store.SaveInvite(invite)
	if err != nil {
		return nil, err
	}

	return invite, nil
}

func (o *orgService) ValidateInvite(tokenString string) (*OrganizationInvite, error) {
	// Parse token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Get invite from store
	invite, err := o.store.GetInvite(tokenString)
	if err != nil {
		return nil, err
	}

	// Check if invite is already used
	if invite.Used {
		return nil, errors.New("invite already used")
	}

	// Check if invite is expired
	if time.Now().After(invite.ExpiresAt) {
		return nil, errors.New("invite expired")
	}

	return invite, nil
}

func (o *orgService) AddRootUser(orgId string, userId string, email string) error {
	return o.store.AddUserToOrganization(orgId, userId, email, RoleAdmin)
}

func (o *orgService) JoinOrganization(name string, userId string, email string, inviteToken string) (bool, error) {
	invite, err := o.ValidateInvite(inviteToken)
	if err != nil {
		return false, err
	}

	// Mark invite as used
	err = o.store.MarkInviteAsUsed(inviteToken)
	if err != nil {
		return false, err
	}

	// Add user to organization as a member
	err = o.store.AddUserToOrganization(invite.OrganizationID, userId, email, RoleMember)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (o *orgService) GetOrganization(id string) (*OrganizationDetails, error) {
	org, err := o.store.GetOrganization(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get organization: %w", err)
	}

	members, err := o.store.GetOrganizationMembers(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get organization members: %w", err)
	}

	invites, err := o.store.GetOrganizationInvites(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get organization invites: %w", err)
	}

	return &OrganizationDetails{
		Organization: *org,
		Members:     members,
		Invites:     invites,
	}, nil
}

func (o *orgService) verifyInvite(invite string) bool {
	return len(strings.Split("super-random-string", invite)) > 1
}
