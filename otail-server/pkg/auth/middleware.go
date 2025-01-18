package auth

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey         contextKey = "userID"
	OrganizationIDKey contextKey = "organizationID"
	EmailKey          contextKey = "email"
)

var jwtSecret = []byte("your-secret-key") // TODO: Move to configuration

func AuthMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header is required", http.StatusUnauthorized)
				return
			}

			// Extract the token from the Authorization header
			// Format: "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			token := parts[1]
			claims, err := validateJWT(token)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// Add claims to the request context
			ctx := context.WithValue(r.Context(), OrganizationIDKey, claims["organization_id"])
			ctx = context.WithValue(ctx, EmailKey, claims["email"])
			ctx = context.WithValue(ctx, UserIDKey, claims["user_id"])

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func validateJWT(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token claims")
}

func GenerateJWT(userId string, email string, organizationId string) (string, error) {
	expiresAt := time.Now().Add(24 * time.Hour) // Token expires in 24 hours

	// Create JWT token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":         userId,
		"organization_id": organizationId,
		"email":           email,
		"exp":             expiresAt.Unix(),
		"iat":             time.Now().Unix(),
	})

	// Sign token with secret key
	return token.SignedString(jwtSecret)
}
