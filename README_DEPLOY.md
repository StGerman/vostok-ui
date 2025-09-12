# Vostok Chat Interface - EC2 Deployment Guide

## 🚀 Quick Deploy

1. **Prepare EC2 instance:**
   ```bash
   # Install Docker and Docker Compose on your EC2 instance
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

2. **Deploy with one command:**
   ```bash
   ./deploy.sh
   ```

## 🌐 Access Points

- **Chat Interface:** http://34.225.86.252 (port 80)
- **Chat Interface (HTTPS):** https://34.225.86.252 (port 443)
- **API Documentation:** http://34.225.86.252/docs
- **API Health Check:** http://34.225.86.252/api/health

## 🔧 Manual Deployment

If you prefer manual deployment:

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Copy to EC2:**
   ```bash
   scp -r dist/ ubuntu@34.225.86.252:~/vostok-ui/
   scp docker-compose.production.yml ubuntu@34.225.86.252:~/vostok-ui/
   scp Dockerfile nginx.conf ubuntu@34.225.86.252:~/vostok-ui/
   ```

3. **Deploy on EC2:**
   ```bash
   ssh ubuntu@34.225.86.252
   cd vostok-ui
   docker-compose -f docker-compose.production.yml up -d --build
   ```

## 🔒 SSL Configuration

To enable HTTPS with SSL certificates:

1. **Get SSL certificates** (Let's Encrypt recommended):
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

2. **Update nginx configuration:**
   - Replace `nginx.conf` with `nginx.ssl.conf`
   - Update certificate paths in the config

3. **Rebuild and deploy:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

## 🐳 Docker Services

- **vostok-ui:** React frontend on ports 80/443
- **vostok-api:** FastAPI backend on port 8000

## 📊 Monitoring

Check service status:
```bash
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f ui
```

## 🔧 Configuration

Environment variables in `.env`:
- `VITE_API_BASE_URL`: API endpoint for frontend
- Backend environment variables passed through docker-compose

## 🎯 Features

- ✅ Production-optimized React build
- ✅ Nginx with gzip compression
- ✅ API proxy configuration
- ✅ Static asset caching
- ✅ Security headers
- ✅ Docker containerization
- ✅ Health checks
- ✅ SSL ready
- ✅ Russian localization
