package user

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"go.uber.org/zap"
)

type UserHandler struct {
	userSvc UserService
	logger  *zap.Logger
}

func NewUserHandler(userSvc UserService, logger *zap.Logger) *UserHandler {
	return &UserHandler{
		userSvc: userSvc,
		logger:  logger,
	}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Post("/register", h.handleRegister)
	r.Post("/login", h.handleLogin)
}

type OrganizationRequest struct {
	Name string `json:"name"`
}

type RegisterRequest struct {
	Email        string              `json:"email"`
	Password     string              `json:"password"`
	Organization OrganizationRequest `json:"organization"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User     *User  `json:"user"`
	APIToken string `json:"api_token"`
}

func (h *UserHandler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	user, err := h.userSvc.CreateUser(req.Email, req.Password)
	if err != nil {
		h.logger.Error("Failed to create user", zap.Error(err))
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

func (h *UserHandler) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.userSvc.GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if !h.userSvc.ValidatePassword(user, req.Password) {
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
