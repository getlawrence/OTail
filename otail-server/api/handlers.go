package api

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/mottibec/otail-server/tailsampling"
	"go.uber.org/zap"
)

type Handler struct {
	logger          *zap.Logger
	samplingService *tailsampling.Service
}

func NewHandler(logger *zap.Logger, samplingService *tailsampling.Service) *Handler {
	return &Handler{
		logger:          logger,
		samplingService: samplingService,
	}
}

// SetupRoutes configures the HTTP routes
func (h *Handler) SetupRoutes(r *mux.Router) {
	r.HandleFunc("/api/v1/agents/{agentId}/config", h.GetConfig).Methods("GET")
	r.HandleFunc("/api/v1/agents/{agentId}/config", h.UpdateConfig).Methods("PUT")
	r.HandleFunc("/api/v1/agents", h.ListAgents).Methods("GET")
}

func (h *Handler) ListAgents(w http.ResponseWriter, r *http.Request) {
	agents := h.samplingService.ListAgents()
	h.writeJSON(w, agents)
}

// GetConfig handles GET requests for agent configurations
func (h *Handler) GetConfig(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	agentID := vars["agentId"]
	instanceID, err := uuid.Parse(agentID)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid agent ID")
		return
	}

	config, err := h.samplingService.GetConfig(instanceID)
	if err != nil {
		h.writeError(w, http.StatusNotFound, "Configuration not found")
		return
	}

	h.writeJSON(w, config)
}

// UpdateConfig handles PUT requests to update agent configurations
func (h *Handler) UpdateConfig(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	agentID := vars["agentId"]
	instanceID, err := uuid.Parse(agentID)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid agent ID")
		return
	}

	var config map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.samplingService.UpdateConfig(instanceID, config); err != nil {
		h.writeError(w, http.StatusInternalServerError, "Failed to update configuration")
		return
	}

	w.WriteHeader(http.StatusOK)
}

// writeJSON writes a JSON response
func (h *Handler) writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		h.logger.Error("Failed to encode response", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Internal server error")
	}
}

// writeError writes an error response
func (h *Handler) writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
