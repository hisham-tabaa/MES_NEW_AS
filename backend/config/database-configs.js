/**
 * Database Configuration for Different Cloud Providers
 * 
 * This file contains database connection configurations for various cloud providers.
 * Copy the appropriate configuration to your .env file.
 */

const databaseConfigs = {
  // Local PostgreSQL (Docker)
  local: {
    DATABASE_URL: "postgresql://after_sales_user:after_sales_password@localhost:5432/after_sales_db?schema=public",
    description: "Local PostgreSQL running in Docker container"
  },

  // Railway PostgreSQL
  railway: {
    DATABASE_URL: "postgresql://postgres:${RAILWAY_DB_PASSWORD}@${RAILWAY_DB_HOST}:${RAILWAY_DB_PORT}/${RAILWAY_DB_NAME}",
    environment: {
      RAILWAY_DB_HOST: "containers-us-west-xxx.railway.app",
      RAILWAY_DB_PORT: "5432",
      RAILWAY_DB_NAME: "railway",
      RAILWAY_DB_PASSWORD: "your-railway-password"
    },
    description: "Railway PostgreSQL - Automatic scaling, $5/month",
    setup: [
      "1. Create Railway account at railway.app",
      "2. Create new project",
      "3. Add PostgreSQL service",
      "4. Copy connection details to .env",
      "5. Run: npm run db:push"
    ]
  },

  // AWS RDS PostgreSQL
  aws_rds: {
    DATABASE_URL: "postgresql://${AWS_DB_USER}:${AWS_DB_PASSWORD}@${AWS_DB_HOST}:5432/${AWS_DB_NAME}",
    environment: {
      AWS_DB_HOST: "after-sales-db.cluster-xxx.us-west-2.rds.amazonaws.com",
      AWS_DB_NAME: "after_sales_db",
      AWS_DB_USER: "postgres",
      AWS_DB_PASSWORD: "your-secure-password"
    },
    description: "AWS RDS PostgreSQL - Enterprise grade, pay-as-you-go",
    setup: [
      "1. Create AWS account",
      "2. Go to RDS console",
      "3. Create PostgreSQL database",
      "4. Configure security groups",
      "5. Copy endpoint to .env",
      "6. Run: npm run db:push"
    ]
  },

  // Azure Database for PostgreSQL
  azure: {
    DATABASE_URL: "postgresql://${AZURE_DB_USER}:${AZURE_DB_PASSWORD}@${AZURE_DB_HOST}:5432/${AZURE_DB_NAME}?sslmode=require",
    environment: {
      AZURE_DB_HOST: "after-sales-server.postgres.database.azure.com",
      AZURE_DB_NAME: "after_sales_db",
      AZURE_DB_USER: "azureuser",
      AZURE_DB_PASSWORD: "your-secure-password"
    },
    description: "Azure Database for PostgreSQL - Managed service with backup",
    setup: [
      "1. Create Azure account",
      "2. Create PostgreSQL server",
      "3. Configure firewall rules",
      "4. Create database",
      "5. Copy connection string to .env",
      "6. Run: npm run db:push"
    ]
  },

  // Google Cloud SQL PostgreSQL
  gcp: {
    DATABASE_URL: "postgresql://${GCP_DB_USER}:${GCP_DB_PASSWORD}@${GCP_DB_HOST}:5432/${GCP_DB_NAME}",
    environment: {
      GCP_DB_HOST: "xxx.xxx.xxx.xxx", // Public IP
      GCP_DB_NAME: "after_sales_db",
      GCP_DB_USER: "postgres",
      GCP_DB_PASSWORD: "your-secure-password"
    },
    description: "Google Cloud SQL PostgreSQL - Integrated with GCP services",
    setup: [
      "1. Create GCP account",
      "2. Enable Cloud SQL API",
      "3. Create PostgreSQL instance",
      "4. Configure authorized networks",
      "5. Copy connection details to .env",
      "6. Run: npm run db:push"
    ]
  },

  // Supabase PostgreSQL
  supabase: {
    DATABASE_URL: "postgresql://postgres:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:5432/postgres",
    environment: {
      SUPABASE_HOST: "db.xxx.supabase.co",
      SUPABASE_PASSWORD: "your-supabase-password"
    },
    description: "Supabase PostgreSQL - Free tier available, easy setup",
    setup: [
      "1. Create Supabase account",
      "2. Create new project",
      "3. Go to Settings > Database",
      "4. Copy connection string",
      "5. Update .env file",
      "6. Run: npm run db:push"
    ]
  },

  // PlanetScale (MySQL alternative)
  planetscale: {
    DATABASE_URL: "mysql://${PLANETSCALE_USER}:${PLANETSCALE_PASSWORD}@${PLANETSCALE_HOST}/${PLANETSCALE_DB}?sslaccept=strict",
    environment: {
      PLANETSCALE_HOST: "aws.connect.psdb.cloud",
      PLANETSCALE_DB: "after-sales",
      PLANETSCALE_USER: "your-username",
      PLANETSCALE_PASSWORD: "your-password"
    },
    description: "PlanetScale MySQL - Serverless, branching database",
    note: "Requires changing Prisma provider to 'mysql'",
    setup: [
      "1. Create PlanetScale account",
      "2. Create database",
      "3. Create branch (main)",
      "4. Generate password",
      "5. Update schema.prisma provider to 'mysql'",
      "6. Update .env file",
      "7. Run: npm run db:push"
    ]
  }
};

// Helper function to generate .env content
function generateEnvConfig(provider) {
  const config = databaseConfigs[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  let envContent = `# ${config.description}\n`;
  envContent += `DATABASE_URL="${config.DATABASE_URL}"\n\n`;

  if (config.environment) {
    envContent += "# Environment variables for this provider:\n";
    Object.entries(config.environment).forEach(([key, value]) => {
      envContent += `${key}="${value}"\n`;
    });
  }

  return envContent;
}

// Export configurations
module.exports = {
  databaseConfigs,
  generateEnvConfig
};

// CLI usage
if (require.main === module) {
  const provider = process.argv[2];
  
  if (!provider) {
    console.log("Available database providers:");
    Object.keys(databaseConfigs).forEach(key => {
      console.log(`  ${key}: ${databaseConfigs[key].description}`);
    });
    console.log("\nUsage: node database-configs.js <provider>");
    process.exit(1);
  }

  try {
    console.log(generateEnvConfig(provider));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
