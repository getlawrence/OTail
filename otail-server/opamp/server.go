package opamp

import (
	"context"
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

func NewServer(agents *Agents, logger *zap.Logger) (*Server, error) {
	s := &Server{
		logger: logger,
		agents: agents,
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

func (s *Server) UpdateConfig(agentId uuid.UUID, config map[string]interface{}) error {
	configMap := &protobufs.AgentConfigMap{
		ConfigMap: make(map[string]*protobufs.AgentConfigFile),
	}

	for key, value := range config {
		strValue, ok := value.(string)
		if !ok {
			strValue = fmt.Sprintf("%v", value)
		}

		configMap.ConfigMap[key] = &protobufs.AgentConfigFile{
			Body: []byte(strValue),
		}
	}

	s.agents.SetCustomConfigForAgent(agentId, configMap, nil)
	return nil
}

func (s *Server) ListAgents() map[uuid.UUID]*Agent {
	return s.agents.GetAllAgentsReadonlyClone()
}
