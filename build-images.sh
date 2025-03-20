#!/bin/bash

# Exit on error
set -e

# Registry configuration
REGISTRY="mottibec123/otail"  # Docker Hub registry
VERSION="latest"

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo "Error: Not logged in to Docker Hub. Please run 'docker login' first."
    exit 1
fi

# Build and push frontend
echo "Building frontend..."
docker build -t ${REGISTRY}:web-${VERSION} ./otail-web
echo "Pushing frontend image..."
docker push ${REGISTRY}:web-${VERSION}

# Build and push backend
echo "Building backend..."
docker build -t ${REGISTRY}:server-${VERSION} ./otail-server
echo "Pushing backend image..."
docker push ${REGISTRY}:server-${VERSION}

# Build and push opampsupervisor
echo "Building opampsupervisor..."
docker build -t ${REGISTRY}:opampsupervisor-${VERSION} ./opampsupervisor
echo "Pushing opampsupervisor image..."
docker push ${REGISTRY}:opampsupervisor-${VERSION}

echo "All images built and pushed successfully!" 