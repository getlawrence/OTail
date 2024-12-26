package tailsampling

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/mottibec/otail-server/opamp"
	"go.uber.org/zap"
	"gopkg.in/yaml.v2"
)

// Service handles tail sampling specific operations
type Service struct {
	logger      *zap.Logger
	opampServer *opamp.Server
}

// NewService creates a new tail sampling service
func NewService(logger *zap.Logger, opampServer *opamp.Server) *Service {
	return &Service{
		logger:      logger,
		opampServer: opampServer,
	}
}

// GetConfig retrieves the tail sampling configuration for a specific agent
func (s *Service) GetConfig(agentID uuid.UUID) (string, error) {
	config, err := s.opampServer.GetEffectiveConfig(agentID)
	if err != nil {
		return "", fmt.Errorf("failed to get tail sampling config: %w", err)
	}
	var configMap map[string]interface{}
	if err := yaml.Unmarshal([]byte(config), &configMap); err != nil {
		return "", fmt.Errorf("failed to unmarshal config: %w", err)
	}

	processors, ok := configMap["processors"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("processors is not a map[string]interface{}")
	}

	tailSampling, ok := processors["tail_sampling"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("tail_sampling is not a map[string]interface{}")
	}

	tailSamplingConfig, err := json.Marshal(tailSampling)
	if err != nil {
		return "", fmt.Errorf("failed to marshal tail sampling config: %w", err)
	}

	return string(tailSamplingConfig), nil
}

// UpdateConfig updates the tail sampling configuration for a specific agent
func (s *Service) UpdateConfig(agentID uuid.UUID, config map[string]interface{}) error {
	notifyNextStatusUpdate := make(chan struct{}, 1)
	if err := s.opampServer.UpdateConfig(agentID, config, notifyNextStatusUpdate); err != nil {
		return fmt.Errorf("failed to update tail sampling config: %w", err)
	}
	timer := time.NewTicker(time.Second * 5)

	select {
	case <-notifyNextStatusUpdate:
	case <-timer.C:
	}
	return nil
}

// ListAgents returns a list of all connected agents
func (s *Service) ListAgents() map[uuid.UUID]*opamp.Agent {
	return s.opampServer.ListAgents()
}
