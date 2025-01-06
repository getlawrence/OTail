package auth

import (
	"testing"
)

func TestGenerateAPIToken(t *testing.T) {
	token1, err := GenerateAPIToken()
	if err != nil {
		t.Fatalf("GenerateAPIToken() error = %v", err)
	}
	if token1 == "" {
		t.Error("GenerateAPIToken() returned empty token")
	}

	token2, err := GenerateAPIToken()
	if err != nil {
		t.Fatalf("GenerateAPIToken() error = %v", err)
	}
	if token2 == "" {
		t.Error("GenerateAPIToken() returned empty token")
	}

	if token1 == token2 {
		t.Error("GenerateAPIToken() returned same token twice")
	}
}

func TestHashPassword(t *testing.T) {
	password := "testpassword123"
	hash1, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}
	if len(hash1) == 0 {
		t.Error("HashPassword() returned empty hash")
	}

	// Test that same password generates different hashes
	hash2, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}
	if string(hash1) == string(hash2) {
		t.Error("HashPassword() returned same hash for same password")
	}
}

func TestValidatePassword(t *testing.T) {
	password := "testpassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
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
		{
			name:     "empty password",
			password: "",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ValidatePassword(hash, tt.password); got != tt.want {
				t.Errorf("ValidatePassword() = %v, want %v", got, tt.want)
			}
		})
	}
}
