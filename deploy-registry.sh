#!/bin/bash

echo "🚀 Deploying Vostok UI from GitHub Container Registry to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="34.225.86.252"
EC2_USER="ec2-user"
REGISTRY_IMAGE="ghcr.io/stgerman/vostok-chat-ui:latest"

echo -e "${YELLOW}1. Preparing deployment files...${NC}"
# Create deployment package
tar -czf vostok-ui-registry-deploy.tar.gz docker-compose.production-registry.yml

echo -e "${YELLOW}2. Uploading deployment files to EC2...${NC}"
scp vostok-ui-registry-deploy.tar.gz $EC2_USER@$EC2_HOST:~/

echo -e "${YELLOW}3. Deploying on EC2 using registry image...${NC}"
ssh $EC2_USER@$EC2_HOST << EOF
    # Stop existing containers
    docker stop vostok-ui 2>/dev/null || true
    docker rm vostok-ui 2>/dev/null || true

    # Clean up old deployments
    rm -rf vostok-ui-registry/
    mkdir -p vostok-ui-registry

    # Extract deployment files
    tar -xzf vostok-ui-registry-deploy.tar.gz -C vostok-ui-registry/
    cd vostok-ui-registry

    # Pull latest image from registry
    echo "📦 Pulling latest image from GitHub Container Registry..."
    docker pull $REGISTRY_IMAGE

    # Start services
    echo "🚀 Starting Vostok UI service..."
    docker-compose -f docker-compose.production-registry.yml up -d

    # Check container status
    echo "📊 Container status:"
    docker ps | grep vostok-ui

    # Check logs
    echo "📋 Recent logs:"
    docker-compose -f docker-compose.production-registry.yml logs --tail=20 vostok-ui

    echo "🎉 Registry deployment completed!"
EOF

echo -e "${YELLOW}4. Cleaning up local files...${NC}"
rm vostok-ui-registry-deploy.tar.gz

echo -e "${YELLOW}5. Testing deployment...${NC}"
sleep 10  # Give containers time to fully start

# Test UI
if curl -f -s http://34.225.86.252/health.html > /dev/null; then
    echo -e "${GREEN}✅ UI is responding from registry image!${NC}"

    # Test main interface
    if curl -f -s http://34.225.86.252/ > /dev/null; then
        echo -e "${GREEN}✅ Main interface is accessible!${NC}"
    else
        echo -e "${YELLOW}⚠️  Main interface check failed, but health endpoint works${NC}"
    fi
else
    echo -e "${RED}❌ UI not responding, checking logs...${NC}"
    ssh $EC2_USER@$EC2_HOST 'cd vostok-ui-registry && docker-compose -f docker-compose.production-registry.yml logs vostok-ui'
    exit 1
fi

echo -e "${GREEN}🎉 Registry-based deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your Vostok Chat Interface is now live at:${NC}"
echo -e "${GREEN}   • HTTP:  http://34.225.86.252${NC}"
echo -e "${GREEN}   • Health: http://34.225.86.252/health.html${NC}"
echo ""
echo -e "${BLUE}📦 Deployed from image: $REGISTRY_IMAGE${NC}"
echo -e "${BLUE}🔄 To update: run './build-and-push.sh' then './deploy-registry.sh'${NC}"
