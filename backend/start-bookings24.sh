#!/bin/bash
# Start Bookings24 backend with separate configuration
# This script loads .env.bookings24 and starts the backend on port 4001

cd /root/CascadeProjects/rezerwacja24-saas/backend

# Load bookings24 environment
export $(grep -v '^#' .env.bookings24 | xargs)

# Also load secrets from main .env (JWT_SECRET, SMTP credentials, etc.)
export JWT_SECRET=$(grep JWT_SECRET .env | cut -d '=' -f2)
export SMTP_HOST=$(grep SMTP_HOST .env | cut -d '=' -f2)
export SMTP_PORT=$(grep SMTP_PORT .env | cut -d '=' -f2)
export SMTP_USER=$(grep SMTP_USER .env | cut -d '=' -f2)
export SMTP_PASS=$(grep SMTP_PASS .env | cut -d '=' -f2)
export SENDGRID_API_KEY=$(grep SENDGRID_API_KEY .env | cut -d '=' -f2)

echo "Starting Bookings24 Backend..."
echo "Database: bookings24"
echo "Port: $PORT"
echo "Platform: $PLATFORM"

node dist/src/main.js
