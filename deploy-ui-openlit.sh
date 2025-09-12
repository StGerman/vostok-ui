#!/bin/bash

echo "🚀 Deploying Vostok UI + OpenLIT Stack to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="34.225.86.252"
EC2_USER="ec2-user"

echo -e "${BLUE}📋 Stack Components:${NC}"
echo -e "${BLUE}   • Vostok Chat UI (port 80) - built locally${NC}"
echo -e "${BLUE}   • OpenLIT Dashboard (port 3000)${NC}"
echo -e "${BLUE}   • OTEL Collector (port 4317/4318)${NC}"
echo ""

echo -e "${YELLOW}1. Building UI production assets...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ UI build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ UI build completed${NC}"

echo -e "${YELLOW}2. Creating deployment package...${NC}"
tar -czf vostok-ui-openlit.tar.gz \
    dist/ \
    Dockerfile.production \
    docker-compose.local-build.yml \
    nginx.simple.conf \
    otel-collector-config.yaml \
    .env

echo -e "${YELLOW}3. Uploading to EC2...${NC}"
scp vostok-ui-openlit.tar.gz $EC2_USER@$EC2_HOST:~/

echo -e "${YELLOW}4. Deploying on EC2...${NC}"
ssh $EC2_USER@$EC2_HOST << 'EOF'
    # Stop any existing containers
    echo "🛑 Stopping existing containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true

    # Clean up
    rm -rf vostok-ui-openlit/
    mkdir -p vostok-ui-openlit

    # Extract deployment files
    tar -xzf vostok-ui-openlit.tar.gz -C vostok-ui-openlit/
    cd vostok-ui-openlit

    # Pull OpenLIT and OTEL images
    echo "📦 Pulling images..."
    docker pull ghcr.io/openlit/openlit:latest
    docker pull otel/opentelemetry-collector-contrib:0.94.0

    # Build and start services
    echo "🚀 Starting services..."
    docker-compose -f docker-compose.local-build.yml up -d --build

    # Wait for services
    echo "⏳ Waiting for services to start..."
    sleep 20

    # Check status
    echo "📊 Container status:"
    docker-compose -f docker-compose.local-build.yml ps

    echo "🎉 Deployment completed!"
EOF

echo -e "${YELLOW}5. Cleaning up...${NC}"
rm vostok-ui-openlit.tar.gz

echo -e "${YELLOW}6. Testing deployment...${NC}"
sleep 10

# Test UI
if curl -f -s http://34.225.86.252/ > /dev/null; then
    echo -e "${GREEN}✅ UI is responding!${NC}"
else
    echo -e "${RED}❌ UI not responding${NC}"
fi

# Test OpenLIT
if curl -f -s http://34.225.86.252:3000/ > /dev/null; then
    echo -e "${GREEN}✅ OpenLIT is responding!${NC}"
else
    echo -e "${RED}❌ OpenLIT not responding${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Completed!${NC}"
echo -e "${GREEN}🌐 Access your services:${NC}"
echo -e "${GREEN}   • 📱 Chat Interface: http://34.225.86.252${NC}"
echo -e "${GREEN}   • 📊 OpenLIT:        http://34.225.86.252:3000${NC}"
