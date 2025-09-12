#!/bin/bash

echo "🚀 Deploying Full Vostok Stack from AWS ECR Registry..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="34.225.86.252"
EC2_USER="ec2-user"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="586794484970"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "${BLUE}📋 Full Stack Components from AWS ECR:${NC}"
echo -e "${BLUE}   • Vostok Chat UI (port 80) - nginx with static files${NC}"
echo -e "${BLUE}   • Vostok RAG API (port 8000) - ${ECR_REGISTRY}/vostok-rag-api:latest${NC}"
echo -e "${BLUE}   • OpenLIT Dashboard (port 3000) - ${ECR_REGISTRY}/openlit-vostok:latest${NC}"
echo -e "${BLUE}   • OTEL Collector (port 4317/4318) - otel/opentelemetry-collector-contrib:0.94.0${NC}"
echo ""

# Check if environment file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please configure your .env file with API keys${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Building UI production assets...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ UI build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ UI build completed${NC}"

echo -e "${YELLOW}2. Creating deployment package...${NC}"
tar -czf vostok-full-stack-ecr.tar.gz \
    dist/ \
    docker-compose.simple.yml \
    nginx.simple.conf \
    otel-collector-config.yaml \
    .env

echo -e "${YELLOW}3. Uploading to EC2...${NC}"
scp vostok-full-stack-ecr.tar.gz $EC2_USER@$EC2_HOST:~/

echo -e "${YELLOW}4. Deploying full stack on EC2 with AWS ECR images...${NC}"
ssh $EC2_USER@$EC2_HOST << EOF
    # AWS ECR Login
    echo "🔐 Logging into AWS ECR..."
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

    if [ \$? -ne 0 ]; then
        echo "❌ Failed to login to AWS ECR. Check AWS credentials."
        exit 1
    fi

    # Stop any existing containers
    echo "🛑 Stopping existing containers..."
    docker stop \$(docker ps -aq) 2>/dev/null || true
    docker rm \$(docker ps -aq) 2>/dev/null || true

    # Clean up old deployments
    rm -rf vostok-full-stack-ecr/
    mkdir -p vostok-full-stack-ecr

    # Extract deployment files
    tar -xzf vostok-full-stack-ecr.tar.gz -C vostok-full-stack-ecr/
    cd vostok-full-stack-ecr

    # Pull images from AWS ECR and Docker Hub
    echo "📦 Pulling images..."
    docker pull ${ECR_REGISTRY}/openlit-vostok:latest
    docker pull otel/opentelemetry-collector-contrib:0.94.0
    docker pull ${ECR_REGISTRY}/vostok-rag-api:latest

    # Start services
    echo "🚀 Starting Vostok full stack..."
    docker-compose -f docker-compose.simple.yml up -d

    # Wait for services to start
    echo "⏳ Waiting for services to start..."
    sleep 30

    # Check container status
    echo "📊 Container status:"
    docker-compose -f docker-compose.simple.yml ps

    # Show service URLs
    echo ""
    echo "🌐 Service URLs:"
    echo "   • Main UI:      http://34.225.86.252"
    echo "   • API:          http://34.225.86.252:8000"
    echo "   • OpenLIT:      http://34.225.86.252:3000"
    echo "   • OTEL gRPC:    http://34.225.86.252:4317"
    echo "   • OTEL HTTP:    http://34.225.86.252:4318"
    echo "   • OTEL Metrics: http://34.225.86.252:8888"
    echo ""

    echo "🎉 AWS ECR deployment completed!"
EOF

echo -e "${YELLOW}5. Cleaning up local files...${NC}"
rm vostok-full-stack-ecr.tar.gz

echo -e "${YELLOW}6. Testing deployment...${NC}"
sleep 15

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

echo ""
echo -e "${GREEN}🎉 Full Vostok Stack Deployment from AWS ECR Completed!${NC}"
echo ""
echo -e "${GREEN}🌐 Access your services:${NC}"
echo -e "${GREEN}   • 📱 Chat Interface:    http://34.225.86.252${NC}"
echo -e "${GREEN}   • 🚀 API:               http://34.225.86.252:8000${NC}"
echo -e "${GREEN}   • 📊 OpenLIT Dashboard: http://34.225.86.252:3000${NC}"
echo -e "${GREEN}   • 📈 OTEL Metrics:      http://34.225.86.252:8888/metrics${NC}"
echo ""
echo -e "${BLUE}📦 Deployed from AWS ECR Registry: ${ECR_REGISTRY}${NC}"
echo -e "${BLUE}🔧 Management commands:${NC}"
echo -e "${BLUE}   • View logs: ssh $EC2_USER@$EC2_HOST 'cd vostok-full-stack-ecr && docker-compose -f docker-compose.simple.yml logs -f'${NC}"
echo -e "${BLUE}   • Restart:   ssh $EC2_USER@$EC2_HOST 'cd vostok-full-stack-ecr && docker-compose -f docker-compose.simple.yml restart'${NC}"
echo -e "${BLUE}   • Stop:      ssh $EC2_USER@$EC2_HOST 'cd vostok-full-stack-ecr && docker-compose -f docker-compose.simple.yml down'${NC}"
