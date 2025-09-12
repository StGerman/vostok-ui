# Multi-stage build for Vostok Chat Interface
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Add labels for metadata
LABEL org.opencontainers.image.title="Vostok Chat Interface"
LABEL org.opencontainers.image.description="React + Tailwind CSS chat interface for Vostok RAG system"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/StGerman/vostok"

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the production app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Add labels
LABEL org.opencontainers.image.title="Vostok Chat Interface"
LABEL org.opencontainers.image.description="React + Tailwind CSS chat interface for Vostok RAG system"
LABEL org.opencontainers.image.version="1.0.0"

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.simple.conf /etc/nginx/conf.d/default.conf

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><head><title>Vostok Health</title></head><body><h1>Vostok UI is running!</h1><p id="timestamp"></p><script>document.getElementById("timestamp").textContent = "Timestamp: " + new Date().toISOString();</script></body></html>' > /usr/share/nginx/html/health.html

# Expose port 80
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health.html || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
