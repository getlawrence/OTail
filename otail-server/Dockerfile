# Build stage
FROM golang:1.22.0-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Create source directory for development mounting
RUN mkdir -p /src

# Expose port
EXPOSE 8080
EXPOSE 4320

# Run the application
CMD ["./main"]
