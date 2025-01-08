package user

import "errors"

var (
	// ErrUserNotFound is returned when a user cannot be found in the store
	ErrUserNotFound = errors.New("user not found")

	// ErrInvalidToken is returned when the provided API token is invalid
	ErrInvalidToken = errors.New("invalid API token")

	// ErrUserExists is returned when trying to create a user with an email that already exists
	ErrUserExists = errors.New("user already exists")

	// ErrInvalidCredentials is returned when the provided email/password combination is invalid
	ErrInvalidCredentials = errors.New("invalid credentials")

	// ErrInvalidInput is returned when the provided input is invalid
	ErrInvalidInput = errors.New("invalid input")
)
