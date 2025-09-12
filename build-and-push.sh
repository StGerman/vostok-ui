#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="vostok-chat-ui"
REGISTRY="ghcr.io/stgerman"
VERSION="1.0.0"
LATEST_TAG="latest"

echo -e "${BLUE}🚀 Building and pushing Vostok Chat UI Docker image...${NC}"

# Check if we're logged in to GitHub Container Registry
echo -e "${YELLOW}1. Checking GitHub Container Registry login...${NC}"
if ! docker info | grep -q "ghcr.io"; then
    echo -e "${YELLOW}Please log in to GitHub Container Registry:${NC}"
    echo "docker login ghcr.io"
    exit 1
fi

# Build production assets first
echo -e "${YELLOW}2. Building production React assets...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ React build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ React build completed${NC}"

# Build Docker image with production Dockerfile
echo -e "${YELLOW}3. Building Docker image...${NC}"
docker build -f Dockerfile.production -t ${IMAGE_NAME}:${VERSION} -t ${IMAGE_NAME}:${LATEST_TAG} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Tag images for registry
echo -e "${YELLOW}4. Tagging images for registry...${NC}"
docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:${VERSION}
docker tag ${IMAGE_NAME}:${LATEST_TAG} ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}

# Push images to registry
echo -e "${YELLOW}5. Pushing images to GitHub Container Registry...${NC}"
echo -e "${YELLOW}   Pushing version ${VERSION}...${NC}"
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push version ${VERSION}!${NC}"
    exit 1
fi

echo -e "${YELLOW}   Pushing latest tag...${NC}"
docker push ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push latest tag!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Images pushed successfully!${NC}"

# Test the local image
echo -e "${YELLOW}6. Testing local Docker image...${NC}"
docker run -d --name vostok-ui-test -p 8080:80 ${IMAGE_NAME}:${LATEST_TAG}

# Wait for container to start
sleep 5

# Test health endpoint
if curl -f -s http://localhost:8080/health.html > /dev/null; then
    echo -e "${GREEN}✅ Local image test successful!${NC}"
    docker stop vostok-ui-test
    docker rm vostok-ui-test
else
    echo -e "${RED}❌ Local image test failed!${NC}"
    docker logs vostok-ui-test
    docker stop vostok-ui-test
    docker rm vostok-ui-test
    exit 1
fi

# Show final information
echo -e "${GREEN}🎉 Vostok Chat UI Docker image built and pushed successfully!${NC}"
echo -e "${GREEN}📦 Registry Images:${NC}"
echo -e "${GREEN}   • ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${GREEN}   • ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}${NC}"
echo ""
echo -e "${BLUE}🔧 To deploy on your server:${NC}"
echo -e "${BLUE}   docker pull ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}${NC}"
echo -e "${BLUE}   docker run -d --name vostok-ui -p 80:80 ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}${NC}"
echo ""
echo -e "${BLUE}🌐 Or with docker-compose:${NC}"
echo -e "${BLUE}   image: ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}${NC}"
