# 🚀 Quick Start Guide

Get the After-Sales Service Management System up and running in minutes!

## Prerequisites
- Docker and Docker Compose installed
- Git installed
- 8GB+ RAM recommended

## 🏃‍♂️ One-Command Setup

```bash
# Clone and start the entire system
git clone <your-repository-url>
cd after-sales-management-system
docker-compose up -d
```

That's it! The system will:
1. ✅ Start PostgreSQL database
2. ✅ Build and start the backend API
3. ✅ Build and start the frontend
4. ✅ Set up all networking

## 🎯 Initialize with Sample Data

```bash
# Wait for services to be ready (about 30 seconds)
docker-compose exec backend npm run db:push
docker-compose exec backend npm run db:seed
```

## 🌐 Access the System

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 🔑 Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| **Company Manager** | `admin` | `[Hidden for Security]` |
| **Deputy Manager** | `deputy` | `[Hidden for Security]` |
| **Department Manager** | `lg_manager` | `[Hidden for Security]` |
| **Section Supervisor** | `lg_supervisor` | `[Hidden for Security]` |
| **Technician** | `tech1` | `[Hidden for Security]` |

> **Note**: Passwords are hidden for security. Contact the administrator for login credentials.

## 🎮 Test the System

### 1. Login as Company Manager
- Go to http://localhost:3000
- Login with admin credentials (contact administrator)
- Explore the dashboard

### 2. View Sample Requests
- Click "Requests" in sidebar
- See 15+ sample requests with different statuses
- Click on any request to view details

### 3. Test Role-Based Access
- Logout and login as technician credentials (contact administrator)
- Notice limited navigation options
- Try accessing different sections

### 4. Create a New Request
- Login as any user
- Click "New Request" or go to `/requests/new`
- Fill out the form (customers and products are pre-loaded)

## 📱 Features to Test

### ✅ Authentication & Authorization
- [x] Login with different roles
- [x] Role-based navigation
- [x] Protected routes

### ✅ Request Management
- [x] View requests list with filtering
- [x] Request details with audit trail
- [x] Status updates
- [x] Assignment to technicians
- [x] Cost tracking
- [x] SLA monitoring

### ✅ Dashboard
- [x] Statistics cards
- [x] Recent requests
- [x] Quick actions

### ✅ Data Management
- [x] Customers list
- [x] Products catalog
- [x] User management (admin only)
- [x] Department information

## 🛠 Development Mode

### Backend Development
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database URL
npm run dev
```

### Frontend Development
```bash
cd frontend  
npm install
npm start
```

### Database Management
```bash
# View database
docker-compose exec postgres psql -U after_sales_user -d after_sales_db

# Reset database
docker-compose exec backend npm run db:reset

# View logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔧 Troubleshooting

### Services Not Starting?
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

### Database Connection Issues?
```bash
# Check database is running
docker-compose exec postgres pg_isready -U after_sales_user

# Recreate database
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run db:push
docker-compose exec backend npm run db:seed
```

### Frontend Not Loading?
```bash
# Check if backend is ready
curl http://localhost:3001/health

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Port Conflicts?
```bash
# Stop other services using ports 3000, 3001, 5432
sudo lsof -ti:3000,3001,5432 | xargs kill -9

# Or change ports in docker-compose.yml
```

## 📊 Sample Data Overview

The system comes with:
- **10 Users** across all roles
- **4 Departments** (LG, Solar, TP-Link, Epson)
- **5 Customers** with Arabic names
- **6 Products** across different categories
- **15 Requests** in various stages
- **Activity logs** for audit trail

## 🎯 Next Steps

1. **Explore the UI** - Navigate through all sections
2. **Test workflows** - Create requests, assign technicians, update statuses
3. **Check reports** - View dashboard statistics
4. **Test notifications** - See overdue request alerts
5. **Customize** - Modify for your specific needs

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- View [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Look at the API endpoints in backend code
- Check Docker logs: `docker-compose logs [service]`

## 🎉 Success Indicators

You know it's working when:
- ✅ Login page loads at http://localhost:3000
- ✅ Can login with demo credentials
- ✅ Dashboard shows statistics
- ✅ Can view request list with data
- ✅ Role-based navigation works
- ✅ API health check returns OK

---

**🎊 Congratulations! Your After-Sales Service Management System is ready!**

Start exploring and customize it for your business needs.
