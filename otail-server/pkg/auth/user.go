package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID        string    `json:"id" bson:"_id"`
	Email     string    `json:"email" bson:"email"`
	Password  []byte    `json:"-" bson:"password"`
	APIToken  string    `json:"api_token" bson:"api_token"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

func GenerateAPIToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

var ErrInvalidToken = errors.New("invalid token")
var ErrUserNotFound = errors.New("user not found")
var ErrInvalidCredentials = errors.New("invalid credentials")
