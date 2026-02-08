#!/bin/bash

# Rezerwacja24 - Start Production Services
set -e

echo "🚀 Starting Rezerwacja24 Production Services..."

cd /root/CascadeProjects/rezerwacja24-saas

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Remove old containers
echo "🗑️ Cleaning up old containers..."
docker compose rm -f

# Start all services
echo "▶️ Starting services with Docker Compose..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check status
echo "📊 Service Status:"
docker compose ps

# Check backend health
echo ""
echo "🔍 Health Checks:"
if docker compose exec -T backend curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️ Backend health check failed - checking logs..."
    docker compose logs backend | tail -20
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️ Frontend health check failed - checking logs..."
    docker compose logs frontend | tail -20
fi

echo ""
echo "✨ Rezerwacja24 is running!"
echo ""
echo "📡 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:4000"
echo "  - Nginx:    http://localhost (port 80/443)"
echo ""
echo "📝 View logs:"
echo "  docker compose logs -f"
echo ""
