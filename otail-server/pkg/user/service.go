package user

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/mottibec/otail-server/pkg/auth"
	"github.com/mottibec/otail-server/pkg/organization"
)

type UserService struct {
	store  UserStore
	orgSvc organization.OrgService
}

func NewUserService(store UserStore, orgService organization.OrgService) UserService {
	return UserService{
		store:  store,
		orgSvc: orgService,
	}
}

func (s *UserService) RegisterUser(email, password, organization string, inviteToken string) (*User, error) {
	if email == "" || password == "" {
		return nil, errors.New("email and password are required")
	}

	var orgId string
	var err error

	if inviteToken != "" {
		// Join existing organization using invite
		invite, err := s.orgSvc.ValidateInvite(inviteToken)
		if err != nil {
			return nil, errors.New("invalid invite: " + err.Error())
		}
		orgId = invite.OrganizationID
		// Create user first
		user, err := s.CreateUser(email, password, orgId)
		if err != nil {
			return nil, err
		}
		// Then join organization
		success, err := s.orgSvc.JoinOrganization("", user.ID, email, inviteToken)
		if err != nil || !success {
			return nil, errors.New("failed to join organization: " + err.Error())
		}
		return user, nil
	} else {
		// Create new organization
		if organization == "" {
			return nil, errors.New("organization name is required")
		}
		var err error
		orgId, err = s.orgSvc.CreateOrganization(organization)
		if err != nil {
			return nil, errors.New("failed to create organization: " + err.Error())
		}
	}

	// Create user
	user, err := s.CreateUser(email, password, orgId)
	if err != nil {
		return nil, err
	}

	// If this is a new organization, add the user as root admin
	if inviteToken == "" {
		err = s.orgSvc.AddRootUser(orgId, user.ID, email)
		if err != nil {
			return nil, errors.New("failed to add root user to organization: " + err.Error())
		}
	}

	return user, nil
}

func (s *UserService) CreateUser(email, password, orgId string) (*User, error) {
	// Check if user exists
	existingUser, err := s.GetUserByEmail(email)
	if err == nil && existingUser != nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// Create user object
	user := &User{
		ID:             uuid.New().String(),
		Email:          email,
		Password:       []byte(hashedPassword),
		OrganizationID: orgId,
		CreatedAt:      time.Now(),
	}

	// Store user
	return s.store.CreateUser(user)
}

func (s *UserService) AuthenticateUser(email, password string) (*User, error) {
	if email == "" || password == "" {
		return nil, errors.New("email and password are required")
	}

	user, err := s.store.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}

	if !auth.ValidatePassword(string(user.Password), password) {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

func (s *UserService) GetUserByEmail(email string) (*User, error) {
	return s.store.GetUserByEmail(email)
}

func (s *UserService) ValidatePassword(user *User, password string) bool {
	return auth.ValidatePassword(string(user.Password), password)
}

func (s *UserService) ValidateAPIToken(token string) (*organization.APIToken, error) {
	return s.orgSvc.ValidateAPIToken(token)
}
