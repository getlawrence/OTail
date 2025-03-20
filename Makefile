.PHONY: setup dev build test lint clean help

# Default target
.DEFAULT_GOAL := help

# Variables
DOCKER_COMPOSE := docker compose
HELM := helm
KUBECTL := kubectl

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk '/^[a-zA-Z\-_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  %-20s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

setup: ## Set up the development environment
	@echo "Setting up development environment..."
	@cp -n .env.example .env || true
	@echo "Development environment setup complete"

dev: ## Start the development environment
	@echo "Starting development environment..."
	@$(DOCKER_COMPOSE) up -d
	@echo "Development environment started"

build: ## Build all components
	@echo "Building components..."
	@./build-images.sh
	@echo "Build complete"

test: ## Run tests
	@echo "Running tests..."
	@cd otail-web && npm test
	@cd otail-server && go test ./...
	@echo "Tests complete"

lint: ## Run linters
	@echo "Running linters..."
	@cd otail-web && npm run lint
	@cd otail-server && go vet ./...
	@$(HELM) lint helm/otail
	@echo "Linting complete"

clean: ## Clean up development environment
	@echo "Cleaning up..."
	@$(DOCKER_COMPOSE) down -v
	@rm -rf node_modules
	@rm -rf dist
	@echo "Cleanup complete"

helm-install: ## Install the Helm chart
	@echo "Installing Helm chart..."
	@$(HELM) install otail helm/otail --namespace otail --create-namespace

helm-upgrade: ## Upgrade the Helm chart
	@echo "Upgrading Helm chart..."
	@$(HELM) upgrade otail helm/otail --namespace otail

helm-uninstall: ## Uninstall the Helm chart
	@echo "Uninstalling Helm chart..."
	@$(HELM) uninstall otail -n otail

k8s-delete-ns: ## Delete the Kubernetes namespace
	@echo "Deleting namespace..."
	@$(KUBECTL) delete namespace otail

.PHONY: helm-install helm-upgrade helm-uninstall k8s-delete-ns 