#!/bin/bash

# PostgreSQL Database Restore Script
# Usage: ./restore-database.sh <backup_file> [environment]

set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide backup file path"
    echo "Usage: ./restore-database.sh <backup_file> [environment]"
    exit 1
fi

BACKUP_FILE=$1
ENVIRONMENT=${2:-production}

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
fi

echo "🔄 Starting PostgreSQL restore for ${ENVIRONMENT} environment..."
echo "📁 Backup file: ${BACKUP_FILE}"

# Extract database connection details from DATABASE_URL
DB_URL=${DATABASE_URL}
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DB_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Set PostgreSQL password
export PGPASSWORD=${DB_PASS}

echo "📊 Database: ${DB_NAME}"
echo "🏠 Host: ${DB_HOST}:${DB_PORT}"
echo "👤 User: ${DB_USER}"

# Confirm restore operation
echo "⚠️  WARNING: This will replace all data in the database!"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Check if backup file is compressed
if [[ ${BACKUP_FILE} == *.gz ]]; then
    echo "📦 Decompressing backup file..."
    TEMP_FILE="/tmp/restore_$(date +%s).sql"
    gunzip -c ${BACKUP_FILE} > ${TEMP_FILE}
    RESTORE_FILE=${TEMP_FILE}
else
    RESTORE_FILE=${BACKUP_FILE}
fi

# Stop application (if running in Docker)
if command -v docker-compose &> /dev/null; then
    echo "🛑 Stopping application..."
    docker-compose stop backend
fi

# Create database backup before restore (safety measure)
SAFETY_BACKUP="/tmp/safety_backup_$(date +%s).sql"
echo "🛡️  Creating safety backup..."
pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} > ${SAFETY_BACKUP}
echo "✅ Safety backup created: ${SAFETY_BACKUP}"

# Restore database
echo "🔄 Restoring database..."
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} < ${RESTORE_FILE}

echo "✅ Database restored successfully!"

# Clean up temporary files
if [[ ${BACKUP_FILE} == *.gz ]]; then
    rm -f ${TEMP_FILE}
fi

# Start application (if using Docker)
if command -v docker-compose &> /dev/null; then
    echo "🚀 Starting application..."
    docker-compose start backend
fi

echo "🎉 Restore process completed successfully!"
echo "🛡️  Safety backup available at: ${SAFETY_BACKUP}"

# Unset password
unset PGPASSWORD
