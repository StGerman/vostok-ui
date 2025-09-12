#!/bin/bash

echo "🚀 Deploying Vostok Chat Interface to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="34.225.86.252"
EC2_USER="ec2-user"  # Changed from ubuntu to ec2-user
REMOTE_DIR="/home/$EC2_USER/vostok-ui"

echo -e "${YELLOW}1. Building production assets...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

echo -e "${YELLOW}2. Creating deployment package...${NC}"
tar -czf vostok-ui-deploy.tar.gz dist/ Dockerfile nginx.conf docker-compose.production.yml .env

echo -e "${YELLOW}3. Uploading to EC2...${NC}"
scp vostok-ui-deploy.tar.gz $EC2_USER@$EC2_HOST:~/

echo -e "${YELLOW}4. Deploying on EC2...${NC}"
ssh $EC2_USER@$EC2_HOST << 'EOF'
    # Extract deployment package
    tar -xzf vostok-ui-deploy.tar.gz -C vostok-ui/ || mkdir -p vostok-ui && tar -xzf vostok-ui-deploy.tar.gz -C vostok-ui/

    cd vostok-ui

    # Stop existing containers
    docker-compose -f docker-compose.production.yml down 2>/dev/null || true

    # Build and start new containers
    docker-compose -f docker-compose.production.yml up -d --build

    # Clean up old images
    docker image prune -f

    echo "🎉 Deployment completed!"
    echo "🌐 UI available at: http://34.225.86.252"
    echo "🔗 API available at: http://34.225.86.252/api/health"
EOF

echo -e "${YELLOW}5. Cleaning up local files...${NC}"
rm vostok-ui-deploy.tar.gz

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your Vostok Chat Interface is now live at:${NC}"
echo -e "${GREEN}   • HTTP:  http://34.225.86.252${NC}"
echo -e "${GREEN}   • HTTPS: https://34.225.86.252 (if SSL configured)${NC}"
