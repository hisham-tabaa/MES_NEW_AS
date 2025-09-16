const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting deployment process...');

// Set default DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set, using default SQLite database');
    process.env.DATABASE_URL = 'file:./prisma/dev.db';
}

console.log('Database URL:', process.env.DATABASE_URL);

try {
    // Create prisma directory if it doesn't exist
    const prismaDir = path.join(__dirname, 'prisma');
    if (!fs.existsSync(prismaDir)) {
        fs.mkdirSync(prismaDir, { recursive: true });
    }

    // Initialize/update database schema
    console.log('Pushing database schema...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

    // Try to seed the database
    console.log('Attempting to seed database...');
    try {
        execSync('npx prisma db seed', { stdio: 'inherit' });
        console.log('Database seeded successfully');
    } catch (seedError) {
        console.log('Database seeding skipped or failed (this might be normal if data already exists)');
        console.log('Seed error:', seedError.message);
    }

    // Start the application
    console.log('Starting the application...');
    execSync('npm start', { stdio: 'inherit' });

} catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
}
