# OTail - OpenTelemetry Tail Sampling

OTail is a user-friendly web interface for creating and managing OpenTelemetry tail sampling agents. It provides a visual way to configure complex sampling policies without having to write YAML directly.

## UI
<img width="1664" alt="Screenshot 2025-01-21 at 16 46 13" src="https://github.com/user-attachments/assets/f6c2e316-a365-4503-afef-f8298e298d87" />

## Features

- **Visual Policy Configuration**: Easily create and manage sampling policies through an intuitive UI
- **Configuration Validation**: Validate sampling policy configurations before applying
- **View Agent Effective Config**: View the effective configuration of the agent
- **Send Updated Config To Agent**: Send the updated YAML configuration to the agent

## Repository Structure

```
.
├── helm/              # Helm charts for deploying OTail
│   └── otail/        # Main OTail Helm chart
├── otail-web/        # Web UI (React/TypeScript)
├── otail-server/     # API server (Go)
├── otail-col/        # OpenTelemetry collector
├── clickhouse/       # ClickHouse database configuration
├── prometheus/       # Prometheus monitoring configuration
├── opampsupervisor/  # OpAMP supervisor for agent management
├── docker-compose.yml    # Local development environment
├── build-images.sh      # Script for building Docker images
└── local-values.yaml    # Local Helm values configuration
```

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Docker
- Node.js 18+ (for frontend development)
- Go 1.21+ (for backend development)

## Quick Start

1. Add the Helm repository:
```bash
helm repo add otail https://getlawrence.github.io/otail
helm repo update
```

2. Install OTail:
```bash
helm install otail otail/otail --namespace otail
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/mottibec/otail.git
cd otail
```

2. Set up your development environment:
```bash
# Copy environment file
cp .env.example .env

# Start local development
docker compose up -d
```

3. Access the application:
- Web UI: http://localhost:3000
- API Server: http://localhost:8080

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React TypeScript and Go
- Uses Monaco Editor for YAML editing
- Inspired by OpenTelemetry Collector configuration needs
