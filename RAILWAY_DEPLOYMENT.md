# Railway Deployment Guide

This guide will help you deploy the After-Sales Service Management System to Railway with PostgreSQL.

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. GitHub repository with your code
3. Railway CLI (optional but recommended)

## Step 1: Prepare Your Repository

### 1.1 Environment Variables

Create a `.env` file in the `backend` directory for local development:

```bash
# Database (SQLite for local development)
DATABASE_URL="file:./dev.db"

# JWT Secrets
JWT_SECRET="your-local-jwt-secret"
JWT_REFRESH_SECRET="your-local-refresh-secret"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
```

### 1.2 Production Configuration

The production configuration is already set up in:
- `backend/nixpacks.toml` - Railway build configuration
- `backend/scripts/start-production.js` - Production start script
- `backend/railway.env` - Production environment template

## Step 2: Deploy to Railway

### 2.1 Create New Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2.2 Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. The `DATABASE_URL` will be automatically set as an environment variable

### 2.3 Configure Environment Variables

Set these environment variables in Railway:

```bash
# JWT Secrets (CHANGE THESE!)
JWT_SECRET="your-production-jwt-secret-min-32-characters"
JWT_REFRESH_SECRET="your-production-refresh-secret-min-32-characters"

# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# CORS Configuration (Update with your frontend URL)
CORS_ORIGIN="https://your-frontend-domain.railway.app"

# Logging
LOG_LEVEL=warn

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600000

# Database Connection Pool
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### 2.4 Deploy Backend

1. Railway will automatically detect the `backend` directory
2. It will use the `nixpacks.toml` configuration
3. The deployment process will:
   - Install dependencies
   - Generate Prisma client
   - Build TypeScript
   - Run database migrations
   - Start the application

## Step 3: Deploy Frontend

### 3.1 Create Frontend Service

1. In your Railway project dashboard
2. Click "New" → "GitHub Repo"
3. Select the same repository
4. Set the root directory to `frontend`

### 3.2 Configure Frontend Environment

Set these environment variables for the frontend:

```bash
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.railway.app
REACT_APP_API_VERSION=v1

# Environment
NODE_ENV=production
```

### 3.3 Frontend Build Configuration

Create `frontend/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ['nodejs_18', 'npm-9_x']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npx serve -s build -l 3000'
```

## Step 4: Database Setup

### 4.1 Automatic Migrations

The production start script automatically runs:
```bash
npx prisma migrate deploy
```

This applies all pending migrations to your PostgreSQL database.

### 4.2 Manual Database Operations

If you need to run database operations manually:

```bash
# Connect to Railway database
railway connect

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (if needed)
npm run db:seed
```

## Step 5: Custom Domains (Optional)

### 5.1 Backend Domain

1. Go to your backend service settings
2. Click "Domains"
3. Add a custom domain or use the Railway-provided domain

### 5.2 Frontend Domain

1. Go to your frontend service settings
2. Click "Domains"
3. Add a custom domain or use the Railway-provided domain

## Step 6: Monitoring and Logs

### 6.1 View Logs

1. Go to your service dashboard
2. Click "Logs" tab
3. Monitor application logs in real-time

### 6.2 Health Checks

The application includes health check endpoints:
- Backend: `https://your-backend-domain.railway.app/health`
- API: `https://your-backend-domain.railway.app/api/health`

## Step 7: Security Considerations

### 7.1 Environment Variables

- Never commit `.env` files to version control
- Use strong, unique JWT secrets in production
- Regularly rotate secrets

### 7.2 Database Security

- Railway PostgreSQL is secure by default
- Use SSL connections (enabled by default)
- Monitor database usage and performance

### 7.3 CORS Configuration

- Set `CORS_ORIGIN` to your actual frontend domain
- Don't use wildcards (`*`) in production

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if `DATABASE_URL` is set correctly
   - Ensure PostgreSQL service is running
   - Verify database credentials

2. **Migration Failed**
   - Check database permissions
   - Ensure migrations are up to date
   - Check Prisma schema compatibility

3. **Build Failed**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

4. **CORS Errors**
   - Verify `CORS_ORIGIN` is set correctly
   - Check frontend API URL configuration
   - Ensure both services are deployed

### Getting Help

1. Check Railway logs for detailed error messages
2. Verify environment variables are set correctly
3. Test database connection locally
4. Check Railway documentation: https://docs.railway.app

## Production Checklist

- [ ] PostgreSQL database created and connected
- [ ] Environment variables configured
- [ ] JWT secrets changed from defaults
- [ ] CORS origin set to production frontend URL
- [ ] Database migrations applied
- [ ] Health checks working
- [ ] Custom domains configured (if needed)
- [ ] Monitoring and logging set up
- [ ] Security review completed

## Support

For issues specific to this application, check the main README.md file or create an issue in the repository.

For Railway-specific issues, check the Railway documentation or support channels.
