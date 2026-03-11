#!/bin/bash

set -e

echo "🚀 Starting Gasless Rollup services..."

# Function to handle graceful shutdown
cleanup() {
    echo "📋 Shutting down services..."
    kill $RELAYER_PID $FRONTEND_PID 2>/dev/null || true
    wait $RELAYER_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Trap SIGTERM and SIGINT
trap cleanup SIGTERM SIGINT

# Load environment vars generated at build time (if exists)
if [ -f /app/.env ]; then
  echo "🌿 Loading /app/.env"
  set -a
  . /app/.env
  set +a
fi

# Start relayer server
echo "🔌 Starting Relayer Server..."
cd /app/relayer
node server.js &
RELAYER_PID=$!
echo "   Relayer PID: $RELAYER_PID"

# Wait for relayer to start
sleep 2

# Start frontend dev server
echo "🎨 Starting Frontend Dev Server..."
cd /app/rollup-explorer-main
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📍 Service Endpoints:"
echo "   - Relayer API: ${import.meta.env.VITE_BACKEND_URL}"
echo "   - Frontend Dev: http://localhost:5173"
echo "   - Frontend (Vite): http://localhost:3000"
echo ""
echo "📊 Logs will be streamed below:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for both processes
wait $RELAYER_PID $FRONTEND_PID
