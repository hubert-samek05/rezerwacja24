#!/bin/bash
# Deploy script for bookings24.eu
# Run this on the bookings24.eu server

set -e

echo "=========================================="
echo "Deploying Bookings24.eu"
echo "=========================================="

PROJECT_DIR="/root/CascadeProjects/rezerwacja24-saas"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
cd $FRONTEND_DIR
npm install

echo -e "${YELLOW}Step 2: Building frontend for bookings24.eu...${NC}"
# Build to separate directory to avoid overwriting rezerwacja24 build
NEXT_PUBLIC_DOMAIN=bookings24.eu \
NEXT_PUBLIC_API_URL=https://api.bookings24.eu \
NEXT_PUBLIC_APP_URL=https://bookings24.eu \
NEXT_BUILD_DIR=.next-bookings24 \
npm run build

echo -e "${YELLOW}Step 3: Verifying build...${NC}"
if [ ! -d ".next-bookings24" ]; then
    echo "Build directory not found, copying from .next..."
    rm -rf .next-bookings24
    cp -r .next .next-bookings24
fi

echo -e "${YELLOW}Step 4: Starting/Restarting PM2 process...${NC}"
cd $PROJECT_DIR

# Check if process exists
if pm2 list | grep -q "bookings24-frontend"; then
    echo "Restarting existing bookings24-frontend process..."
    pm2 restart bookings24-frontend
else
    echo "Starting new bookings24-frontend process..."
    pm2 start ecosystem.bookings24.config.js
fi

pm2 save

echo -e "${YELLOW}Step 5: Testing nginx configuration...${NC}"
nginx -t

echo -e "${YELLOW}Step 6: Reloading nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}=========================================="
echo "Deployment complete!"
echo "=========================================="
echo ""
echo "Bookings24.eu should now be accessible at:"
echo "  - https://bookings24.eu"
echo "  - https://app.bookings24.eu"
echo "  - https://api.bookings24.eu"
echo ""
echo "PM2 status:"
pm2 status
