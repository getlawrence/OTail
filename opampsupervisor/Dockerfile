# Build stage
FROM golang:1.22.0-alpine AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache git make

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o opampsupervisor .

# Get OpenTelemetry collector
FROM otel/opentelemetry-collector-contrib:latest AS otel

# Final stage
FROM alpine:latest

# Copy from builder
COPY --from=builder /build/opampsupervisor .
COPY --from=builder /build/examples/supervisor_docker.yaml .

# Copy from OpenTelemetry
COPY --from=otel /otelcol-contrib /otelcol-contrib

EXPOSE 4317 4318

ENTRYPOINT ["./opampsupervisor", "--config", "supervisor_docker.yaml"]
