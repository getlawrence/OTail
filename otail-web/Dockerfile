# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Install development dependencies
RUN apk add --no-cache git

# Set the working directory in the container
WORKDIR /app

# Copy package files and install dependencies with cache mount
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

# The source code will be mounted at runtime via docker-compose
# The node_modules are excluded from the mount to use the container's modules

EXPOSE 3000

# Use vite dev server with host flag and force watching
CMD ["npm", "run", "dev", "--", "--host"]