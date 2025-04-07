package testutils

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

// TestRequest represents a test HTTP request
type TestRequest struct {
	Method    string
	Path      string
	Body      interface{}
	Headers   map[string]string
	Query     map[string]string
	URLParams map[string]string
}

// TestResponse represents a test HTTP response
type TestResponse struct {
	StatusCode int
	Body       interface{}
}

// MakeTestRequest creates and executes a test HTTP request
func MakeTestRequest(t *testing.T, router chi.Router, req TestRequest) *httptest.ResponseRecorder {
	// Convert body to JSON if provided
	var bodyBytes []byte
	if req.Body != nil {
		var err error
		bodyBytes, err = json.Marshal(req.Body)
		if err != nil {
			t.Fatalf("Failed to marshal request body: %v", err)
		}
	}

	// Create the request
	httpReq, err := http.NewRequest(req.Method, req.Path, bytes.NewBuffer(bodyBytes))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	// Add headers
	if req.Headers != nil {
		for key, value := range req.Headers {
			httpReq.Header.Set(key, value)
		}
	}

	// Add query parameters
	if req.Query != nil {
		q := httpReq.URL.Query()
		for key, value := range req.Query {
			q.Add(key, value)
		}
		httpReq.URL.RawQuery = q.Encode()
	}

	// Add URL parameters
	if req.URLParams != nil {
		ctx := chi.NewRouteContext()
		for key, value := range req.URLParams {
			ctx.URLParams.Add(key, value)
		}
		httpReq = httpReq.WithContext(context.WithValue(httpReq.Context(), chi.RouteCtxKey, ctx))
	}

	// Create response recorder
	w := httptest.NewRecorder()

	// Serve the request
	router.ServeHTTP(w, httpReq)

	return w
}

// ParseResponseBody parses the response body into the provided interface
func ParseResponseBody(t *testing.T, w *httptest.ResponseRecorder, v interface{}) {
	if err := json.Unmarshal(w.Body.Bytes(), v); err != nil {
		t.Fatalf("Failed to parse response body: %v", err)
	}
}

// AssertResponse asserts that the response matches the expected values
func AssertResponse(t *testing.T, w *httptest.ResponseRecorder, expected TestResponse) {
	// Check status code
	if w.Code != expected.StatusCode {
		t.Errorf("Expected status code %d, got %d", expected.StatusCode, w.Code)
	}

	// Check body if provided
	if expected.Body != nil {
		var actual interface{}
		if err := json.Unmarshal(w.Body.Bytes(), &actual); err != nil {
			t.Fatalf("Failed to parse response body: %v", err)
		}

		expectedJSON, err := json.Marshal(expected.Body)
		if err != nil {
			t.Fatalf("Failed to marshal expected body: %v", err)
		}

		actualJSON, err := json.Marshal(actual)
		if err != nil {
			t.Fatalf("Failed to marshal actual body: %v", err)
		}

		if string(expectedJSON) != string(actualJSON) {
			t.Errorf("Expected body %s, got %s", string(expectedJSON), string(actualJSON))
		}
	}
}

// TestDBConfig holds the configuration for the test database
type TestDBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// SetupTestDB creates a test database container and returns its configuration
func SetupTestDB(t *testing.T) (*TestDBConfig, func()) {
	ctx := context.Background()

	// Create ClickHouse container request
	req := testcontainers.ContainerRequest{
		Image:        "clickhouse/clickhouse-server:latest",
		ExposedPorts: []string{"9000/tcp"},
		Env: map[string]string{
			"CLICKHOUSE_DB":       "test",
			"CLICKHOUSE_USER":     "default",
			"CLICKHOUSE_PASSWORD": "",
		},
		WaitingFor: wait.ForLog("Ready for connections"),
	}

	// Start the container
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("Failed to start container: %v", err)
	}

	// Get the container's host and port
	host, err := container.Host(ctx)
	if err != nil {
		t.Fatalf("Failed to get container host: %v", err)
	}

	port, err := container.MappedPort(ctx, "9000")
	if err != nil {
		t.Fatalf("Failed to get container port: %v", err)
	}

	// Create cleanup function
	cleanup := func() {
		if err := container.Terminate(ctx); err != nil {
			t.Fatalf("Failed to terminate container: %v", err)
		}
	}

	// Return the database configuration
	config := &TestDBConfig{
		Host:     host,
		Port:     port.Port(),
		User:     "default",
		Password: "",
		DBName:   "test",
	}

	return config, cleanup
}

// CreateTestDB creates a test database and returns a connection
func CreateTestDB(t *testing.T, config *TestDBConfig) *sql.DB {
	dsn := fmt.Sprintf("tcp://%s:%s?username=%s&password=%s&database=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName)

	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(5)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Hour)

	// Test the connection
	if err := db.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	return db
}

// LoadTestData loads test data into the database
func LoadTestData(t *testing.T, db *sql.DB, dataFile string) {
	// Read the test data file
	data, err := os.ReadFile(dataFile)
	if err != nil {
		t.Fatalf("Failed to read test data file: %v", err)
	}

	// Execute the SQL statements
	if _, err := db.Exec(string(data)); err != nil {
		t.Fatalf("Failed to load test data: %v", err)
	}
}
