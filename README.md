# After-Sales Service Management System

A comprehensive web-based internal system to automate after-sales service requests from registration until closure, with full tracking, role-based access, and transparent activity logs.

## 🎯 Project Overview

This system provides a complete solution for managing after-sales service requests with:

- **Role-based Access Control**: 5 different user roles with appropriate permissions
- **Request Lifecycle Management**: From creation to closure with full audit trail
- **SLA Monitoring**: Automatic tracking with overdue alerts
- **Department Routing**: Auto-assignment to correct departments
- **Professional UI**: Modern, responsive interface built with React and TailwindCSS
- **Real-time Updates**: Live status tracking and notifications

## 👥 User Roles

1. **Company Manager** - Full system access
2. **Deputy Manager** - Full access except some admin functions
3. **Department Manager** - Department-specific access
4. **Section Supervisor** - Can assign technicians, manage requests
5. **Technician** - Update assigned requests, add progress notes

## 🏢 Departments

- **LG Maintenance** - TVs, refrigerators, washing machines, dishwashers, ACs
- **Solar Energy** - Solar panels and energy systems
- **TP-Link** - Networking equipment and routers
- **Epson** - Printers and printing solutions

## 🔄 Request Workflow

1. **Reception** → Register customer and product details
2. **Warranty Check** → Determine warranty status
3. **Auto-routing** → System assigns to correct department
4. **Assignment** → Supervisor assigns technician
5. **Processing** → Technician updates status and progress
6. **Completion** → Work finished with final notes
7. **Closure** → Request officially closed with cost calculation

## 📊 Key Features

### Request Management
- Complete request lifecycle tracking
- Status updates with timestamps
- Cost tracking for out-of-warranty repairs
- Customer satisfaction ratings
- File attachments support

### SLA Monitoring
- Automatic SLA calculation based on warranty status
- Overdue request identification and alerts
- Performance metrics and reporting
- Escalation workflows

### Audit Trail
- Complete activity history for every request
- User action tracking with timestamps
- Data change logging (old vs new values)
- Comprehensive search and filtering

### Reports & Analytics
- Request volume and completion rates
- Department performance metrics
- Technician productivity reports
- Customer satisfaction trends
- SLA compliance statistics

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for type safety
- **Prisma** ORM with PostgreSQL
- **JWT** authentication
- **Winston** logging
- **Joi** validation
- **bcryptjs** password hashing

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Query** for API state management
- **React Hook Form** for form handling
- **Headless UI** for accessible components
- **Heroicons** for icons

### Database
- **PostgreSQL 15** with proper indexing
- **Prisma** migrations and schema management
- Foreign key relationships
- Full-text search capabilities

### DevOps
- **Docker** containerization
- **Docker Compose** for orchestration
- **Nginx** reverse proxy
- Health checks and logging
- Production-ready configuration

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd after-sales-management-system
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

4. **Initialize the database with seed data**
   ```bash
   docker-compose exec backend npm run db:seed
   ```

### Option 2: Manual Setup

1. **Clone and setup backend**
   ```bash
   git clone <repository-url>
   cd after-sales-management-system/backend
   npm install
   cp env.example .env
   # Edit .env with your database credentials
   npm run db:push
   npm run db:seed
   npm run dev
   ```

2. **Setup frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Setup PostgreSQL database**
   ```bash
   # Install PostgreSQL and create database
   createdb after_sales_db
   # Run migrations via Prisma
   cd backend && npm run db:push
   ```

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Company Manager | `admin` | `[Hidden for Security]` |
| Deputy Manager | `deputy` | `[Hidden for Security]` |
| LG Manager | `lg_manager` | `[Hidden for Security]` |
| Solar Manager | `solar_manager` | `[Hidden for Security]` |
| LG Supervisor | `lg_supervisor` | `[Hidden for Security]` |
| TP-Link Supervisor | `tplink_supervisor` | `[Hidden for Security]` |
| Technician 1 | `tech1` | `[Hidden for Security]` |
| Technician 2 | `tech2` | `[Hidden for Security]` |
| Technician 3 | `tech3` | `[Hidden for Security]` |
| Technician 4 | `tech4` | `[Hidden for Security]` |

> **Note**: Passwords are hidden for security. Contact the administrator for login credentials.

## 📁 Project Structure

```
after-sales-management-system/
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts        # Sample data
│   └── Dockerfile
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   └── types/         # TypeScript definitions
│   └── Dockerfile
│
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` file):
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/after_sales_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# SLA Configuration (in hours)
SLA_UNDER_WARRANTY=168  # 7 days
SLA_OUT_OF_WARRANTY=240 # 10 days
SLA_ONSITE_BUFFER=48    # 2 days

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@company.com"
SMTP_PASS="your-password"
```

### Database Schema

The system uses a comprehensive database schema with the following main tables:
- `users` - System users with roles
- `departments` - Service departments
- `customers` - Customer information
- `products` - Product catalog
- `requests` - Service requests (main entity)
- `request_activities` - Audit trail
- `request_costs` - Cost tracking
- `notifications` - System notifications

## 📋 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Requests
- `GET /api/requests` - List requests with filters
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id/status` - Update request status
- `PUT /api/requests/:id/assign` - Assign technician
- `POST /api/requests/:id/costs` - Add cost
- `PUT /api/requests/:id/close` - Close request

### Additional APIs
- Customers, Products, Users, Departments
- Dashboard statistics
- Reports and analytics

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Authorization** with granular permissions
- **Password Hashing** with bcrypt
- **Input Validation** with Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **SQL Injection Prevention** via Prisma ORM
- **XSS Protection** with security headers

## 📈 Performance Optimizations

- **Database Indexing** for fast queries
- **Connection Pooling** for database efficiency
- **Caching** with React Query
- **Code Splitting** in React
- **Image Optimization** and lazy loading
- **Gzip Compression** in Nginx
- **Health Checks** for reliability

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Deployment with Docker

1. **Configure environment variables**
   ```bash
   cp backend/env.example backend/.env
   # Edit .env with production values
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Initialize database**
   ```bash
   docker-compose exec backend npm run db:push
   docker-compose exec backend npm run db:seed
   ```

### Manual Production Deployment

1. **Build backend**
   ```bash
   cd backend
   npm install --production
   npm run build
   ```

2. **Build frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Deploy with PM2 or similar process manager**

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **Authentication Problems**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Clear browser localStorage

3. **Build Failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

### Logs

```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs postgres

# All services
docker-compose logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Future Enhancements

- [ ] Mobile app with React Native
- [ ] Real-time notifications with WebSocket
- [ ] Advanced reporting with charts
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch
- [ ] File management with cloud storage
- [ ] SMS notifications
- [ ] Customer portal
- [ ] Inventory management

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for efficient after-sales service management**
