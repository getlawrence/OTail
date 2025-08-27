# OTail - OpenTelemetry Tail Sampling

## Project Overview

OTail is a comprehensive platform for managing OpenTelemetry tail sampling agents through an intuitive web interface. It provides visual policy configuration, real-time agent management, and seamless deployment capabilities for OpenTelemetry-based observability pipelines.

## Architecture

OTail follows a microservices architecture with the following core components:

### Core Services
- **Frontend (otail-web)**: React-based web UI for policy configuration and agent management
- **Backend (otail-server)**: Go-based API server handling business logic and agent communication
- **Collector (otail-col)**: OpenTelemetry collector with OpAMP integration for dynamic configuration
- **Database Layer**: ClickHouse for telemetry data storage, MongoDB for application data
- **Monitoring Stack**: Prometheus, Grafana, and Jaeger for observability

### Communication Flow
```
Applications → OTLP → Collector → ClickHouse
                    ↓
                OpAMP Server → Agent Management
                    ↓
                Web UI ← Backend API
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives with Tailwind CSS
- **State Management**: React Context + Hooks
- **Code Editor**: Monaco Editor for YAML configuration
- **Testing**: Jest, Playwright, Storybook
- **WASM Integration**: Go-based OTTL evaluator compiled to WebAssembly

### Backend
- **Language**: Go 1.22+
- **Web Framework**: Chi router with CORS support
- **Database Drivers**: 
  - ClickHouse Go driver v2.30.0
  - MongoDB Go driver v2.0.0
- **Authentication**: JWT-based with bcrypt password hashing
- **OpAMP Integration**: OpenTelemetry OpAMP Go client v0.17.0
- **Observability**: OpenTelemetry SDK with OTLP exporters
- **Logging**: Structured logging with Zap

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with Helm charts
- **Databases**: 
  - ClickHouse for time-series telemetry data
  - MongoDB for application metadata and user management
- **Monitoring**: 
  - Prometheus for metrics collection
  - Grafana for visualization
  - Jaeger for distributed tracing
- **Networking**: Ingress-NGINX for external access

## Project Structure

```
OTail/
├── otail-web/                 # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries and policy evaluators
│   │   ├── api/              # API client and type definitions
│   │   └── contexts/         # React context providers
│   ├── wasm/                 # WebAssembly modules (OTTL evaluator)
│   └── public/               # Static assets
├── otail-server/             # Backend Go API server
│   ├── pkg/
│   │   ├── agents/           # Agent management and OpAMP integration
│   │   ├── auth/             # Authentication middleware
│   │   ├── organization/     # Organization management
│   │   ├── user/             # User management
│   │   └── telemetry/        # OpenTelemetry integration
│   └── main.go               # Application entry point
├── otail-col/                # OpenTelemetry collector
│   ├── Dockerfile            # Collector container definition
│   └── supervisor_docker.yml # OpAMP supervisor configuration
├── helm/                     # Kubernetes deployment charts
│   └── otail/               # Main Helm chart with all components
├── clickhouse/               # Database configuration and initialization
├── prometheus/               # Monitoring configuration
├── docker-compose.yml        # Local development environment
└── Makefile                  # Development workflow automation
```

## Prerequisites

### Development Environment
- **Docker & Docker Compose**: For local development
- **Node.js**: 18+ for frontend development
- **Go**: 1.22+ for backend development
- **Make**: For build automation (optional)

### Production Deployment
- **Kubernetes**: 1.19+ cluster
- **Helm**: 3.0+ package manager
- **Ingress Controller**: NGINX Ingress Controller
- **Storage**: Persistent volume support

## Quick Start

### Local Development

1. **Clone and Setup**
   ```bash
   git clone https://github.com/mottibec/otail.git
   cd otail
   make setup
   ```

2. **Start Development Environment**
   ```bash
   make dev
   ```

3. **Access Services**
   - Web UI: http://localhost:3000
   - API Server: http://localhost:8080
   - Grafana: http://localhost:3001
   - Prometheus: http://localhost:9090
   - Jaeger: http://localhost:16686
   - ClickHouse: http://localhost:8123

### Production Deployment

1. **Add Helm Repository**
   ```bash
   helm repo add otail https://mottibec.github.io/otail
   helm repo update
   ```

2. **Install OTail**
   ```bash
   helm install otail otail/otail --namespace otail --create-namespace
   ```

3. **Access the Application**
   - Configure your ingress controller
   - Access via the configured domain

## Development Workflow

### Available Make Commands
```bash
make setup          # Initialize development environment
make dev            # Start local development stack
make build          # Build all Docker images
make test           # Run tests for all components
make lint           # Run linters and code quality checks
make clean          # Clean up development environment
```

### Frontend Development
```bash
cd otail-web
npm install         # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm test            # Run test suite
npm run test:e2e    # Run end-to-end tests
```

### Backend Development
```bash
cd otail-server
go mod download     # Download dependencies
go run main.go      # Run locally
go test ./...       # Run tests
go vet ./...        # Code quality checks
```

### Building and Testing
```bash
# Build all components
make build

# Run comprehensive tests
make test

# Code quality checks
make lint
```

## Configuration

### Environment Variables

#### Frontend
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_NO_BACKEND`: Disable backend integration for development
- `VITE_POSTHOG_KEY`: PostHog analytics key
- `VITE_POSTHOG_HOST`: PostHog instance URL

#### Backend
- `GO_ENV`: Environment (development/production)
- `CLICKHOUSE_DSN`: ClickHouse connection string
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: MongoDB database name
- `OTLP_ENDPOINT`: OTLP endpoint for telemetry

#### Collector
- `OPAMP_SERVER_ENDPOINT`: OpAMP server WebSocket endpoint
- `API_TOKEN`: Authentication token
- `AGENT_GROUP`: Agent group identifier
- `DEPLOYMENT`: Deployment identifier

### Helm Configuration
The Helm chart supports extensive customization through `values.yaml`:
- Resource limits and requests
- Ingress configuration
- Storage class selection
- Image registry and tags
- Environment-specific overrides

## Monitoring and Observability

### Metrics
- **Application Metrics**: Custom business metrics via OpenTelemetry
- **Infrastructure Metrics**: System and container metrics via Prometheus
- **Custom Dashboards**: Pre-configured Grafana dashboards for OTail components

### Logging
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Log Levels**: Configurable verbosity per component
- **Centralized Collection**: All logs available in ClickHouse

### Tracing
- **Distributed Tracing**: End-to-end request tracing via Jaeger
- **OTLP Integration**: Native OpenTelemetry protocol support
- **Custom Spans**: Business logic instrumentation

## Contributing

### Development Guidelines
1. Follow the existing code style and patterns
2. Write tests for new functionality
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all checks pass before submitting PRs

### Testing Strategy
- **Unit Tests**: Jest for frontend, Go testing for backend
- **Integration Tests**: Docker Compose-based test environment
- **End-to-End Tests**: Playwright for critical user workflows
- **Visual Regression**: Storybook and Chromatic for UI consistency

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure required ports are available
2. **Database Connection**: Check ClickHouse and MongoDB health
3. **OpAMP Connectivity**: Verify WebSocket endpoint accessibility
4. **Resource Limits**: Monitor Docker resource usage

### Debug Mode
Enable debug logging by setting appropriate log levels in environment variables or Helm values.

## License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and community support
- **Documentation**: Inline code documentation and component READMEs

