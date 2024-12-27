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

	var yamlConfig map[interface{}]interface{}
	if err := yaml.Unmarshal([]byte(config), &yamlConfig); err != nil {
		return "", fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Convert the YAML map to a string-keyed map
	configMap := convertToStringMap(yamlConfig)
	s.logger.Info("Parsed tail sampling config", zap.Any("configMap", configMap))

	processors, ok := configMap["processors"].(map[string]interface{})
	if !ok {
		// Return empty JSON object if processors doesn't exist or is not a map
		return "{}", nil
	}

	// If tail_sampling doesn't exist in processors, return empty config
	tailSampling, exists := processors["tail_sampling"]
	if !exists {
		return "{}", nil
	}

	// Check if tail_sampling is a map
	_, ok = tailSampling.(map[string]interface{})
	if !ok {
		return "{}", nil
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

// convertToStringMap converts map[interface{}]interface{} to map[string]interface{}
func convertToStringMap(m map[interface{}]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for k, v := range m {
		switch val := v.(type) {
		case map[interface{}]interface{}:
			result[fmt.Sprint(k)] = convertToStringMap(val)
		case []interface{}:
			result[fmt.Sprint(k)] = convertToInterfaceSlice(val)
		default:
			result[fmt.Sprint(k)] = v
		}
	}
	return result
}

// convertToInterfaceSlice handles conversion of slice elements
func convertToInterfaceSlice(slice []interface{}) []interface{} {
	result := make([]interface{}, len(slice))
	for i, v := range slice {
		switch val := v.(type) {
		case map[interface{}]interface{}:
			result[i] = convertToStringMap(val)
		case []interface{}:
			result[i] = convertToInterfaceSlice(val)
		default:
			result[i] = v
		}
	}
	return result
}
