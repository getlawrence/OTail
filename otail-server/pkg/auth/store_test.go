package auth

import (
	"testing"
)

func TestMongoUserStore_CreateUser(t *testing.T) {
	store := NewMockUserStore()
	tests := []struct {
		name        string
		email       string
		password    string
		wantErr     bool
		errContains string
	}{
		{
			name:     "valid user creation",
			email:    "test@example.com",
			password: "password123",
			wantErr:  false,
		},
		{
			name:        "duplicate user",
			email:       "test@example.com",
			password:    "password123",
			wantErr:     true,
			errContains: "user already exists",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := store.CreateUser(tt.email, tt.password)
			if tt.wantErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				if tt.errContains != "" && err.Error() != tt.errContains {
					t.Errorf("expected error containing %q, got %q", tt.errContains, err.Error())
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if user == nil {
				t.Fatal("expected user to not be nil")
			}
			if user.Email != tt.email {
				t.Errorf("expected email %q, got %q", tt.email, user.Email)
			}
			if user.APIToken == "" {
				t.Error("expected API token to be set")
			}
			if user.ID == "" {
				t.Error("expected ID to be set")
			}
			if user.CreatedAt.IsZero() {
				t.Error("expected CreatedAt to be set")
			}
		})
	}
}

func TestMongoUserStore_GetUserByEmail(t *testing.T) {
	store := NewMockUserStore()

	email := "test@example.com"
	password := "password123"

	// Create a user first
	createdUser, err := store.CreateUser(email, password)
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	tests := []struct {
		name        string
		email       string
		wantErr     bool
		errContains string
	}{
		{
			name:    "existing user",
			email:   email,
			wantErr: false,
		},
		{
			name:        "non-existent user",
			email:       "nonexistent@example.com",
			wantErr:     true,
			errContains: "user not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := store.GetUserByEmail(tt.email)
			if tt.wantErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				if tt.errContains != "" && err.Error() != tt.errContains {
					t.Errorf("expected error containing %q, got %q", tt.errContains, err.Error())
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if user == nil {
				t.Fatal("expected user to not be nil")
			}
			if user.ID != createdUser.ID {
				t.Errorf("expected user ID %q, got %q", createdUser.ID, user.ID)
			}
		})
	}
}

func TestMongoUserStore_GetUserByToken(t *testing.T) {
	store := NewMockUserStore()
	email := "test@example.com"
	password := "password123"

	// Create a user first
	createdUser, err := store.CreateUser(email, password)
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	tests := []struct {
		name        string
		token       string
		wantErr     bool
		errContains string
	}{
		{
			name:    "valid token",
			token:   createdUser.APIToken,
			wantErr: false,
		},
		{
			name:        "no user found",
			token:       "invalid_token",
			wantErr:     true,
			errContains: "user not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := store.GetUserByToken(tt.token)
			if tt.wantErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				if tt.errContains != "" && err.Error() != tt.errContains {
					t.Errorf("expected error containing %q, got %q", tt.errContains, err.Error())
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if user == nil {
				t.Fatal("expected user to not be nil")
			}
			if user.ID != createdUser.ID {
				t.Errorf("expected user ID %q, got %q", createdUser.ID, user.ID)
			}
		})
	}
}

func TestMongoUserStore_ValidatePassword(t *testing.T) {
	store := NewMockUserStore()

	email := "test@example.com"
	password := "password123"

	// Create a user first
	user, err := store.CreateUser(email, password)
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{
			name:     "correct password",
			password: password,
			want:     true,
		},
		{
			name:     "incorrect password",
			password: "wrongpassword",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := store.ValidatePassword(user, tt.password)
			if got != tt.want {
				t.Errorf("ValidatePassword() = %v, want %v", got, tt.want)
			}
		})
	}
}
