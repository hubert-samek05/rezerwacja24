#!/bin/bash

# Rezerwacja24 - Production Deployment Script
# Deploy to rezerwacja24.pl

set -e

echo "🚀 Starting Rezerwacja24 Production Deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/root/CascadeProjects/rezerwacja24-saas/backend"
FRONTEND_DIR="/root/CascadeProjects/rezerwacja24-saas/frontend"

echo -e "${BLUE}📦 Step 1: Building Backend...${NC}"
cd $BACKEND_DIR
npm run build
echo -e "${GREEN}✅ Backend built successfully${NC}"

echo -e "${BLUE}📦 Step 2: Building Frontend...${NC}"
cd $FRONTEND_DIR
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"

echo -e "${BLUE}🔄 Step 3: Restarting Backend Service...${NC}"
cd $BACKEND_DIR
# Kill existing backend process
pkill -f "nest start" || true
# Start backend in background
nohup npm run start:prod > /var/log/rezerwacja24-backend.log 2>&1 &
sleep 5
echo -e "${GREEN}✅ Backend restarted${NC}"

echo -e "${BLUE}🔄 Step 4: Restarting Frontend Service...${NC}"
cd $FRONTEND_DIR
# Kill existing frontend process
pkill -f "next start" || true
# Start frontend in background
nohup npm run start > /var/log/rezerwacja24-frontend.log 2>&1 &
sleep 5
echo -e "${GREEN}✅ Frontend restarted${NC}"

echo -e "${BLUE}🔄 Step 5: Reloading Nginx...${NC}"
# Test nginx configuration
nginx -t
# Reload nginx to apply any changes
systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo -e "${BLUE}🔍 Step 6: Health Check...${NC}"
# Check backend
if curl -f http://localhost:4000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo ""
echo "📡 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:4000"
echo "  - API Docs: http://localhost:4000/api/docs"
echo ""
echo "📝 Logs:"
echo "  - Backend:  tail -f /var/log/rezerwacja24-backend.log"
echo "  - Frontend: tail -f /var/log/rezerwacja24-frontend.log"
echo ""
