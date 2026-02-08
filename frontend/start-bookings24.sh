#!/bin/bash
# Start Bookings24 frontend with separate .next directory
# This avoids conflicts with rezerwacja24 build

cd /root/CascadeProjects/rezerwacja24-saas/frontend

# Use .next-bookings24 as the build directory
export NEXT_BUILD_DIR=.next-bookings24

# Set environment variables
export NODE_ENV=production
export NEXT_PUBLIC_DOMAIN=bookings24.eu
export NEXT_PUBLIC_API_URL=https://api.bookings24.eu
export NEXT_PUBLIC_APP_URL=https://bookings24.eu

echo "Starting Bookings24 Frontend..."
echo "Domain: $NEXT_PUBLIC_DOMAIN"
echo "Port: 3001"

# Start Next.js with custom distDir
node node_modules/next/dist/bin/next start -p 3001
