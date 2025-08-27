FROM otel/opentelemetry-collector-opampsupervisor:0.131.0 as supervisor

# Get OpenTelemetry collector
FROM otel/opentelemetry-collector-contrib:0.131.1 AS otel

# Final stage
FROM alpine:latest

# Copy from builder - use the correct source path
COPY --from=supervisor /usr/local/bin/opampsupervisor ./opampsupervisor
COPY supervisor_docker.yml .
COPY collector_config.yml .

# Copy from OpenTelemetry
COPY --from=otel /otelcol-contrib /otelcol-contrib

EXPOSE 4317 4318

ENTRYPOINT ["./opampsupervisor", "--config", "supervisor_docker.yml"]
