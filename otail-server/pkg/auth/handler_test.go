package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

func setupTestHandler() (*AuthHandler, *MockUserStore) {
	logger, _ := zap.NewDevelopment()
	store := NewMockUserStore()
	handler := NewAuthHandler(store, logger)
	return handler, store
}

func TestAuthHandler_Register(t *testing.T) {
	handler, _ := setupTestHandler()
	router := chi.NewRouter()
	handler.RegisterRoutes(router)

	tests := []struct {
		name           string
		requestBody    RegisterRequest
		wantStatusCode int
	}{
		{
			name: "valid registration",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			wantStatusCode: http.StatusOK,
		},
		{
			name: "duplicate registration",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			wantStatusCode: http.StatusBadRequest,
		},
		{
			name: "invalid email",
			requestBody: RegisterRequest{
				Email:    "",
				Password: "password123",
			},
			wantStatusCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			router.ServeHTTP(rr, req)

			if rr.Code != tt.wantStatusCode {
				t.Errorf("handler returned wrong status code: got %v want %v", rr.Code, tt.wantStatusCode)
			}

			if tt.wantStatusCode == http.StatusOK {
				var response AuthResponse
				err := json.NewDecoder(rr.Body).Decode(&response)
				if err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}
				if response.User == nil {
					t.Error("Expected user in response, got nil")
				}
				if response.APIToken == "" {
					t.Error("Expected API token in response, got empty string")
				}
			}
		})
	}
}

func TestAuthHandler_Login(t *testing.T) {
	handler, store := setupTestHandler()
	router := chi.NewRouter()
	handler.RegisterRoutes(router)

	// Create a test user first
	testEmail := "test@example.com"
	testPassword := "password123"
	_, err := store.CreateUser(testEmail, testPassword)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	tests := []struct {
		name           string
		requestBody    LoginRequest
		wantStatusCode int
	}{
		{
			name: "valid login",
			requestBody: LoginRequest{
				Email:    testEmail,
				Password: testPassword,
			},
			wantStatusCode: http.StatusOK,
		},
		{
			name: "invalid password",
			requestBody: LoginRequest{
				Email:    testEmail,
				Password: "wrongpassword",
			},
			wantStatusCode: http.StatusUnauthorized,
		},
		{
			name: "non-existent user",
			requestBody: LoginRequest{
				Email:    "nonexistent@example.com",
				Password: testPassword,
			},
			wantStatusCode: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			router.ServeHTTP(rr, req)

			if rr.Code != tt.wantStatusCode {
				t.Errorf("handler returned wrong status code: got %v want %v", rr.Code, tt.wantStatusCode)
			}

			if tt.wantStatusCode == http.StatusOK {
				var response AuthResponse
				err := json.NewDecoder(rr.Body).Decode(&response)
				if err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}
				if response.User == nil {
					t.Error("Expected user in response, got nil")
				}
				if response.APIToken == "" {
					t.Error("Expected API token in response, got empty string")
				}
			}
		})
	}
}
