#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment process..."

# Set default DATABASE_URL if not provided
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set, using default SQLite database"
    export DATABASE_URL="file:./prisma/dev.db"
fi

echo "Database URL: $DATABASE_URL"

# Create database directory if it doesn't exist
mkdir -p ./prisma

# Initialize/update database schema
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

# Check if database has data, if not, seed it
echo "Checking if database needs seeding..."
if npx prisma db seed; then
    echo "Database seeded successfully"
else
    echo "Database seeding skipped or failed (this might be normal if data already exists)"
fi

# Start the application
echo "Starting the application..."
exec npm start
