package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/mottibec/otail-server/api"
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
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	// Create a context that we'll cancel when we need to shut down
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize OPAmp server
	agents := &opamp.AllAgents
	opampServer, err := opamp.NewServer(agents, logger)
	if err != nil {
		logger.Fatal("Failed to create OpAMP server", zap.Error(err))
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
	router := mux.NewRouter()

	// Create the HTTP API handler
	apiHandler := api.NewHandler(logger, samplingService, clickhouseClient)
	apiHandler.SetupRoutes(router)

	// Apply CORS middleware
	corsRouter := corsMiddleware(router)

	// Create HTTP server with CORS middleware
	httpServer := &http.Server{
		Addr:    ":8080",
		Handler: corsRouter,
	}

	// Start the OPAmp server
	if err := opampServer.Start(); err != nil {
		logger.Fatal("Failed to start OPAmp server", zap.Error(err))
	}

	// Start HTTP server in a goroutine
	go func() {
		logger.Info("Starting HTTP server on :8080")
		if err := httpServer.ListenAndServe(); err != http.ErrServerClosed {
			logger.Error("HTTP server error", zap.Error(err))
		}
	}()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	logger.Info("Shutting down...")

	// Shutdown HTTP server
	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Error("Error shutting down HTTP server", zap.Error(err))
	}

	// Stop the OPAmp server
	if err := opampServer.Stop(ctx); err != nil {
		logger.Error("Error stopping OPAmp server", zap.Error(err))
	}
}
