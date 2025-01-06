package auth

// UserStore defines the interface for user storage operations
type UserStore interface {
	CreateUser(email, password string) (*User, error)
	GetUserByEmail(email string) (*User, error)
	GetUserByToken(token string) (*User, error)
	ValidatePassword(user *User, password string) bool
	Close() error
}
