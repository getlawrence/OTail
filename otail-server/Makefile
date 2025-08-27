.PHONY: test test-cover test-race

# Run tests
test:
	go test -v ./...

# Run tests with coverage
test-cover:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Run tests with race detector
test-race:
	go test -v -race ./...

# Run tests with verbose output
test-v:
	go test -v ./...

# Run tests for a specific package
test-pkg:
	go test -v ./$(PKG)

# Run tests with testcontainers
test-containers:
	go test -v -tags=testcontainers ./... 