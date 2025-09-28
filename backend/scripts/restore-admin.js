#!/usr/bin/env node

/**
 * Admin Account Restoration Script
 * 
 * This script restores the admin account with static credentials
 * Username: admin
 * Password: admin123
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function restoreAdminAccount() {
  console.log('🔄 Restoring admin account...');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Update existing admin with new password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const updatedAdmin = await prisma.user.update({
        where: { username: 'admin' },
        data: {
          passwordHash: hashedPassword,
          role: 'COMPANY_MANAGER',
          isActive: true,
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@company.com',
          phone: '+963911234567'
        }
      });
      
      console.log('✅ Admin account updated successfully');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@company.com',
          passwordHash: hashedPassword,
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+963911234567',
          role: 'COMPANY_MANAGER',
          isActive: true,
          preferredCurrency: 'SYP'
        }
      });
      
      console.log('✅ Admin account created successfully');
    }

    console.log('\n🔑 Admin Account Details:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: COMPANY_MANAGER');
    console.log('   Email: admin@company.com');
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
    
    console.log('\n✅ Admin account restoration completed successfully!');
    
  } catch (error) {
    console.error('❌ Admin account restoration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run restoration
if (require.main === module) {
  restoreAdminAccount();
}

module.exports = { restoreAdminAccount };
