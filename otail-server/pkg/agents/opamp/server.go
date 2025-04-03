package opamp

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/open-telemetry/opamp-go/protobufs"
	"github.com/open-telemetry/opamp-go/server"
	"github.com/open-telemetry/opamp-go/server/types"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
)

type Server struct {
	logger      *zap.Logger
	opampServer server.OpAMPServer
	agents      *Agents
	verifyToken func(string) (string, error)
	// Callback for agent group and deployment verification
	onAgentConnected func(ctx context.Context, deploymentName, groupName string) (string, string, error)
	// Map to store connection metadata
	connectionMetadata map[types.Connection]struct {
		OrgID        string
		GroupID      string
		DeploymentID string
	}
}

// zapToOpAmpLogger adapts zap.Logger to opamp's logger interface
type zapToOpAmpLogger struct {
	*zap.Logger
}

func (z *zapToOpAmpLogger) Debugf(ctx context.Context, format string, args ...interface{}) {
	z.Sugar().Debugf(format, args...)
}

func (z *zapToOpAmpLogger) Errorf(ctx context.Context, format string, args ...interface{}) {
	z.Sugar().Errorf(format, args...)
}

func NewServer(
	agents *Agents,
	verifyToken func(string) (string, error),
	onAgentConnected func(ctx context.Context, deploymentName, groupName string) (string, string, error),
	logger *zap.Logger,
) (*Server, error) {
	s := &Server{
		logger:           logger,
		agents:           agents,
		verifyToken:      verifyToken,
		onAgentConnected: onAgentConnected,
		connectionMetadata: make(map[types.Connection]struct {
			OrgID        string
			GroupID      string
			DeploymentID string
		}),
	}

	// Create the OPAmp server
	s.opampServer = server.New(&zapToOpAmpLogger{logger})

	return s, nil
}

func (s *Server) Start() error {
	s.logger.Info("Starting OPAmp server...")

	settings := server.StartSettings{
		Settings: server.Settings{
			Callbacks: server.CallbacksStruct{
				OnConnectingFunc: func(request *http.Request) types.ConnectionResponse {
					// Extract token from Authorization header
					token := request.Header.Get("Authorization")
					if token == "" {
						s.logger.Error("No authorization token provided")
						return types.ConnectionResponse{Accept: false}
					}

					// Remove "Bearer " prefix if present
					if len(token) > 7 && token[:7] == "Bearer " {
						token = token[7:]
					}

					// Verify token and get user ID
					organizationID, err := s.verifyToken(token)
					if err != nil {
						s.logger.Error("Invalid token", zap.Error(err), zap.String("token", token))
						return types.ConnectionResponse{Accept: false, HTTPStatusCode: http.StatusUnauthorized}
					}

					// Extract agent group and deployment from headers
					agentGroup := request.Header.Get("Agent-Group")
					deployment := request.Header.Get("Deployment")

					// Verify agent group and deployment if provided
					groupID, deploymentID, err := s.onAgentConnected(request.Context(), agentGroup, deployment)
					if err != nil {
						s.logger.Error("Invalid agent group or deployment",
							zap.Error(err),
							zap.String("group", agentGroup),
							zap.String("deployment", deployment))
						return types.ConnectionResponse{Accept: false, HTTPStatusCode: http.StatusUnauthorized}
					}

					return types.ConnectionResponse{
						Accept: true,
						ConnectionCallbacks: server.ConnectionCallbacksStruct{
							OnConnectedFunc: func(ctx context.Context, conn types.Connection) {
								// Create a new agent for this connection
								agentId := uuid.New()
								agent := s.agents.FindOrCreateAgent(agentId, conn)
								if agent == nil {
									s.logger.Warn("Failed to create agent",
										zap.String("agent_id", agentId.String()))
									return
								}

								s.logger.Info("Created new agent",
									zap.String("agent_id", agentId.String()))

								// Set all connection metadata at once
								s.agents.SetConnection(conn, organizationID, groupID, deploymentID)
							},
							OnMessageFunc:         s.onMessage,
							OnConnectionCloseFunc: s.onDisconnect,
						},
					}
				},
			},
		},
		ListenEndpoint: ":4320",
		HTTPMiddleware: otelhttp.NewMiddleware("/v1/opamp"),
	}

	if err := s.opampServer.Start(settings); err != nil {
		return fmt.Errorf("failed to start OpAMP server: %w", err)
	}

	return nil
}

func (s *Server) Stop(ctx context.Context) error {
	s.logger.Info("Stopping OPAmp server...")
	s.opampServer.Stop(ctx)
	return nil
}

func (s *Server) onDisconnect(conn types.Connection) {
	// Get agent info for this connection
	agentIds := s.agents.GetAgentIdsByConnection(conn)
	if len(agentIds) == 0 {
		s.logger.Warn("No agents found for connection",
			zap.Any("connection", conn))
		return
	}

	// Get the first agent's info
	agentId := agentIds[0]
	agentInfo := s.agents.GetAgentInfo(agentId)
	if agentInfo == nil {
		s.logger.Warn("No agent info found",
			zap.String("agent_id", agentId.String()))
		return
	}

	// Remove the connection
	s.agents.RemoveConnection(conn)
}

func (s *Server) onMessage(ctx context.Context, conn types.Connection, message *protobufs.AgentToServer) *protobufs.ServerToAgent {
	// Get agent info for this connection
	agentIds := s.agents.GetAgentIdsByConnection(conn)
	if len(agentIds) == 0 {
		s.logger.Warn("No agents found for connection",
			zap.Any("connection", conn))
		return nil
	}

	// Get the first agent's info
	agentId := agentIds[0]
	agentInfo := s.agents.GetAgentInfo(agentId)
	if agentInfo == nil {
		s.logger.Warn("No agent info found",
			zap.String("agent_id", agentId.String()))
		return nil
	}

	// Process the message
	response := &protobufs.ServerToAgent{}
	agentInfo.Agent.UpdateStatus(message, response)
	return response
}

func (s *Server) GetEffectiveConfig(agentId uuid.UUID) (string, error) {
	agent := s.agents.FindAgent(agentId)
	if agent != nil {
		return agent.EffectiveConfig, nil
	}
	return "", fmt.Errorf("agent %s not found", agentId)
}

func (s *Server) UpdateConfig(agentId uuid.UUID, config map[string]interface{}, notifyNextStatusUpdate chan<- struct{}) error {
	agent := s.agents.FindAgent(agentId)
	if agent == nil {
		return fmt.Errorf("agent %s not found", agentId)
	}

	configByte, err := json.Marshal(config)
	if err != nil {
		return err
	}

	configMap := &protobufs.AgentConfigMap{
		ConfigMap: map[string]*protobufs.AgentConfigFile{
			"": {Body: configByte},
		},
	}

	s.agents.SetCustomConfigForAgent(agentId, configMap, notifyNextStatusUpdate)
	return nil
}

func (s *Server) ListAgents() map[uuid.UUID]*Agent {
	return s.agents.GetAllAgentsReadonlyClone()
}

func (s *Server) GetAgentsByOrganization(organizationId string) map[uuid.UUID]*Agent {
	return s.agents.GetAgentsByOrganization(organizationId)
}

func (s *Server) GetAgentsByGroup(groupId string) map[uuid.UUID]*Agent {
	return s.agents.GetAgentsByGroup(groupId)
}

func (s *Server) GetAgentsByDeployment(deploymentId string) map[uuid.UUID]*Agent {
	return s.agents.GetAgentsByDeployment(deploymentId)
}
