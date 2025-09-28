# PostgreSQL Production Setup Guide

This guide covers setting up PostgreSQL for production deployment with various cloud providers.

## 🗄️ Database Migration from SQLite

### Step 1: Update Prisma Schema
The schema has been updated to use PostgreSQL. The main change:
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 2: Choose Your Database Provider

#### Option 1: Railway PostgreSQL (Recommended for small-medium apps)
```bash
# 1. Create Railway account at railway.app
# 2. Create new project and add PostgreSQL service
# 3. Copy connection details

# Set environment variables
export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Setup initial data
npm run db:setup
```

#### Option 2: AWS RDS PostgreSQL
```bash
# 1. Create RDS PostgreSQL instance in AWS Console
# 2. Configure security groups to allow connections
# 3. Copy endpoint details

# Set environment variables
export DATABASE_URL="postgresql://username:password@after-sales-db.cluster-xxx.us-west-2.rds.amazonaws.com:5432/after_sales_db"

# Setup database
npm run db:generate
npm run db:push
npm run db:setup
```

#### Option 3: Azure Database for PostgreSQL
```bash
# 1. Create PostgreSQL server in Azure Portal
# 2. Configure firewall rules
# 3. Create database

# Set environment variables
export DATABASE_URL="postgresql://username:password@after-sales-server.postgres.database.azure.com:5432/after_sales_db?sslmode=require"

# Setup database
npm run db:generate
npm run db:push
npm run db:setup
```

#### Option 4: Google Cloud SQL
```bash
# 1. Create Cloud SQL PostgreSQL instance
# 2. Configure authorized networks
# 3. Create database and user

# Set environment variables
export DATABASE_URL="postgresql://username:password@xxx.xxx.xxx.xxx:5432/after_sales_db"

# Setup database
npm run db:generate
npm run db:push
npm run db:setup
```

#### Option 5: Supabase (Free tier available)
```bash
# 1. Create Supabase account and project
# 2. Go to Settings > Database
# 3. Copy connection string

# Set environment variables
export DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Setup database
npm run db:generate
npm run db:push
npm run db:setup
```

### Step 3: Migrate Existing Data (if you have SQLite data)
```bash
# Migrate data from SQLite to PostgreSQL
npm run db:migrate-from-sqlite
```

## 🐳 Docker Deployment

### Local Development with PostgreSQL
```bash
# Start PostgreSQL container
docker-compose up postgres -d

# Wait for database to be ready
docker-compose logs postgres

# Setup database
cd backend
npm run db:generate
npm run db:push
npm run db:setup

# Start full application
docker-compose up -d
```

### Production Deployment
```bash
# Set production environment variables
export POSTGRES_PASSWORD=secure_production_password
export JWT_SECRET=your-production-jwt-secret-256-bits-long
export JWT_REFRESH_SECRET=your-production-refresh-secret-256-bits-long

# Deploy with production overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Setup database
docker-compose exec backend npm run db:setup
```

## 🔧 Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### Backend Setup
```bash
# Clone repository
git clone <your-repo-url>
cd after-sales-management-system/backend

# Install dependencies
npm install

# Copy environment configuration
cp env.production.example .env
# Edit .env with your database details

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Setup initial data
npm run db:setup

# Build and start
npm run build
npm start
```

## 🔐 Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Secrets (MUST be changed in production)
JWT_SECRET="your-super-secure-jwt-secret-256-bits-minimum"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-256-bits-minimum"

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN="https://your-domain.com"
```

### Optional Variables
```bash
# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=warn
```

## 🔄 Database Management

### Backup Database
```bash
# Create backup
npm run db:backup

# Backup to specific location
./scripts/backup-database.sh production
```

### Restore Database
```bash
# Restore from backup
npm run db:restore /path/to/backup.sql.gz

# Interactive restore
./scripts/restore-database.sh /path/to/backup.sql.gz production
```

### Database Maintenance
```bash
# Check database status
docker-compose exec postgres pg_isready -U after_sales_user

# Connect to database
docker-compose exec postgres psql -U after_sales_user -d after_sales_db

# View database size
docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "SELECT pg_size_pretty(pg_database_size('after_sales_db'));"

# Vacuum database (maintenance)
docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "VACUUM ANALYZE;"
```

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:3001/health

# Database health
docker-compose exec postgres pg_isready -U after_sales_user -d after_sales_db
```

### Performance Monitoring
```bash
# Check active connections
docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## 🚀 Cloud Provider Specific Setup

### Railway Deployment
1. Connect GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push

### AWS Deployment
1. Create RDS PostgreSQL instance
2. Deploy to EC2 or ECS
3. Configure security groups
4. Set up Application Load Balancer

### Azure Deployment
1. Create Azure Database for PostgreSQL
2. Deploy to Container Instances or App Service
3. Configure networking
4. Set up Application Gateway

### Google Cloud Deployment
1. Create Cloud SQL PostgreSQL instance
2. Deploy to Cloud Run or Compute Engine
3. Configure VPC and firewall rules
4. Set up Load Balancer

## 🔍 Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL
```

#### Migration Errors
```bash
# Reset database (WARNING: destroys data)
npm run db:reset

# Push schema without migration
npm run db:push

# Generate client
npm run db:generate
```

#### Performance Issues
```bash
# Check database connections
docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "SELECT * FROM pg_stat_activity;"

# Check database size
docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats;"
```

## 📋 Production Checklist

- [ ] Database provider selected and configured
- [ ] Environment variables set securely
- [ ] JWT secrets changed from defaults
- [ ] Database backups configured
- [ ] SSL/TLS enabled
- [ ] Firewall rules configured
- [ ] Monitoring set up
- [ ] Health checks working
- [ ] Performance testing completed
- [ ] Disaster recovery plan created

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs backend`
2. Verify database connection: `npm run db:generate`
3. Test health endpoint: `curl http://localhost:3001/health`
4. Review environment variables
5. Check database provider documentation

## 🔗 Useful Commands

```bash
# Quick database setup for new environment
npm run db:generate && npm run db:push && npm run db:setup

# Full backup and restore
npm run db:backup && npm run db:restore backup.sql.gz

# Check database configuration
node backend/config/database-configs.js railway

# Monitor database performance
docker stats after-sales-db
```
