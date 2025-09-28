#!/usr/bin/env node

/**
 * SQLite to PostgreSQL Migration Script
 * 
 * This script migrates data from SQLite to PostgreSQL
 * Run this after setting up PostgreSQL and updating the schema
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// SQLite connection (source)
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// PostgreSQL connection (destination)
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 Starting SQLite to PostgreSQL migration...');
  
  try {
    // Check if SQLite database exists
    const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');
    if (!fs.existsSync(sqliteDbPath)) {
      console.log('❌ SQLite database not found. Nothing to migrate.');
      return;
    }

    console.log('📊 Connecting to databases...');
    await sqlitePrisma.$connect();
    await postgresPrisma.$connect();

    // Migrate Departments
    console.log('📁 Migrating departments...');
    const departments = await sqlitePrisma.department.findMany();
    for (const dept of departments) {
      await postgresPrisma.department.upsert({
        where: { id: dept.id },
        update: dept,
        create: dept
      });
    }
    console.log(`✅ Migrated ${departments.length} departments`);

    // Migrate Users
    console.log('👥 Migrating users...');
    const users = await sqlitePrisma.user.findMany();
    for (const user of users) {
      await postgresPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate Customers
    console.log('🏢 Migrating customers...');
    const customers = await sqlitePrisma.customer.findMany();
    for (const customer of customers) {
      await postgresPrisma.customer.upsert({
        where: { id: customer.id },
        update: customer,
        create: customer
      });
    }
    console.log(`✅ Migrated ${customers.length} customers`);

    // Migrate Products
    console.log('📦 Migrating products...');
    const products = await sqlitePrisma.product.findMany();
    for (const product of products) {
      await postgresPrisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`✅ Migrated ${products.length} products`);

    // Migrate Spare Parts
    console.log('🔧 Migrating spare parts...');
    const spareParts = await sqlitePrisma.sparePart.findMany();
    for (const part of spareParts) {
      await postgresPrisma.sparePart.upsert({
        where: { id: part.id },
        update: part,
        create: part
      });
    }
    console.log(`✅ Migrated ${spareParts.length} spare parts`);

    // Migrate Requests
    console.log('📋 Migrating requests...');
    const requests = await sqlitePrisma.request.findMany();
    for (const request of requests) {
      await postgresPrisma.request.upsert({
        where: { id: request.id },
        update: request,
        create: request
      });
    }
    console.log(`✅ Migrated ${requests.length} requests`);

    // Migrate Request Activities
    console.log('📝 Migrating request activities...');
    const activities = await sqlitePrisma.requestActivity.findMany();
    for (const activity of activities) {
      await postgresPrisma.requestActivity.upsert({
        where: { id: activity.id },
        update: activity,
        create: activity
      });
    }
    console.log(`✅ Migrated ${activities.length} activities`);

    // Migrate Request Costs
    console.log('💰 Migrating request costs...');
    const costs = await sqlitePrisma.requestCost.findMany();
    for (const cost of costs) {
      await postgresPrisma.requestCost.upsert({
        where: { id: cost.id },
        update: cost,
        create: cost
      });
    }
    console.log(`✅ Migrated ${costs.length} costs`);

    // Migrate Request Parts
    console.log('🔩 Migrating request parts...');
    const requestParts = await sqlitePrisma.requestPart.findMany();
    for (const part of requestParts) {
      await postgresPrisma.requestPart.upsert({
        where: { id: part.id },
        update: part,
        create: part
      });
    }
    console.log(`✅ Migrated ${requestParts.length} request parts`);

    // Migrate Notifications
    console.log('🔔 Migrating notifications...');
    const notifications = await sqlitePrisma.notification.findMany();
    for (const notification of notifications) {
      await postgresPrisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification
      });
    }
    console.log(`✅ Migrated ${notifications.length} notifications`);

    console.log('🎉 Migration completed successfully!');
    
    // Verify migration
    console.log('\n📊 Verification:');
    const counts = {
      departments: await postgresPrisma.department.count(),
      users: await postgresPrisma.user.count(),
      customers: await postgresPrisma.customer.count(),
      products: await postgresPrisma.product.count(),
      spareParts: await postgresPrisma.sparePart.count(),
      requests: await postgresPrisma.request.count(),
      activities: await postgresPrisma.requestActivity.count(),
      costs: await postgresPrisma.requestCost.count(),
      requestParts: await postgresPrisma.requestPart.count(),
      notifications: await postgresPrisma.notification.count()
    };
    
    console.table(counts);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
