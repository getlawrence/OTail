package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/mottibec/otail-server/auth"
	"go.uber.org/zap"
)

type AuthHandler struct {
	userStore auth.UserStore
	logger    *zap.Logger
}

func NewAuthHandler(userStore auth.UserStore, logger *zap.Logger) *AuthHandler {
	return &AuthHandler{
		userStore: userStore,
		logger:    logger,
	}
}

func (h *AuthHandler) RegisterRoutes(r chi.Router) {
	r.Post("/register", h.handleRegister)
	r.Post("/login", h.handleLogin)
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User     *auth.User `json:"user"`
	APIToken string     `json:"api_token"`
}

func (h *AuthHandler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.userStore.CreateUser(req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp := AuthResponse{
		User:     user,
		APIToken: user.APIToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *AuthHandler) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.userStore.GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if !h.userStore.ValidatePassword(user, req.Password) {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	resp := AuthResponse{
		User:     user,
		APIToken: user.APIToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
