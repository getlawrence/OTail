package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/mottibec/otail-server/api"
	"github.com/mottibec/otail-server/auth"
	"github.com/mottibec/otail-server/clickhouse"
	"github.com/mottibec/otail-server/opamp"
	"github.com/mottibec/otail-server/tailsampling"
	"go.uber.org/zap"
)

// Add this middleware function
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	// Initialize user store
	userStore := auth.NewMemoryUserStore()

	// Initialize agents manager
	agents := &opamp.AllAgents

	// Create token verification function
	verifyToken := func(token string) (string, error) {
		user, err := userStore.GetUserByToken(token)
		if err != nil {
			return "", err
		}
		return user.ID, nil
	}

	// Initialize OPAMP server
	opampServer, err := opamp.NewServer(agents, verifyToken, logger)
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
		logger.Fatal("Failed to create ClickHouse client", zap.Error(err))
	}
	defer clickhouseClient.Close()

	// Create the tail sampling service
	samplingService := tailsampling.NewService(logger, opampServer)

	// Create HTTP router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Add authentication routes
	authHandler := api.NewAuthHandler(userStore, logger)
	r.Route("/api/auth", authHandler.RegisterRoutes)

	// Create the HTTP API handler
	apiHandler := api.NewHandler(logger, samplingService, clickhouseClient)
	apiHandler.SetupRoutes(r)

	// Apply CORS middleware
	corsRouter := corsMiddleware(r)

	// Create HTTP server with CORS middleware
	httpServer := &http.Server{
		Addr:    ":8080",
		Handler: corsRouter,
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
