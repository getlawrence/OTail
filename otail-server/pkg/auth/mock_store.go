package auth

import (
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
)

// MockUserStore provides an in-memory implementation of UserStore for testing
type MockUserStore struct {
	users  map[string]*User // email -> user
	tokens map[string]*User // token -> user
	mu     sync.RWMutex
}

// NewMockUserStore creates a new MockUserStore
func NewMockUserStore() *MockUserStore {
	return &MockUserStore{
		users:  make(map[string]*User),
		tokens: make(map[string]*User),
	}
}

func (s *MockUserStore) CreateUser(email, password string) (*User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.users[email]; exists {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := HashPassword(password)
	if err != nil {
		return nil, err
	}

	apiToken, err := GenerateAPIToken()
	if err != nil {
		return nil, err
	}

	user := &User{
		ID:        uuid.New().String(),
		Email:     email,
		Password:  []byte(hashedPassword),
		APIToken:  apiToken,
		CreatedAt: time.Now(),
	}

	s.users[email] = user
	s.tokens[apiToken] = user

	return user, nil
}

func (s *MockUserStore) GetUserByEmail(email string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.users[email]
	if !exists {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *MockUserStore) GetUserByToken(token string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.tokens[token]
	if !exists {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *MockUserStore) ValidatePassword(user *User, password string) bool {
	return CheckPasswordHash(password, string(user.Password))
}

func (s *MockUserStore) Close() error {
	return nil
}
