package organization

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/mottibec/otail-server/pkg/auth"
	"go.uber.org/zap"
)

type CreateInviteResponse struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expiresAt"`
}

type OrgHandler struct {
	orgSvc OrgService
	logger *zap.Logger
}

func NewOrgHandler(orgSvc OrgService, logger *zap.Logger) *OrgHandler {
	return &OrgHandler{
		orgSvc: orgSvc,
		logger: logger,
	}
}

func (h *OrgHandler) RegisterRoutes(r chi.Router) {
	r.Get("/{orgId}", h.handleGetOrg)
	r.Post("/invite", h.handleCreateInvite)
}

func (h *OrgHandler) handleGetOrg(w http.ResponseWriter, r *http.Request) {
	requestedOrgID := chi.URLParam(r, "orgId")
	orgID, ok := r.Context().Value(auth.OrganizationIDKey).(string)
	if !ok {
		h.logger.Error("Failed to get organization ID from context")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if requestedOrgID != orgID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	org, err := h.orgSvc.GetOrganization(orgID)
	if err != nil {
		h.logger.Error("Failed to get organization", zap.Error(err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(org)
}

func (h *OrgHandler) handleCreateInvite(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(auth.OrganizationIDKey).(string)
	if !ok {
		h.logger.Error("Failed to get organization ID from context")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	invite, err := h.orgSvc.CreateInvite(orgID, req.Email)
	if err != nil {
		h.logger.Error("Failed to create invite", zap.Error(err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := CreateInviteResponse{
		Token:     invite.Token,
		ExpiresAt: invite.ExpiresAt.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		h.logger.Error("Failed to encode response", zap.Error(err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
