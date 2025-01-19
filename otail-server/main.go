package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/mottibec/otail-server/pkg/agents"
	"github.com/mottibec/otail-server/pkg/agents/clickhouse"
	"github.com/mottibec/otail-server/pkg/agents/opamp"
	"github.com/mottibec/otail-server/pkg/agents/tailsampling"
	"github.com/mottibec/otail-server/pkg/auth"
	"github.com/mottibec/otail-server/pkg/organization"
	"github.com/mottibec/otail-server/pkg/telemetry"
	"github.com/mottibec/otail-server/pkg/user"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	// Initialize telemetry
	ctx := context.Background()
	telemetryConfig := telemetry.Config{
		ServiceName:    "otail-server",
		ServiceVersion: "1.0.0",
		Environment:    os.Getenv("ENVIRONMENT"),
		OTLPEndpoint:   os.Getenv("OTLP_ENDPOINT"),
	}
	cleanup, err := telemetry.InitTelemetry(ctx, telemetryConfig)
	if err != nil {
		logger.Fatal("Failed to initialize telemetry", zap.Error(err))
	}
	defer cleanup(ctx)

	// Initialize metrics
	_, err = telemetry.InitMetrics(ctx)
	if err != nil {
		logger.Fatal("Failed to initialize metrics", zap.Error(err))
	}

	mongoUri, mongoDb := os.Getenv("MONGODB_URI"), os.Getenv("MONGODB_DB")
	// Initialize user store
	userStore, err := user.NewMongoUserStore(mongoUri, mongoDb)
	if err != nil {
		logger.Fatal("Failed to create user store", zap.Error(err))
	}
	defer userStore.Close()

	orgStore, err := organization.NewMongoOrgStore(mongoUri, mongoDb)
	if err != nil {
		logger.Fatal("Failed to create org store", zap.Error(err))
	}
	defer orgStore.Close(context.Background())

	// Initialize services
	orgService := organization.NewOrgService(orgStore)
	userSvc := user.NewUserService(userStore, orgService)

	// Create token verification function
	verifyToken := func(token string) (string, error) {
		apiToken, err := orgService.ValidateAPIToken(context.Background(), token)
		if err != nil {
			return "", err
		}
		return apiToken.OrganizationID, nil
	}

	// Initialize OPAMP server
	opampServer, err := opamp.NewServer(&opamp.AllAgents, verifyToken, logger)
	if err != nil {
		logger.Fatal("Failed to create OpAMP server", zap.Error(err))
	}

	// Start OPAMP server
	if err := opampServer.Start(); err != nil {
		logger.Fatal("Failed to start OpAMP server", zap.Error(err))
	}

	// Initialize ClickHouse client
	clickhouseClient, err := clickhouse.NewClient(os.Getenv("CLICKHOUSE_DSN"), logger)
	if err != nil {
		logger.Error("Failed to create ClickHouse client", zap.Error(err))
	}
	defer clickhouseClient.Close()

	// Create the tail sampling service
	samplingService := tailsampling.NewService(logger, opampServer)

	// Create HTTP router
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*", "http://127.0.0.1:*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Add OpenTelemetry middleware
	r.Use(func(next http.Handler) http.Handler {
		return otelhttp.NewHandler(next, "http_server")
	})

	// Add authentication routes
	userHandler := user.NewUserHandler(userSvc, logger)
	r.Route("/api/v1/auth", userHandler.RegisterRoutes)

	// Add organization routes with auth middleware
	orgHandler := organization.NewOrgHandler(orgService, logger)
	agentsHandler := agents.NewHandler(logger, samplingService, clickhouseClient)

	// Protected routes (auth required)
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(auth.AuthMiddleware())
		r.Route("/organization", orgHandler.RegisterRoutes)
		r.Route("/agents", agentsHandler.RegisterRoutes)
	})

	// Create HTTP server
	httpServer := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start HTTP server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)
	<-sigChan

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Error("HTTP server shutdown error", zap.Error(err))
	}

	if err := opampServer.Stop(ctx); err != nil {
		logger.Error("OpAMP server shutdown error", zap.Error(err))
	}
}
