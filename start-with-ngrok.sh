#!/bin/bash

echo "Starting Next.js app with ngrok..."

# Start Next.js development server in background
npm run dev &
NEXT_PID=$!

# Wait for the app to start
sleep 5

# Start ngrok tunnel
echo "Starting ngrok tunnel..."
ngrok http 3000

# Cleanup function
cleanup() {
    echo "Stopping Next.js app..."
    kill $NEXT_PID
    exit
}

# Set trap to cleanup on script exit
trap cleanup EXIT
