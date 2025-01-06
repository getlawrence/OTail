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

func NewServer(agents *Agents, verifyToken func(string) (string, error), logger *zap.Logger) (*Server, error) {
	s := &Server{
		logger:      logger,
		agents:      agents,
		verifyToken: verifyToken,
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
					_, err := s.verifyToken(token)
					if err != nil {
						s.logger.Error("Invalid token", zap.Error(err))
						return types.ConnectionResponse{Accept: false}
					}

					return types.ConnectionResponse{
						Accept: true,
						ConnectionCallbacks: server.ConnectionCallbacksStruct{
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
	s.agents.RemoveConnection(conn)
}

func (s *Server) onMessage(ctx context.Context, conn types.Connection, msg *protobufs.AgentToServer) *protobufs.ServerToAgent {
	response := &protobufs.ServerToAgent{}
	instanceId := uuid.UUID(msg.InstanceUid)
	agent := s.agents.FindOrCreateAgent(instanceId, conn)
	if agent != nil {
		agent.UpdateStatus(msg, response)
	}
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
