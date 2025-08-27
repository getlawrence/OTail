package opamp

import (
	"sync"

	"github.com/google/uuid"
	"github.com/open-telemetry/opamp-go/protobufs"
	"github.com/open-telemetry/opamp-go/server/types"
	"go.uber.org/zap"
)

// AgentInfo contains all the metadata about an agent's relationships
type AgentInfo struct {
	Agent        *Agent
	Connection   types.Connection
	OrgID        string
	GroupID      string
	DeploymentID string
}

// Agents manages all agent connections and their relationships
type Agents struct {
	mux sync.RWMutex
	// Primary storage: map of agent ID to AgentInfo
	agents map[uuid.UUID]*AgentInfo
	// Indexes for fast lookups
	orgIndex        map[string]map[uuid.UUID]bool
	groupIndex      map[string]map[uuid.UUID]bool
	deploymentIndex map[string]map[uuid.UUID]bool
	// Map connection to agent ID (one-to-one)
	connectionToAgent map[types.Connection]uuid.UUID
	logger            *zap.Logger
}

// NewAgents creates a new Agents instance with the given logger
func NewAgents(logger *zap.Logger) *Agents {
	return &Agents{
		agents:            map[uuid.UUID]*AgentInfo{},
		orgIndex:          map[string]map[uuid.UUID]bool{},
		groupIndex:        map[string]map[uuid.UUID]bool{},
		deploymentIndex:   map[string]map[uuid.UUID]bool{},
		connectionToAgent: map[types.Connection]uuid.UUID{},
		logger:            logger,
	}
}

// SetConnection sets metadata for a connection and its associated agent
func (agents *Agents) SetConnection(conn types.Connection, orgID, groupID, deploymentID string) {
	agents.mux.Lock()
	defer agents.mux.Unlock()

	agents.logger.Info("Set connection metadata",
		zap.String("org_id", orgID),
		zap.String("group_id", groupID),
		zap.String("deployment_id", deploymentID))

	// Get the agent ID for this connection
	agentId, exists := agents.connectionToAgent[conn]
	if !exists {
		agents.logger.Warn("No agent found for connection")
		return
	}

	// Get the agent info
	info := agents.agents[agentId]
	if info == nil {
		agents.logger.Warn("No agent info found",
			zap.String("agent_id", agentId.String()))
		return
	}

	// Update organization ID
	if orgID != "" && info.OrgID != orgID {
		// Remove from old org index
		if info.OrgID != "" {
			if orgAgents := agents.orgIndex[info.OrgID]; orgAgents != nil {
				delete(orgAgents, agentId)
				if len(orgAgents) == 0 {
					delete(agents.orgIndex, info.OrgID)
				}
			}
		}

		// Add to new org index
		info.OrgID = orgID
		if agents.orgIndex[orgID] == nil {
			agents.orgIndex[orgID] = map[uuid.UUID]bool{}
		}
		agents.orgIndex[orgID][agentId] = true
	}

	// Update group ID
	if groupID != "" && info.GroupID != groupID {
		// Remove from old group index
		if info.GroupID != "" {
			if groupAgents := agents.groupIndex[info.GroupID]; groupAgents != nil {
				delete(groupAgents, agentId)
				if len(groupAgents) == 0 {
					delete(agents.groupIndex, info.GroupID)
				}
			}
		}

		// Add to new group index
		info.GroupID = groupID
		if agents.groupIndex[groupID] == nil {
			agents.groupIndex[groupID] = map[uuid.UUID]bool{}
		}
		agents.groupIndex[groupID][agentId] = true
	}

	// Update deployment ID
	if deploymentID != "" && info.DeploymentID != deploymentID {
		// Remove from old deployment index
		if info.DeploymentID != "" {
			if deploymentAgents := agents.deploymentIndex[info.DeploymentID]; deploymentAgents != nil {
				delete(deploymentAgents, agentId)
				if len(deploymentAgents) == 0 {
					delete(agents.deploymentIndex, info.DeploymentID)
				}
			}
		}

		// Add to new deployment index
		info.DeploymentID = deploymentID
		if agents.deploymentIndex[deploymentID] == nil {
			agents.deploymentIndex[deploymentID] = map[uuid.UUID]bool{}
		}
		agents.deploymentIndex[deploymentID][agentId] = true
	}
}

