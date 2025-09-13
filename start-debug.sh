#!/bin/bash

echo "Starting GeminiSport with debug logging..."
echo

# Set debug environment variables
export DEBUG=*
export NODE_ENV=development

# Start the application
echo "Starting Next.js development server..."
npm run dev

