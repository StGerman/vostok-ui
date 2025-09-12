#!/bin/bash

echo "🧪 Testing production build locally..."

# Build the app
npm run build

# Start local nginx container with production build
docker build -t vostok-ui-local .
docker run --rm -p 8080:80 --name vostok-ui-test vostok-ui-local &

CONTAINER_PID=$!

echo "🌐 Testing at http://localhost:8080"
echo "Press Ctrl+C to stop the test server"

# Wait for user to stop
trap "docker stop vostok-ui-test 2>/dev/null; exit 0" INT

# Keep script running
wait $CONTAINER_PID
