package opamp

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/open-telemetry/opamp-go/protobufs"
	"github.com/open-telemetry/opamp-go/server/types"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestServer(t *testing.T) {
	t.Run("NewServer", func(t *testing.T) {
		logger, _ := zap.NewDevelopment()
		agents := &Agents{
			agentsById:  make(map[uuid.UUID]*Agent),
			connections: make(map[types.Connection]map[uuid.UUID]bool),
			userTokens:  make(map[types.Connection]string),
			tokenConns:  make(map[string][]types.Connection),
		}

		verifyToken := func(token string) (string, error) {
			return "user-id", nil
		}

		server, err := NewServer(agents, verifyToken, logger)
		assert.NoError(t, err)
		assert.NotNil(t, server)
		assert.NotNil(t, server.opampServer)
	})

	t.Run("GetEffectiveConfig", func(t *testing.T) {
		logger, _ := zap.NewDevelopment()
		agents := &Agents{
			agentsById: make(map[uuid.UUID]*Agent),
		}

		server, _ := NewServer(agents, nil, logger)
		agentID := uuid.New()

		// Test with non-existent agent
		config, err := server.GetEffectiveConfig(agentID)
		assert.Error(t, err)
		assert.Empty(t, config)

		// Test with existing agent
		agent := &Agent{
			InstanceId:      agentID,
			InstanceIdStr:   agentID.String(),
			StartedAt:       time.Now(),
			Status:         &protobufs.AgentToServer{},
			remoteConfig:   &protobufs.AgentRemoteConfig{},
			EffectiveConfig: "test config",
		}
		agents.agentsById[agentID] = agent
		config, err = server.GetEffectiveConfig(agentID)
		assert.NoError(t, err)
		assert.NotEmpty(t, config)
	})

	t.Run("UpdateConfig", func(t *testing.T) {
		logger, _ := zap.NewDevelopment()
		agents := &Agents{
			agentsById:  make(map[uuid.UUID]*Agent),
			connections: make(map[types.Connection]map[uuid.UUID]bool),
		}

		server, _ := NewServer(agents, nil, logger)
		agentID := uuid.New()
		config := map[string]interface{}{
			"key": "value",
		}
		notifyChan := make(chan struct{}, 1)

		// Test with non-existent agent
		err := server.UpdateConfig(agentID, config, notifyChan)
		assert.Error(t, err)

		// Test with existing agent
		conn := &mockConnection{id: "test-conn"}
		agent := &Agent{
			InstanceId:    agentID,
			InstanceIdStr: agentID.String(),
			conn:         conn,
			StartedAt:    time.Now(),
			Status:       &protobufs.AgentToServer{},
			remoteConfig: &protobufs.AgentRemoteConfig{},
		}
		agents.agentsById[agentID] = agent
		agents.connections[conn] = map[uuid.UUID]bool{agentID: true}

		err = server.UpdateConfig(agentID, config, notifyChan)
		assert.NoError(t, err)
	})

	t.Run("ListAgents", func(t *testing.T) {
		logger, _ := zap.NewDevelopment()
		agents := &Agents{
			agentsById: make(map[uuid.UUID]*Agent),
		}

		server, _ := NewServer(agents, nil, logger)
		agentID := uuid.New()
		agent := &Agent{
			InstanceId:    agentID,
			InstanceIdStr: agentID.String(),
			StartedAt:    time.Now(),
			Status:       &protobufs.AgentToServer{},
			remoteConfig: &protobufs.AgentRemoteConfig{},
		}
		agents.agentsById[agentID] = agent

		result := server.ListAgents()
		assert.NotEmpty(t, result)
		assert.Contains(t, result, agentID)
	})

	t.Run("GetAgentsByToken", func(t *testing.T) {
		logger, _ := zap.NewDevelopment()
		agents := &Agents{
			agentsById:  make(map[uuid.UUID]*Agent),
			connections: make(map[types.Connection]map[uuid.UUID]bool),
			userTokens:  make(map[types.Connection]string),
			tokenConns:  make(map[string][]types.Connection),
		}

		server, _ := NewServer(agents, nil, logger)
		agentID := uuid.New()
		token := "test-token"
		conn := &mockConnection{id: "test-conn"}
		agent := &Agent{
			InstanceId:    agentID,
			InstanceIdStr: agentID.String(),
			conn:         conn,
			StartedAt:    time.Now(),
			Status:       &protobufs.AgentToServer{},
			remoteConfig: &protobufs.AgentRemoteConfig{},
		}
		agents.agentsById[agentID] = agent
		agents.connections[conn] = map[uuid.UUID]bool{agentID: true}
		agents.userTokens[conn] = token
		agents.tokenConns[token] = []types.Connection{conn}

		result := server.GetAgentsByToken(token)
		assert.NotEmpty(t, result)
		assert.Contains(t, result, agentID)

		// Test with non-existent token
		result = server.GetAgentsByToken("non-existent")
		assert.Empty(t, result)
	})
}
