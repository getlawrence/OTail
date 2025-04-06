package groups

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type Handler struct {
	store  Store
	logger *zap.Logger
}

func NewHandler(store Store, logger *zap.Logger) *Handler {
	return &Handler{
		store:  store,
		logger: logger,
	}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Get("/", h.ListGroups)
	r.Post("/", h.CreateGroup)
	r.Get("/{id}", h.GetGroup)
	r.Put("/{id}", h.UpdateGroup)
	r.Delete("/{id}", h.DeleteGroup)
	r.Post("/{id}/agents/{agentId}", h.AddAgent)
	r.Delete("/{id}/agents/{agentId}", h.RemoveAgent)
}

func (h *Handler) ListGroups(w http.ResponseWriter, r *http.Request) {
	deploymentID := r.URL.Query().Get("deployment_id")
	groups, err := h.store.List(r.Context(), deploymentID)
	if err != nil {
		h.logger.Error("Failed to list groups", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to list groups")
		return
	}

	h.writeJSON(w, groups)
}

func (h *Handler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	var group AgentGroup
	if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.store.Create(r.Context(), &group); err != nil {
		h.logger.Error("Failed to create group", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to create group")
		return
	}

	h.writeJSON(w, group)
}

func (h *Handler) GetGroup(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	group, err := h.store.Get(r.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get group", zap.Error(err))
		h.writeError(w, http.StatusNotFound, "Group not found")
		return
	}

	h.writeJSON(w, group)
}

func (h *Handler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var group AgentGroup
	if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	group.ID = id
	if err := h.store.Update(r.Context(), &group); err != nil {
		h.logger.Error("Failed to update group", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to update group")
		return
	}

	h.writeJSON(w, group)
}

func (h *Handler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.store.Delete(r.Context(), id); err != nil {
		h.logger.Error("Failed to delete group", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to delete group")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) AddAgent(w http.ResponseWriter, r *http.Request) {
	groupID := chi.URLParam(r, "id")
	agentID := chi.URLParam(r, "agentId")

	if err := h.store.AddAgent(r.Context(), groupID, agentID); err != nil {
		h.logger.Error("Failed to add agent to group", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to add agent to group")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) RemoveAgent(w http.ResponseWriter, r *http.Request) {
	groupID := chi.URLParam(r, "id")
	agentID := chi.URLParam(r, "agentId")

	if err := h.store.RemoveAgent(r.Context(), groupID, agentID); err != nil {
		h.logger.Error("Failed to remove agent from group", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to remove agent from group")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		h.logger.Error("Failed to encode response", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Internal server error")
	}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
