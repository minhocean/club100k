#!/bin/bash

# Install Tailwind CSS and dependencies
echo "Installing Tailwind CSS and dependencies..."

npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
npx tailwindcss init -p

echo "Tailwind CSS installation completed!"
echo "Please run 'npm install' to install the dependencies."