// RemoveConnection removes the connection and its associated agent
func (agents *Agents) RemoveConnection(conn types.Connection) {
	agents.mux.Lock()
	defer agents.mux.Unlock()

	// Get the agent ID for this connection
	agentId, exists := agents.connectionToAgent[conn]
	if !exists {
		return
	}

	// Get the agent info
	info := agents.agents[agentId]
	if info == nil {
		return
	}

	// Remove from org index
	if info.OrgID != "" {
		if orgAgents := agents.orgIndex[info.OrgID]; orgAgents != nil {
			delete(orgAgents, agentId)
			if len(orgAgents) == 0 {
				delete(agents.orgIndex, info.OrgID)
			}
		}
	}

	// Remove from group index
	if info.GroupID != "" {
		if groupAgents := agents.groupIndex[info.GroupID]; groupAgents != nil {
			delete(groupAgents, agentId)
			if len(groupAgents) == 0 {
				delete(agents.groupIndex, info.GroupID)
			}
		}
	}

	// Remove from deployment index
	if info.DeploymentID != "" {
		if deploymentAgents := agents.deploymentIndex[info.DeploymentID]; deploymentAgents != nil {
			delete(deploymentAgents, agentId)
			if len(deploymentAgents) == 0 {
				delete(agents.deploymentIndex, info.DeploymentID)
			}
		}
	}

	// Remove from main storage
	delete(agents.agents, agentId)
	// Remove from connection map
	delete(agents.connectionToAgent, conn)
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

func (agents *Agents) FindAgent(agentId uuid.UUID) *Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()
	if info := agents.agents[agentId]; info != nil {
		return info.Agent
	}
	return nil
}

func (agents *Agents) FindOrCreateAgent(agentId uuid.UUID, conn types.Connection) *Agent {
	agents.mux.Lock()
	defer agents.mux.Unlock()

	agents.logger.Info("Finding or creating agent",
		zap.String("agent_id", agentId.String()),
		zap.Any("connection", conn))

	info := agents.agents[agentId]
	if info == nil {
		agents.logger.Info("Creating new agent",
			zap.String("agent_id", agentId.String()))

		info = &AgentInfo{
			Agent:      NewAgent(agentId, conn),
			Connection: conn,
		}
		agents.agents[agentId] = info
		agents.connectionToAgent[conn] = agentId
		agents.logger.Info("Added agent to connection map",
			zap.String("agent_id", agentId.String()),
			zap.Any("connection", conn))
	} else {
		agents.logger.Info("Found existing agent",
			zap.String("agent_id", agentId.String()),
			zap.Any("existing_connection", info.Connection))
	}

	return info.Agent
}

func (agents *Agents) GetAgentReadonlyClone(agentId uuid.UUID) *Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()
	if info := agents.agents[agentId]; info != nil {
		return info.Agent.CloneReadonly()
	}
	return nil
}

func (agents *Agents) GetAllAgentsReadonlyClone() map[uuid.UUID]*Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()

	result := map[uuid.UUID]*Agent{}
	for id, info := range agents.agents {
		result[id] = info.Agent.CloneReadonly()
	}
	return result
}

func (agents *Agents) OfferAgentConnectionSettings(
	id uuid.UUID,
	offers *protobufs.ConnectionSettingsOffers,
) {
	agents.logger.Info("Begin rotate client certificate", zap.String("agent_id", id.String()))

	agents.mux.Lock()
	defer agents.mux.Unlock()

	if info := agents.agents[id]; info != nil {
		info.Agent.OfferConnectionSettings(offers)
		agents.logger.Info("Client certificate offers sent", zap.String("agent_id", id.String()))
	} else {
		agents.logger.Warn("Agent not found", zap.String("agent_id", id.String()))
	}
}

func (agents *Agents) SetOrganizationID(conn types.Connection, orgID string) {
	agents.mux.Lock()
	defer agents.mux.Unlock()

	agents.logger.Info("Setting organization ID",
		zap.String("org_id", orgID),
		zap.Any("connection", conn))

	// Get all agents for this connection
	agentIds := agents.connectionToAgent[conn]
	if agentIds == uuid.Nil {
		agents.logger.Warn("No agents found for connection",
			zap.Any("connection", conn))
		return
	}

	agents.logger.Info("Found agents for connection",
		zap.String("agent_id", agentIds.String()),
		zap.Any("connection", conn))

	// Update each agent's org ID and maintain the index
	info := agents.agents[agentIds]
	if info == nil {
		agents.logger.Warn("Agent info not found",
			zap.String("agent_id", agentIds.String()))
		return
	}

	// Remove from old org index if exists
	if info.OrgID != "" {
		if orgAgents := agents.orgIndex[info.OrgID]; orgAgents != nil {
			delete(orgAgents, agentIds)
			agents.logger.Info("Removed agent from old org index",
				zap.String("agent_id", agentIds.String()),
				zap.String("old_org_id", info.OrgID))
			if len(orgAgents) == 0 {
				delete(agents.orgIndex, info.OrgID)
				agents.logger.Info("Removed empty org index",
					zap.String("old_org_id", info.OrgID))
			}
		}
	}

	// Update org ID
	info.OrgID = orgID
	agents.logger.Info("Updated agent org ID",
		zap.String("agent_id", agentIds.String()),
		zap.String("new_org_id", orgID))

	// Add to new org index
	if orgID != "" {
		if agents.orgIndex[orgID] == nil {
			agents.orgIndex[orgID] = map[uuid.UUID]bool{}
			agents.logger.Info("Created new org index",
				zap.String("org_id", orgID))
		}
		agents.orgIndex[orgID][agentIds] = true
		agents.logger.Info("Added agent to org index",
			zap.String("agent_id", agentIds.String()),
			zap.String("org_id", orgID))
	}
}

