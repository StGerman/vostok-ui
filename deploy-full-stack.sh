#!/bin/bash

echo "🚀 Deploying Full Vostok Stack (UI + API + OpenLIT + OTEL) to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="34.225.86.252"
EC2_USER="ec2-user"
STACK_NAME="vostok-full-stack"

echo -e "${BLUE}📋 Full Stack Components:${NC}"
echo -e "${BLUE}   • Vostok Chat UI (port 80)${NC}"
echo -e "${BLUE}   • Vostok RAG API (port 8000)${NC}"
echo -e "${BLUE}   • OpenLIT Dashboard (port 3000)${NC}"
echo -e "${BLUE}   • OTEL Collector (port 4317/4318)${NC}"
echo -e "${BLUE}   • Nginx Reverse Proxy (port 8080)${NC}"
echo ""

# Check if .env.full-stack exists
if [ ! -f ".env.full-stack" ]; then
    echo -e "${RED}❌ .env.full-stack file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.full-stack and configure your API keys:${NC}"
    echo "cp .env.full-stack .env"
    echo "# Edit .env with your actual API keys"
    exit 1
fi

echo -e "${YELLOW}1. Building UI production assets...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ UI build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ UI build completed${NC}"

echo -e "${YELLOW}2. Creating full-stack deployment package...${NC}"
tar -czf ${STACK_NAME}.tar.gz \
    dist/ \
    Dockerfile.production \
    docker-compose.full-stack.yml \
    nginx-proxy.conf \
    otel-collector-config.yaml \
    .env.full-stack

echo -e "${YELLOW}3. Uploading to EC2...${NC}"
scp ${STACK_NAME}.tar.gz $EC2_USER@$EC2_HOST:~/

echo -e "${YELLOW}4. Deploying full stack on EC2...${NC}"
ssh $EC2_USER@$EC2_HOST << 'EOF'
    # Stop any existing containers
    echo "🛑 Stopping existing containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true

    # Clean up old deployments
    rm -rf vostok-full-stack/
    mkdir -p vostok-full-stack

    # Extract deployment files
    tar -xzf vostok-full-stack.tar.gz -C vostok-full-stack/
    cd vostok-full-stack

    # Copy environment file
    cp .env.full-stack .env

    # Pull latest images from GitHub Container Registry
    echo "📦 Pulling latest images..."
    docker pull ghcr.io/openlit/openlit:latest
    docker pull otel/opentelemetry-collector-contrib:0.94.0
    docker pull ghcr.io/stgerman/vostok-rag-api:latest || echo "⚠️  Vostok API image not found in registry, will build locally"
    docker pull ghcr.io/stgerman/vostok-chat-ui:latest || echo "⚠️  Building UI image locally..."

    # Build UI image if not in registry
    if ! docker image inspect ghcr.io/stgerman/vostok-chat-ui:latest > /dev/null 2>&1; then
        echo "🔨 Building UI image locally..."
        docker build -f Dockerfile.production -t ghcr.io/stgerman/vostok-chat-ui:latest .
    fi

    # Start all services
    echo "🚀 Starting full Vostok stack..."
    docker-compose -f docker-compose.full-stack.yml up -d

    # Wait for services to start
    echo "⏳ Waiting for services to start..."
    sleep 30

    # Check container status
    echo "📊 Container status:"
    docker-compose -f docker-compose.full-stack.yml ps

    # Show service URLs
    echo ""
    echo "🌐 Service URLs:"
    echo "   • Main UI:      http://34.225.86.252"
    echo "   • Nginx Proxy:  http://34.225.86.252:8080"
    echo "   • API:          http://34.225.86.252:8000"
    echo "   • OpenLIT:      http://34.225.86.252:3000"
    echo "   • OTEL gRPC:    http://34.225.86.252:4317"
    echo "   • OTEL HTTP:    http://34.225.86.252:4318"
    echo ""

    echo "🎉 Full stack deployment completed!"
EOF

echo -e "${YELLOW}5. Cleaning up local files...${NC}"
rm ${STACK_NAME}.tar.gz

echo -e "${YELLOW}6. Testing full stack deployment...${NC}"
sleep 15  # Give containers more time to fully start

# Test UI
echo -e "${YELLOW}Testing UI...${NC}"
if curl -f -s http://34.225.86.252/ > /dev/null; then
    echo -e "${GREEN}✅ UI is responding!${NC}"
else
    echo -e "${RED}❌ UI not responding${NC}"
fi

# Test API
echo -e "${YELLOW}Testing API...${NC}"
if curl -f -s http://34.225.86.252:8000/health > /dev/null; then
    echo -e "${GREEN}✅ API is responding!${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
fi

# Test OpenLIT
echo -e "${YELLOW}Testing OpenLIT Dashboard...${NC}"
if curl -f -s http://34.225.86.252:3000/ > /dev/null; then
    echo -e "${GREEN}✅ OpenLIT Dashboard is responding!${NC}"
else
    echo -e "${RED}❌ OpenLIT Dashboard not responding${NC}"
fi

# Test OTEL
echo -e "${YELLOW}Testing OTEL Collector...${NC}"
if curl -f -s http://34.225.86.252:8888/metrics > /dev/null; then
    echo -e "${GREEN}✅ OTEL Collector metrics are available!${NC}"
else
    echo -e "${RED}❌ OTEL Collector not responding${NC}"
fi

# Test Nginx Proxy
echo -e "${YELLOW}Testing Nginx Proxy...${NC}"
if curl -f -s http://34.225.86.252:8080/health > /dev/null; then
    echo -e "${GREEN}✅ Nginx Proxy is responding!${NC}"
else
    echo -e "${RED}❌ Nginx Proxy not responding${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Full Vostok Stack Deployment Completed!${NC}"
echo ""
echo -e "${GREEN}🌐 Access your services:${NC}"
echo -e "${GREEN}   • 📱 Chat Interface:    http://34.225.86.252${NC}"
echo -e "${GREEN}   • 🔗 Unified Access:    http://34.225.86.252:8080${NC}"
echo -e "${GREEN}   •     ├─ Chat UI:       http://34.225.86.252:8080/${NC}"
echo -e "${GREEN}   •     ├─ API:           http://34.225.86.252:8080/api/${NC}"
echo -e "${GREEN}   •     └─ OpenLIT:       http://34.225.86.252:8080/openlit/${NC}"
echo -e "${GREEN}   • 🚀 API Direct:        http://34.225.86.252:8000${NC}"
echo -e "${GREEN}   • 📊 OpenLIT Direct:    http://34.225.86.252:3000${NC}"
echo -e "${GREEN}   • 📈 OTEL Metrics:      http://34.225.86.252:8888/metrics${NC}"
echo ""
echo -e "${BLUE}🔧 Management commands:${NC}"
echo -e "${BLUE}   • View logs: ssh $EC2_USER@$EC2_HOST 'cd vostok-full-stack && docker-compose -f docker-compose.full-stack.yml logs -f'${NC}"
echo -e "${BLUE}   • Restart:   ssh $EC2_USER@$EC2_HOST 'cd vostok-full-stack && docker-compose -f docker-compose.full-stack.yml restart'${NC}"
echo -e "${BLUE}   • Stop:      ssh $EC2_USER@$EC2_HOST 'cd vostok-full-stack && docker-compose -f docker-compose.full-stack.yml down'${NC}"
