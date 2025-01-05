package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  []byte    `json:"-"`
	APIToken  string    `json:"api_token"`
	CreatedAt time.Time `json:"created_at"`
}

type UserStore interface {
	CreateUser(email, password string) (*User, error)
	GetUserByEmail(email string) (*User, error)
	GetUserByToken(token string) (*User, error)
	ValidatePassword(user *User, password string) bool
}

func GenerateAPIToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func HashPassword(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}

func ValidatePassword(hashedPassword []byte, password string) bool {
	err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
	return err == nil
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

var ErrInvalidToken = errors.New("invalid token")
var ErrUserNotFound = errors.New("user not found")
var ErrInvalidCredentials = errors.New("invalid credentials")
