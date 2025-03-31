package deployments

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
	r.Get("/", h.ListDeployments)
	r.Post("/", h.CreateDeployment)
	r.Get("/{id}", h.GetDeployment)
	r.Put("/{id}", h.UpdateDeployment)
	r.Delete("/{id}", h.DeleteDeployment)
	r.Post("/{id}/groups/{groupId}", h.AddGroup)
	r.Delete("/{id}/groups/{groupId}", h.RemoveGroup)
}

func (h *Handler) ListDeployments(w http.ResponseWriter, r *http.Request) {
	deployments, err := h.store.List(r.Context())
	if err != nil {
		h.logger.Error("Failed to list deployments", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to list deployments")
		return
	}

	h.writeJSON(w, deployments)
}

func (h *Handler) CreateDeployment(w http.ResponseWriter, r *http.Request) {
	var deployment Deployment
	if err := json.NewDecoder(r.Body).Decode(&deployment); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.store.Create(r.Context(), &deployment); err != nil {
		h.logger.Error("Failed to create deployment", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to create deployment")
		return
	}

	h.writeJSON(w, deployment)
}

func (h *Handler) GetDeployment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	deployment, err := h.store.Get(r.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get deployment", zap.Error(err))
		h.writeError(w, http.StatusNotFound, "Deployment not found")
		return
	}

	h.writeJSON(w, deployment)
}

func (h *Handler) UpdateDeployment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var deployment Deployment
	if err := json.NewDecoder(r.Body).Decode(&deployment); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	deployment.ID = id
	if err := h.store.Update(r.Context(), &deployment); err != nil {
		h.logger.Error("Failed to update deployment", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to update deployment")
		return
	}

	h.writeJSON(w, deployment)
}

func (h *Handler) DeleteDeployment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.store.Delete(r.Context(), id); err != nil {
		h.logger.Error("Failed to delete deployment", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to delete deployment")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) AddGroup(w http.ResponseWriter, r *http.Request) {
	deploymentID := chi.URLParam(r, "id")
	groupID := chi.URLParam(r, "groupId")

	if err := h.store.AddGroup(r.Context(), deploymentID, groupID); err != nil {
		h.logger.Error("Failed to add group to deployment", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to add group to deployment")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) RemoveGroup(w http.ResponseWriter, r *http.Request) {
	deploymentID := chi.URLParam(r, "id")
	groupID := chi.URLParam(r, "groupId")

	if err := h.store.RemoveGroup(r.Context(), deploymentID, groupID); err != nil {
		h.logger.Error("Failed to remove group from deployment", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to remove group from deployment")
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
