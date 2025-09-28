#!/bin/bash

# PostgreSQL Database Backup Script
# Usage: ./backup-database.sh [environment]

set -e

# Configuration
BACKUP_DIR="/var/backups/after-sales"
DATE=$(date +%Y%m%d_%H%M%S)
ENVIRONMENT=${1:-production}

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
fi

# Create backup directory
mkdir -p ${BACKUP_DIR}

echo "🗄️  Starting PostgreSQL backup for ${ENVIRONMENT} environment..."

# Extract database connection details from DATABASE_URL
DB_URL=${DATABASE_URL}
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DB_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Set PostgreSQL password
export PGPASSWORD=${DB_PASS}

# Create backup filename
BACKUP_FILE="${BACKUP_DIR}/after_sales_${ENVIRONMENT}_${DATE}.sql"

echo "📊 Database: ${DB_NAME}"
echo "🏠 Host: ${DB_HOST}:${DB_PORT}"
echo "👤 User: ${DB_USER}"
echo "📁 Backup file: ${BACKUP_FILE}"

# Create database backup
pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    > ${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup completed: ${BACKUP_FILE}"

# Get backup size
BACKUP_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
echo "📦 Backup size: ${BACKUP_SIZE}"

# Clean up old backups (keep last 30 days)
find ${BACKUP_DIR} -name "after_sales_${ENVIRONMENT}_*.sql.gz" -mtime +30 -delete
echo "🧹 Cleaned up old backups (older than 30 days)"

# Upload to cloud storage (optional)
if [ ! -z "${AWS_S3_BUCKET}" ]; then
    echo "☁️  Uploading to AWS S3..."
    aws s3 cp ${BACKUP_FILE} s3://${AWS_S3_BUCKET}/backups/
    echo "✅ Uploaded to S3"
fi

if [ ! -z "${AZURE_STORAGE_ACCOUNT}" ]; then
    echo "☁️  Uploading to Azure Blob Storage..."
    az storage blob upload \
        --account-name ${AZURE_STORAGE_ACCOUNT} \
        --container-name backups \
        --name $(basename ${BACKUP_FILE}) \
        --file ${BACKUP_FILE}
    echo "✅ Uploaded to Azure"
fi

echo "🎉 Backup process completed successfully!"

# Unset password
unset PGPASSWORD
