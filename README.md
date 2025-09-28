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


