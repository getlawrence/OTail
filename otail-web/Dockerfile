# Build stage
FROM node:18-alpine AS builder

RUN apk add --no-cache git make g++ python3 go

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY . .

# Add build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_NO_AUTH_REQUIRED
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ARG VITE_FORCE_POSTHOG

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_NO_AUTH_REQUIRED=$VITE_NO_AUTH_REQUIRED
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST
ENV VITE_FORCE_POSTHOG=$VITE_FORCE_POSTHOG

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]