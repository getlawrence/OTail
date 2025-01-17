package agents

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/mottibec/otail-server/pkg/agents/clickhouse"
	"github.com/mottibec/otail-server/pkg/agents/tailsampling"
	"github.com/mottibec/otail-server/pkg/middleware"
	"go.uber.org/zap"
)

type Handler struct {
	logger          *zap.Logger
	samplingService *tailsampling.Service
	clickhouse      *clickhouse.Client
	upgrader        websocket.Upgrader
}

func NewHandler(logger *zap.Logger, samplingService *tailsampling.Service, clickhouse *clickhouse.Client) *Handler {
	return &Handler{
		logger:          logger,
		samplingService: samplingService,
		clickhouse:      clickhouse,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // In production, implement proper origin checking
			},
		},
	}
}

// SetupRoutes configures the HTTP routes
func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Get("/", h.ListAgents)
	r.Get("/{agentId}/config", h.GetConfig)
	r.Put("/{agentId}/config", h.UpdateConfig)
	r.Get("/{agentId}/logs", h.GetLogs)
}

func (h *Handler) ListAgents(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	agents := h.samplingService.GetAgentsByToken(userID)
	h.writeJSON(w, agents)
}

func (h *Handler) GetConfig(w http.ResponseWriter, r *http.Request) {
	vars := chi.URLParam(r, "agentId")
	agentID := vars
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

func (h *Handler) UpdateConfig(w http.ResponseWriter, r *http.Request) {
	agentID := chi.URLParam(r, "agentId")
	instanceID, err := uuid.Parse(agentID)
	if err != nil {
		h.logger.Error("Failed to parse agent ID", zap.Error(err))
		h.writeError(w, http.StatusBadRequest, "Invalid agent ID")
		return
	}

	var config map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		h.logger.Error("Failed to decode request body", zap.Error(err))
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.samplingService.UpdateConfig(instanceID, config); err != nil {
		h.logger.Error("Failed to update configuration", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to update configuration")
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetLogs(w http.ResponseWriter, r *http.Request) {
	agentId := chi.URLParam(r, "agentId")

	// Parse query parameters
	startTimeStr := r.URL.Query().Get("start_time")
	endTimeStr := r.URL.Query().Get("end_time")

	startTime := time.Now().Add(-1 * time.Hour)
	endTime := time.Now()
	limit := 100

	if startTimeStr != "" {
		if t, err := time.Parse(time.RFC3339, startTimeStr); err == nil {
			startTime = t
		}
	}
	if endTimeStr != "" {
		if t, err := time.Parse(time.RFC3339, endTimeStr); err == nil {
			endTime = t
		}
	}

	logs, err := h.clickhouse.QueryLogs(r.Context(), agentId, startTime, endTime, limit)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "Failed to query logs")
		return
	}

	h.writeJSON(w, logs)
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
