package user

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/mottibec/otail-server/pkg/auth"
	"github.com/mottibec/otail-server/pkg/organization"
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

type RegisterRequest struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	Organization string `json:"organization"`
	Invite       string `json:"invite"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User         *User                           `json:"user"`
	Token        string                          `json:"token"`
	Organization *organization.OrganizationDetails `json:"organization"`
}

func (h *UserHandler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	user, err := h.userSvc.RegisterUser(r.Context(), req.Email, req.Password, req.Organization, req.Invite)
	if err != nil {
		h.logger.Error("Failed to create user", zap.Error(err))
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get organization details
	org, err := h.userSvc.orgSvc.GetOrganization(r.Context(), user.OrganizationID)
	if err != nil {
		http.Error(w, "Failed to get organization details", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	token, err := auth.GenerateJWT(user.ID, user.Email, user.OrganizationID)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	resp := AuthResponse{
		User:         user,
		Token:        token,
		Organization: org,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *UserHandler) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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

	// Get organization details
	org, err := h.userSvc.orgSvc.GetOrganization(r.Context(), user.OrganizationID)
	if err != nil {
		http.Error(w, "Failed to get organization details", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	token, err := auth.GenerateJWT(user.ID, user.Email, user.OrganizationID)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	resp := AuthResponse{
		User:         user,
		Token:        token,
		Organization: org,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