func (agents *Agents) SetAgentGroupAndDeployment(conn types.Connection, groupID, deploymentID string) {
	agents.mux.Lock()
	defer agents.mux.Unlock()

	// Get all agents for this connection
	agentIds := agents.connectionToAgent[conn]
	if agentIds == uuid.Nil {
		return
	}

	// Update each agent's group and deployment IDs and maintain indexes
	info := agents.agents[agentIds]
	if info == nil {
		return
	}

	// Update group ID and index
	if info.GroupID != "" {
		if groupAgents := agents.groupIndex[info.GroupID]; groupAgents != nil {
			delete(groupAgents, agentIds)
			if len(groupAgents) == 0 {
				delete(agents.groupIndex, info.GroupID)
			}
		}
	}
	info.GroupID = groupID
	if groupID != "" {
		if agents.groupIndex[groupID] == nil {
			agents.groupIndex[groupID] = map[uuid.UUID]bool{}
		}
		agents.groupIndex[groupID][agentIds] = true
	}

	// Update deployment ID and index
	if info.DeploymentID != "" {
		if deploymentAgents := agents.deploymentIndex[info.DeploymentID]; deploymentAgents != nil {
			delete(deploymentAgents, agentIds)
			if len(deploymentAgents) == 0 {
				delete(agents.deploymentIndex, info.DeploymentID)
			}
		}
	}
	info.DeploymentID = deploymentID
	if deploymentID != "" {
		if agents.deploymentIndex[deploymentID] == nil {
			agents.deploymentIndex[deploymentID] = map[uuid.UUID]bool{}
		}
		agents.deploymentIndex[deploymentID][agentIds] = true
	}
}

func (agents *Agents) GetAgentsByOrganization(orgID string) map[uuid.UUID]*Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()

	agents.logger.Info("Getting agents by organization",
		zap.String("org_id", orgID))

	result := map[uuid.UUID]*Agent{}
	agentIds := agents.orgIndex[orgID]
	if agentIds == nil {
		agents.logger.Warn("No agents found in org index",
			zap.String("org_id", orgID))
		return result
	}

	agents.logger.Info("Found agents in org index",
		zap.String("org_id", orgID),
		zap.Int("agent_count", len(agentIds)))

	for agentId := range agentIds {
		info := agents.agents[agentId]
		if info == nil {
			agents.logger.Warn("Agent info not found for ID in org index",
				zap.String("agent_id", agentId.String()),
				zap.String("org_id", orgID))
			continue
		}

		result[agentId] = info.Agent.CloneReadonly()
		agents.logger.Info("Added agent to result",
			zap.String("agent_id", agentId.String()),
			zap.String("org_id", orgID))
	}

	agents.logger.Info("Returning agents by organization",
		zap.String("org_id", orgID),
		zap.Int("result_count", len(result)))

	return result
}

func (agents *Agents) GetAgentsByGroup(groupID string) map[uuid.UUID]*Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()

	result := map[uuid.UUID]*Agent{}
	if agentIds := agents.groupIndex[groupID]; agentIds != nil {
		for agentId := range agentIds {
			if info := agents.agents[agentId]; info != nil {
				result[agentId] = info.Agent.CloneReadonly()
			}
		}
	}
	return result
}

func (agents *Agents) GetAgentsByDeployment(deploymentID string) map[uuid.UUID]*Agent {
	agents.mux.RLock()
	defer agents.mux.RUnlock()

	result := map[uuid.UUID]*Agent{}
	if agentIds := agents.deploymentIndex[deploymentID]; agentIds != nil {
		for agentId := range agentIds {
			if info := agents.agents[agentId]; info != nil {
				result[agentId] = info.Agent.CloneReadonly()
			}
		}
	}
	return result
}

// NewDefaultAgents creates a new Agents instance with the given logger
func NewDefaultAgents(logger *zap.Logger) *Agents {
	return NewAgents(logger)
}

// GetAgentInfo returns the AgentInfo for the given agent ID
func (agents *Agents) GetAgentInfo(agentId uuid.UUID) *AgentInfo {
	agents.mux.RLock()
	defer agents.mux.RUnlock()
	return agents.agents[agentId]
}

// GetAgentIdsByConnection returns the agent ID associated with a connection
func (agents *Agents) GetAgentIdsByConnection(conn types.Connection) []uuid.UUID {
	agents.mux.RLock()
	defer agents.mux.RUnlock()

	if agentId, exists := agents.connectionToAgent[conn]; exists {
		return []uuid.UUID{agentId}
	}
	return nil
}
