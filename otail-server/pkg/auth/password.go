package auth

import "golang.org/x/crypto/bcrypt"

// HashPassword creates a bcrypt hash from a password string
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash compares a password against a hash to see if they match
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// ValidatePassword is a helper function that checks if a password matches a hash
func ValidatePassword(hash, password string) bool {
	return CheckPasswordHash(password, hash)
}
