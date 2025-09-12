#!/bin/bash

echo "🚀 Deploying Vostok UI (Simple) to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="34.225.86.252"
EC2_USER="ec2-user"

echo -e "${YELLOW}1. Building production assets...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

echo -e "${YELLOW}2. Creating UI-only deployment package...${NC}"
tar -czf vostok-ui-simple.tar.gz dist/ Dockerfile nginx.simple.conf docker-compose.ui-only.yml

echo -e "${YELLOW}3. Uploading to EC2...${NC}"
scp vostok-ui-simple.tar.gz $EC2_USER@$EC2_HOST:~/

echo -e "${YELLOW}4. Deploying UI on EC2...${NC}"
ssh $EC2_USER@$EC2_HOST << 'EOF'
    # Stop existing containers
    docker stop vostok-ui 2>/dev/null || true
    docker rm vostok-ui 2>/dev/null || true

    # Create directory and extract
    mkdir -p vostok-ui-simple
    tar -xzf vostok-ui-simple.tar.gz -C vostok-ui-simple/
    cd vostok-ui-simple

    # Build and start UI container
    docker-compose -f docker-compose.ui-only.yml up -d --build

    # Check container status
    docker ps | grep vostok-ui

    echo "🎉 UI Deployment completed!"
EOF

echo -e "${YELLOW}5. Cleaning up local files...${NC}"
rm vostok-ui-simple.tar.gz

echo -e "${YELLOW}6. Testing deployment...${NC}"
sleep 5  # Give containers time to start

# Test UI
if curl -f -s http://34.225.86.252/health > /dev/null; then
    echo -e "${GREEN}✅ UI is responding!${NC}"
else
    echo -e "${RED}❌ UI not responding, checking logs...${NC}"
    ssh $EC2_USER@$EC2_HOST 'cd vostok-ui-simple && docker-compose -f docker-compose.ui-only.yml logs ui'
    exit 1
fi

echo -e "${GREEN}🎉 Simple UI Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your Vostok Chat Interface is now live at:${NC}"
echo -e "${GREEN}   • HTTP:  http://34.225.86.252${NC}"
echo -e "${GREEN}   • Health: http://34.225.86.252/health${NC}"
echo -e "${GREEN}   • API Docs: http://34.225.86.252/docs${NC}"
