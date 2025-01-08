package opamp

import (
	"log"
	"sync"

	"github.com/google/uuid"
	"github.com/open-telemetry/opamp-go/protobufs"
	"github.com/open-telemetry/opamp-go/protobufshelpers"
	"github.com/open-telemetry/opamp-go/server/types"
)

type Agents struct {
	mux         sync.RWMutex
	agentsById  map[uuid.UUID]*Agent
	connections map[types.Connection]map[uuid.UUID]bool
	userTokens  map[types.Connection]string
	tokenConns  map[string][]types.Connection
}

var logger = log.New(log.Default().Writer(), "[AGENTS] ", log.Default().Flags()|log.Lmsgprefix|log.Lmicroseconds)

// RemoveConnection removes the connection all Agent instances associated with the
// connection.
func (agents *Agents) RemoveConnection(conn types.Connection) {
	agents.mux.Lock()
	defer agents.mux.Unlock()

	// Remove from tokenConns map
	if token, ok := agents.userTokens[conn]; ok {
		if conns, exists := agents.tokenConns[token]; exists {
			newConns := make([]types.Connection, 0, len(conns)-1)
			for _, c := range conns {
				if c != conn {
					newConns = append(newConns, c)
				}
			}
			if len(newConns) > 0 {
				agents.tokenConns[token] = newConns
			} else {
				delete(agents.tokenConns, token)
			}
		}
	}

	// Get the list of agents to remove
	agentsToRemove := agents.connections[conn]

	// Remove from other maps
	delete(agents.userTokens, conn)
	delete(agents.connections, conn)

	// Remove all agents associated with this connection
	for instanceId := range agentsToRemove {
		delete(agents.agentsById, instanceId)
	}
}

func (agents *Agents) SetCustomConfigForAgent(
	agentId uuid.UUID,
	config *protobufs.AgentConfigMap,
	notifyNextStatusUpdate chan<- struct{},
) {
	agent := agents.FindAgent(agentId)
	if agent != nil {
		agent.SetCustomConfig(config, notifyNextStatusUpdate)
	}
}

func isEqualAgentDescr(d1, d2 *protobufs.AgentDescription) bool {
	if d1 == d2 {
		return true
	}
	if d1 == nil || d2 == nil {
		return false
	}
	return isEqualAttrs(d1.IdentifyingAttributes, d2.IdentifyingAttributes) &&
		isEqualAttrs(d1.NonIdentifyingAttributes, d2.NonIdentifyingAttributes)
}

func isEqualAttrs(attrs1, attrs2 []*protobufs.KeyValue) bool {
	if len(attrs1) != len(attrs2) {
		return false
	}
	for i, a1 := range attrs1 {
		a2 := attrs2[i]
		if !protobufshelpers.IsEqualKeyValue(a1, a2) {
			return false
		}
	}
	return true
}

func (agents *Agents) FindAgent(agentId uuid.UUID) *Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()
	return agents.agentsById[agentId]
}

func (agents *Agents) FindOrCreateAgent(agentId uuid.UUID, conn types.Connection) *Agent {
	agents.mux.Lock()
	defer agents.mux.Unlock()

	// Ensure the Agent is in the agentsById map.
	agent := agents.agentsById[agentId]
	if agent == nil {
		agent = NewAgent(agentId, conn)
		agents.agentsById[agentId] = agent

		// Ensure the Agent's instance id is associated with the connection.
		if agents.connections[conn] == nil {
			agents.connections[conn] = map[uuid.UUID]bool{}
		}
		agents.connections[conn][agentId] = true
	}

	return agent
}

func (agents *Agents) GetAgentReadonlyClone(agentId uuid.UUID) *Agent {
	agent := agents.FindAgent(agentId)
	if agent == nil {
		return nil
	}

	// Return a clone to allow safe access after returning.
	return agent.CloneReadonly()
}

func (agents *Agents) GetAllAgentsReadonlyClone() map[uuid.UUID]*Agent {
	agents.mux.RLock()

	// Clone the map first
	m := map[uuid.UUID]*Agent{}
	for id, agent := range agents.agentsById {
		m[id] = agent
	}
	agents.mux.RUnlock()

	// Clone agents in the map
	for id, agent := range m {
		// Return a clone to allow safe access after returning.
		m[id] = agent.CloneReadonly()
	}
	return m
}

func (a *Agents) OfferAgentConnectionSettings(
	id uuid.UUID,
	offers *protobufs.ConnectionSettingsOffers,
) {
	logger.Printf("Begin rotate client certificate for %s\n", id)

	a.mux.Lock()
	defer a.mux.Unlock()

	agent, ok := a.agentsById[id]
	if ok {
		agent.OfferConnectionSettings(offers)
		logger.Printf("Client certificate offers sent to %s\n", id)
	} else {
		logger.Printf("Agent %s not found\n", id)
	}
}

func (agents *Agents) SetUserToken(conn types.Connection, token string) {
	agents.mux.Lock()
	defer agents.mux.Unlock()
	agents.userTokens[conn] = token

	// Update token -> connections mapping
	if agents.tokenConns == nil {
		agents.tokenConns = make(map[string][]types.Connection)
	}
	agents.tokenConns[token] = append(agents.tokenConns[token], conn)
}

func (agents *Agents) GetAgentsByToken(token string) map[uuid.UUID]*Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()

	result := make(map[uuid.UUID]*Agent)

	conns, exists := agents.tokenConns[token]
	if !exists {
		return result
	}

	for _, conn := range conns {
		agentSet, exists := agents.connections[conn]
		if !exists {
			continue
		}

		for agentId := range agentSet {
			agent, exists := agents.agentsById[agentId]
			if exists && agent != nil {
				result[agentId] = agent
			}
		}
	}

	return result
}

var AllAgents = Agents{
	agentsById:  map[uuid.UUID]*Agent{},
	connections: map[types.Connection]map[uuid.UUID]bool{},
	userTokens:  map[types.Connection]string{},
	tokenConns:  map[string][]types.Connection{},
}
