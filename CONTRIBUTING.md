# Contributing to OTail

We love your input! We want to make contributing to OTail as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Repository Structure

OTail is organized as a monorepo with the following main components:

- `helm/` - Helm charts for deploying OTail
- `otail-web/` - Web UI (React/TypeScript)
- `otail-server/` - API server (Go)
- `otail-col/` - OpenTelemetry collector
- `clickhouse/` - ClickHouse database configuration
- `prometheus/` - Prometheus monitoring configuration
- `opampsupervisor/` - OpAMP supervisor for agent management
- `docker-compose.yml` - Local development environment
- `build-images.sh` - Script for building Docker images
- `local-values.yaml` - Local Helm values configuration

## We Develop with Github
We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Component-Specific Guidelines

### Helm Charts
- Follow [Helm best practices](https://helm.sh/docs/chart_best_practices/)
- Use `helm lint` to validate chart structure
- Test changes with `helm template` and `helm install --dry-run`
- Update version numbers in Chart.yaml when making changes

### Frontend (otail-web)
- Follow the existing TypeScript configuration
- Use functional components with hooks
- Write unit tests for new components
- Follow the established styling patterns

### Backend (otail-server)
- Follow [Go best practices](https://golang.org/doc/effective_go)
- Write unit tests for new functionality
- Update API documentation when changing endpoints
- Use the existing logging patterns

### OpenTelemetry Collector (otail-col)
- Follow [OpenTelemetry Collector best practices](https://opentelemetry.io/docs/collector/configuration/)
- Test configuration changes with sample data
- Document any new processors or receivers

### Infrastructure Components
- `clickhouse/` - Database configuration and migrations
- `prometheus/` - Monitoring and alerting setup
- `opampsupervisor/` - Agent management configuration

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/yourusername/otail/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)
- Which component(s) are affected (web, server, collector, helm chart, etc.)

## Use a Consistent Coding Style

* Use 2 spaces for indentation rather than tabs
* Follow the existing code style in each component
* Use `helm lint` for Helm charts
* Use `gofmt` for Go code
* Use `prettier` for frontend code

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/otail.git
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

## License
By contributing, you agree that your contributions will be licensed under its MIT License. 