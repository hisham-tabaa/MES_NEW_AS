# After-Sales Service Management System - Database Schema

## Tables Overview

### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL CHECK (role IN ('company_manager', 'deputy_manager', 'department_manager', 'section_supervisor', 'technician')),
    department_id INTEGER REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Departments Table
```sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Customers Table
```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    category VARCHAR(50) NOT NULL, -- TV, Refrigerator, Washing Machine, etc.
    department_id INTEGER REFERENCES departments(id),
    warranty_months INTEGER DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Requests Table (Main Entity)
```sql
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated
    customer_id INTEGER REFERENCES customers(id),
    product_id INTEGER REFERENCES products(id),
    department_id INTEGER REFERENCES departments(id),
    assigned_technician_id INTEGER REFERENCES users(id),
    received_by_id INTEGER REFERENCES users(id), -- Reception employee
    
    -- Request Details
    issue_description TEXT NOT NULL,
    execution_method VARCHAR(20) CHECK (execution_method IN ('on_site', 'workshop')),
    warranty_status VARCHAR(20) CHECK (warranty_status IN ('under_warranty', 'out_of_warranty')),
    purchase_date DATE,
    
    -- Status Management
    status VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'under_inspection', 'waiting_parts', 'in_repair', 'completed', 'closed')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- SLA Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    closed_at TIMESTAMP,
    sla_due_date TIMESTAMP,
    is_overdue BOOLEAN DEFAULT false,
    
    -- Final Details
    final_notes TEXT,
    customer_satisfaction INTEGER CHECK (customer_satisfaction BETWEEN 1 AND 5),
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Request Activities Table (Audit Trail)
```sql
CREATE TABLE request_activities (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES requests(id),
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- 'status_change', 'assignment', 'comment', 'cost_added'
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Request Costs Table
```sql
CREATE TABLE request_costs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES requests(id),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    cost_type VARCHAR(30) CHECK (cost_type IN ('parts', 'labor', 'transportation', 'other')),
    added_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Notifications Table
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    request_id INTEGER REFERENCES requests(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) CHECK (type IN ('assignment', 'overdue', 'status_change', 'completion')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes for Performance
```sql
-- Request queries
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_department ON requests(department_id);
CREATE INDEX idx_requests_technician ON requests(assigned_technician_id);
CREATE INDEX idx_requests_created_at ON requests(created_at);
CREATE INDEX idx_requests_overdue ON requests(is_overdue);

-- Activity queries
CREATE INDEX idx_activities_request ON request_activities(request_id);
CREATE INDEX idx_activities_created_at ON request_activities(created_at);

-- User queries
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
```

## Seed Data Structure

### Departments
1. LG Maintenance
2. Solar Energy  
3. TP-Link
4. Epson

### User Roles Hierarchy
- Company Manager (full access)
- Deputy Manager (full access except some admin functions)
- Department Manager (department-specific access)
- Section Supervisor (can assign technicians)
- Technician (can update assigned requests)

### Request Status Flow
1. **new** → Created by reception
2. **assigned** → Assigned to technician by supervisor
3. **under_inspection** → Technician investigating
4. **waiting_parts** → Waiting for spare parts
5. **in_repair** → Being repaired
6. **completed** → Work finished
7. **closed** → Request officially closed

### SLA Rules
- Under warranty: 7 days
- Out of warranty: 10 days
- On-site visits: +2 days buffer
