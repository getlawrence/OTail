package tailsampling

import (
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/mottibec/otail-server/opamp"
	"go.uber.org/zap"
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
func (s *Service) GetConfig(agentID uuid.UUID) (map[string]interface{}, error) {
	config, err := s.opampServer.GetEffectiveConfig(agentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tail sampling config: %w", err)
	}

	// Parse the config string into a map
	var configMap map[string]interface{}
	if err := json.Unmarshal([]byte(config), &configMap); err != nil {
		return nil, fmt.Errorf("failed to parse tail sampling config: %w", err)
	}

	// Extract only the tail sampling related configuration
	// You might want to modify this based on your specific config structure
	if samplingConfig, ok := configMap["service"].(map[string]interface{})["sampling"]; ok {
		return map[string]interface{}{"sampling": samplingConfig}, nil
	}

	return make(map[string]interface{}), nil
}

// UpdateConfig updates the tail sampling configuration for a specific agent
func (s *Service) UpdateConfig(agentID uuid.UUID, config map[string]interface{}) error {
	// Validate the sampling configuration
	if err := s.validateSamplingConfig(config); err != nil {
		return fmt.Errorf("invalid tail sampling config: %w", err)
	}

	// Get the current config to merge with
	currentConfig, err := s.opampServer.GetEffectiveConfig(agentID)
	if err != nil {
		return fmt.Errorf("failed to get current config: %w", err)
	}

	var fullConfig map[string]interface{}
	if err := json.Unmarshal([]byte(currentConfig), &fullConfig); err != nil {
		fullConfig = make(map[string]interface{})
	}

	// Ensure service section exists
	if _, ok := fullConfig["service"]; !ok {
		fullConfig["service"] = make(map[string]interface{})
	}

	// Update only the sampling section
	serviceConfig := fullConfig["service"].(map[string]interface{})
	serviceConfig["sampling"] = config["sampling"]

	// Update the config through OpAMP server
	if err := s.opampServer.UpdateConfig(agentID, fullConfig); err != nil {
		return fmt.Errorf("failed to update tail sampling config: %w", err)
	}

	return nil
}

// validateSamplingConfig validates the sampling configuration structure
func (s *Service) validateSamplingConfig(config map[string]interface{}) error {
	if config == nil {
		return fmt.Errorf("config cannot be nil")
	}

	sampling, ok := config["sampling"]
	if !ok {
		return fmt.Errorf("sampling configuration is required")
	}

	// Add more validation as needed based on your sampling configuration structure

	if sampling == nil {
		return fmt.Errorf("sampling configuration cannot be nil")
	}

	return nil
}

// ListAgents returns a list of all connected agents
func (s *Service) ListAgents() map[uuid.UUID]*opamp.Agent {
	return s.opampServer.ListAgents()
}
