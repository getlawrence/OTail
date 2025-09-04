# OTail Server

OTail Server is a backend service for configuring OpenTelemetry tail sampling processors. It uses the OpenTelemetry Agent Management Protocol (OPAmp) to communicate with OpenTelemetry collectors and manage their tail sampling configurations.

## Features

- OPAmp server implementation for collector communication
- Configuration management for tail sampling processors
- REST API for UI integration

## Getting Started

### Prerequisites

- Go 1.21 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/getlawrence/otail-server.git
```

2. Install dependencies:
```bash
go mod download
```

3. Run the server:
```bash
go run main.go
```

## Architecture

The server implements the OPAmp protocol to communicate with OpenTelemetry collectors. It provides:

- OPAmp server on port 4320 for collector connections
- Configuration management for tail sampling processors
- State management for connected collectors

## Development

To contribute to the project:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
