package organization

import "errors"

var (
	ErrOrganizationNotFound     = errors.New("organization not found")
	ErrOrganizationNameRequired = errors.New("organization name is required")
	ErrOrganizationExists       = errors.New("organization already exists")
	ErrUnexpectedSigningMethod  = errors.New("unexpected signing method")
	ErrInvalidToken             = errors.New("invalid token")
	ErrInvalidTokenClaims       = errors.New("invalid token claims")
	ErrInvalidEmailInToken      = errors.New("invalid email in token")
	ErrInviteAlreadyUsed        = errors.New("invite already used")
	ErrEmailDoesNotMatchInvite  = errors.New("email does not match invite")
	ErrInviteNotFound           = errors.New("invite not found")
)
