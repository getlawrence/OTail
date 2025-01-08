package opamp

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/open-telemetry/opamp-go/protobufs"
	"github.com/open-telemetry/opamp-go/server/types"
	"github.com/stretchr/testify/assert"
)

func TestAgents(t *testing.T) {
	t.Run("RemoveConnection", func(t *testing.T) {
		agents := &Agents{
			agentsById:  make(map[uuid.UUID]*Agent),
			connections: make(map[types.Connection]map[uuid.UUID]bool),
			userTokens:  make(map[types.Connection]string),
			tokenConns:  make(map[string][]types.Connection),
		}

		conn := &mockConnection{id: "test-conn"}
		agentID := uuid.New()
		agents.connections[conn] = map[uuid.UUID]bool{agentID: true}
		agents.userTokens[conn] = "test-token"
		agents.tokenConns["test-token"] = []types.Connection{conn}
		agents.agentsById[agentID] = &Agent{
			InstanceId:    agentID,
			InstanceIdStr: agentID.String(),
			conn:         conn,
			StartedAt:    time.Now(),
			Status:       &protobufs.AgentToServer{},
			remoteConfig: &protobufs.AgentRemoteConfig{},
		}

		agents.RemoveConnection(conn)

		assert.Empty(t, agents.connections[conn])
		assert.Empty(t, agents.userTokens[conn])
		assert.Empty(t, agents.tokenConns["test-token"])
		assert.Nil(t, agents.agentsById[agentID])
	})

	t.Run("FindOrCreateAgent", func(t *testing.T) {
		agents := &Agents{
			agentsById:  make(map[uuid.UUID]*Agent),
			connections: make(map[types.Connection]map[uuid.UUID]bool),
		}

		conn := &mockConnection{id: "test-conn"}
		agentID := uuid.New()

		// Test creating new agent
		agent := agents.FindOrCreateAgent(agentID, conn)
		assert.NotNil(t, agent)
		assert.Equal(t, agent, agents.agentsById[agentID])
		assert.True(t, agents.connections[conn][agentID])

		// Test finding existing agent
		sameAgent := agents.FindOrCreateAgent(agentID, conn)
		assert.Equal(t, agent, sameAgent)
	})

	t.Run("GetAgentsByToken", func(t *testing.T) {
		agents := &Agents{
			agentsById:  make(map[uuid.UUID]*Agent),
			connections: make(map[types.Connection]map[uuid.UUID]bool),
			userTokens:  make(map[types.Connection]string),
			tokenConns:  make(map[string][]types.Connection),
		}

		conn := &mockConnection{id: "test-conn"}
		agentID := uuid.New()
		token := "test-token"

		agents.agentsById[agentID] = &Agent{
			InstanceId:    agentID,
			InstanceIdStr: agentID.String(),
			conn:         conn,
			StartedAt:    time.Now(),
			Status:       &protobufs.AgentToServer{},
			remoteConfig: &protobufs.AgentRemoteConfig{},
		}
		agents.connections[conn] = map[uuid.UUID]bool{agentID: true}
		agents.userTokens[conn] = token
		agents.tokenConns[token] = []types.Connection{conn}

		result := agents.GetAgentsByToken(token)
		assert.NotNil(t, result)
		assert.Contains(t, result, agentID)

		// Test with non-existent token
		result = agents.GetAgentsByToken("non-existent")
		assert.Empty(t, result)
	})

	t.Run("SetCustomConfigForAgent", func(t *testing.T) {
		agents := &Agents{
			agentsById:  make(map[uuid.UUID]*Agent),
			connections: make(map[types.Connection]map[uuid.UUID]bool),
		}

		conn := &mockConnection{id: "test-conn"}
		agentID := uuid.New()
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

		config := &protobufs.AgentConfigMap{
			ConfigMap: map[string]*protobufs.AgentConfigFile{
				"": {Body: []byte("test config")},
			},
		}

		notifyChan := make(chan struct{}, 1)
		agents.SetCustomConfigForAgent(agentID, config, notifyChan)

		// Test with non-existent agent
		nonExistentID := uuid.New()
		agents.SetCustomConfigForAgent(nonExistentID, config, notifyChan)
	})
}
