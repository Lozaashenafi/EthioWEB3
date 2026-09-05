#!/bin/bash
source ~/.nvm/nvm.sh
nvm use default
cd /home/loza/Desktop/Mine/WEB3/EthioWEB3

echo "🚀 Starting EthioWeb3..."

# Start server in background
npx tsx server/src/index.ts &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
for i in $(seq 1 15); do
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Server is ready"
    break
  fi
  sleep 1
done

# Start client in background
npx vite --port=5173 --host=0.0.0.0 &
CLIENT_PID=$!
echo "Client PID: $CLIENT_PID"

# Wait for client to be ready
for i in $(seq 1 15); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Client is ready"
    break
  fi
  sleep 1
done

echo ""
echo "============================================"
echo "  🌐 Open: http://localhost:5173"
echo "  🔌 API:  http://localhost:3001"
echo "  📋 Health: http://localhost:3001/api/health"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Keep alive
wait
