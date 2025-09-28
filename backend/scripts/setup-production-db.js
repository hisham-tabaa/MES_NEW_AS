#!/usr/bin/env node

/**
 * Production Database Setup Script
 * 
 * This script sets up the production database with initial data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database...');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Push schema to database
    console.log('📊 Pushing database schema...');
    // Note: Run `npx prisma db push` separately

    // Create default admin user
    console.log('👤 Creating default admin user...');
    
    const adminExists = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@company.com',
          passwordHash: hashedPassword,
          firstName: 'System',
          lastName: 'Administrator',
          role: 'COMPANY_MANAGER',
          isActive: true,
          preferredCurrency: 'SYP'
        }
      });
      
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create default department
    console.log('🏢 Creating default department...');
    
    const deptExists = await prisma.department.findFirst({
      where: { name: 'General' }
    });

    if (!deptExists) {
      await prisma.department.create({
        data: {
          name: 'General',
          description: 'General department for all services'
        }
      });
      console.log('✅ Default department created');
    } else {
      console.log('ℹ️  Default department already exists');
    }

    // Verify setup
    console.log('\n📊 Database verification:');
    const counts = {
      users: await prisma.user.count(),
      departments: await prisma.department.count(),
      customers: await prisma.customer.count(),
      products: await prisma.product.count(),
      spareParts: await prisma.sparePart.count(),
      requests: await prisma.request.count()
    };
    
    console.table(counts);

    console.log('🎉 Production database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = { setupProductionDatabase };
