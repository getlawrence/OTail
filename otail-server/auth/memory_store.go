package auth

import (
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
)

type MemoryUserStore struct {
	mu     sync.RWMutex
	users  map[string]*User // email -> user
	tokens map[string]*User // token -> user
}

func NewMemoryUserStore() *MemoryUserStore {
	return &MemoryUserStore{
		users:  make(map[string]*User),
		tokens: make(map[string]*User),
	}
}

func (s *MemoryUserStore) CreateUser(email, password string) (*User, error) {
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
		Password:  hashedPassword,
		APIToken:  apiToken,
		CreatedAt: time.Now(),
	}

	s.users[email] = user
	s.tokens[apiToken] = user

	return user, nil
}

func (s *MemoryUserStore) GetUserByEmail(email string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.users[email]
	if !exists {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *MemoryUserStore) GetUserByToken(token string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.tokens[token]
	if !exists {
		return nil, ErrInvalidToken
	}
	return user, nil
}

func (s *MemoryUserStore) ValidatePassword(user *User, password string) bool {
	return ValidatePassword(user.Password, password)
}
