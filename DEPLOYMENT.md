# Deployment Guide

This guide covers deploying the After-Sales Service Management System in different environments.

## 🐳 Docker Deployment (Recommended)

### Development Environment

1. **Clone and start**
   ```bash
   git clone <repository-url>
   cd after-sales-management-system
   docker-compose up -d
   ```

2. **Initialize database**
   ```bash
   docker-compose exec backend npm run db:push
   docker-compose exec backend npm run db:seed
   ```

3. **Access application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Database: localhost:5432

### Production Environment

1. **Set environment variables**
   ```bash
   export POSTGRES_PASSWORD=secure_production_password
   export JWT_SECRET=your-production-jwt-secret
   export JWT_REFRESH_SECRET=your-production-refresh-secret
   ```

2. **Deploy with production overrides**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Initialize database**
   ```bash
   docker-compose exec backend npm run db:push
   docker-compose exec backend npm run db:seed
   ```

### SSL/HTTPS Setup

1. **Create SSL certificates** (Let's Encrypt example)
   ```bash
   certbot --nginx -d yourdomain.com
   ```

2. **Update nginx configuration**
   ```bash
   cp nginx/ssl.conf nginx/conf.d/default.conf
   ```

## 🔧 Manual Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Nginx (optional)

### Backend Deployment

1. **Install dependencies**
   ```bash
   cd backend
   npm install --production
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with production values
   ```

3. **Build application**
   ```bash
   npm run build
   ```

4. **Setup database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

### Frontend Deployment

1. **Build for production**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Serve with Nginx**
   ```bash
   sudo cp -r build/* /var/www/html/
   sudo systemctl restart nginx
   ```

## ☁️ Cloud Deployment

### AWS Deployment

1. **EC2 Instance Setup**
   ```bash
   # Install Docker
   sudo yum update -y
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **RDS PostgreSQL**
   - Create RDS PostgreSQL instance
   - Update DATABASE_URL in environment

3. **Application Load Balancer**
   - Configure ALB for high availability
   - Set up health checks

### Azure Deployment

1. **Container Instances**
   ```bash
   az container create \
     --resource-group myResourceGroup \
     --name after-sales-app \
     --image your-registry/after-sales:latest
   ```

2. **Azure Database for PostgreSQL**
   ```bash
   az postgres server create \
     --resource-group myResourceGroup \
     --name after-sales-db \
     --location westus2
   ```

### Google Cloud Platform

1. **Cloud Run**
   ```bash
   gcloud run deploy after-sales-backend \
     --image gcr.io/PROJECT_ID/after-sales-backend
   ```

2. **Cloud SQL PostgreSQL**
   ```bash
   gcloud sql instances create after-sales-db \
     --database-version=POSTGRES_15
   ```

## 🔐 Security Considerations

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Regular security updates

### Environment Variables

**Critical Production Variables:**
```bash
NODE_ENV=production
JWT_SECRET=extremely-secure-jwt-secret-256-bits-long
JWT_REFRESH_SECRET=extremely-secure-refresh-secret-256-bits-long
DATABASE_URL=postgresql://user:password@host:5432/database
POSTGRES_PASSWORD=secure-database-password
SMTP_PASS=secure-email-password
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Checks**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Log Monitoring**
   ```bash
   docker-compose logs -f backend
   tail -f backend/logs/combined.log
   ```

3. **Database Monitoring**
   ```bash
   docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "SELECT * FROM requests LIMIT 5;"
   ```

### Performance Monitoring

1. **Node.js Metrics**
   - CPU usage
   - Memory consumption
   - Response times

2. **Database Performance**
   - Query execution times
   - Connection pool usage
   - Index effectiveness

## 🔄 Backup & Recovery

### Database Backup

1. **Manual Backup**
   ```bash
   docker-compose exec postgres pg_dump -U after_sales_user after_sales_db > backup.sql
   ```

2. **Automated Backup Script**
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker-compose exec postgres pg_dump -U after_sales_user after_sales_db > "backup_${DATE}.sql"
   ```

### Application Backup

1. **Code Repository**
   - Regular git commits
   - Tagged releases

2. **Uploads Directory**
   ```bash
   tar -czf uploads_backup.tar.gz backend/uploads/
   ```

### Recovery Process

1. **Database Recovery**
   ```bash
   docker-compose exec postgres psql -U after_sales_user -d after_sales_db < backup.sql
   ```

2. **Application Recovery**
   ```bash
   git checkout <stable-tag>
   docker-compose up -d
   ```

## 🚀 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Setup**
   - Multiple backend instances
   - Session management
   - Database connection pooling

2. **Container Orchestration**
   - Kubernetes deployment
   - Docker Swarm mode
   - Auto-scaling policies

### Database Scaling

1. **Read Replicas**
   - PostgreSQL streaming replication
   - Read-only queries routing

2. **Connection Pooling**
   - PgBouncer setup
   - Connection limits

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec backend npm run db:test
   ```

2. **Authentication Issues**
   ```bash
   # Verify JWT secret
   echo $JWT_SECRET
   
   # Check user creation
   docker-compose exec backend npm run db:seed
   ```

3. **Performance Issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Analyze slow queries
   docker-compose exec postgres psql -U after_sales_user -d after_sales_db -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;"
   ```

### Log Analysis

```bash
# Backend logs
tail -f backend/logs/combined.log | grep ERROR

# Access logs
tail -f /var/log/nginx/access.log

# Database logs
docker-compose logs postgres | grep ERROR
```

## 📋 Maintenance

### Regular Tasks

1. **Weekly**
   - Database backup
   - Log rotation
   - Security updates

2. **Monthly**
   - Performance review
   - Capacity planning
   - Dependency updates

3. **Quarterly**
   - Security audit
   - Disaster recovery test
   - System optimization

### Update Process

1. **Backup Current System**
   ```bash
   ./scripts/backup.sh
   ```

2. **Deploy New Version**
   ```bash
   git pull origin main
   docker-compose build
   docker-compose up -d
   ```

3. **Run Migrations**
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

4. **Verify Deployment**
   ```bash
   curl http://localhost:3001/health
   ```

## 📞 Support

For deployment support:
- Check logs first
- Review this documentation
- Create support ticket with:
  - Error messages
  - System configuration
  - Steps to reproduce
