package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/mottibec/otail-server/clickhouse"
	"github.com/mottibec/otail-server/tailsampling"
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
func (h *Handler) SetupRoutes(r *mux.Router) {
	r.HandleFunc("/api/v1/agents/{agentId}/config", h.GetConfig).Methods("GET")
	r.HandleFunc("/api/v1/agents/{agentId}/config", h.UpdateConfig).Methods("PUT")
	r.HandleFunc("/api/v1/agents", h.ListAgents).Methods("GET")
	r.HandleFunc("/api/v1/agents/{agentId}/logs", h.GetLogs).Methods("GET")
	r.HandleFunc("/api/v1/agents/{agentId}/logs/stream", h.StreamLogs)
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

func (h *Handler) GetLogs(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	agentID := vars["agentId"]

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

	logs, err := h.clickhouse.QueryLogs(r.Context(), agentID, startTime, endTime, limit)
	if err != nil {
		h.logger.Error("Failed to query logs", zap.Error(err))
		h.writeError(w, http.StatusInternalServerError, "Failed to query logs")
		return
	}

	h.writeJSON(w, logs)
}

func (h *Handler) StreamLogs(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	agentID := vars["agentId"]

	// Upgrade HTTP connection to WebSocket
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.logger.Error("Failed to upgrade connection", zap.Error(err))
		return
	}
	defer conn.Close()

	// Create a context that's cancelled when the connection is closed
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	// Start streaming logs
	logChan, err := h.clickhouse.StreamLogs(ctx, agentID)
	if err != nil {
		h.logger.Error("Failed to start log stream", zap.Error(err))
		return
	}

	for log := range logChan {
		err := conn.WriteJSON(log)
		if err != nil {
			h.logger.Error("Failed to write to websocket", zap.Error(err))
			return
		}
	}
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
