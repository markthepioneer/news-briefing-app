#!/bin/bash

# Stop any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "node.*next"

# Install dependencies (if needed)
echo "Making sure dependencies are installed..."
npm install

# Run setup-resend script if it exists
if [ -f "setup-resend.js" ]; then
  echo "Setting up Resend email service..."
  node setup-resend.js
fi

# Create database tables (if needed)
echo "Synchronizing database schema..."
npx prisma generate
npx prisma db push

# Test email functionality
echo "Testing email functionality..."
node test-email.js

# Start the application in development mode
echo "Starting the application..."
npm run dev