// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/after_sales_db',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  
  // Email
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'no-reply@company.com',
  
  // SLA Configuration (in hours)
  slaUnderWarranty: parseInt(process.env.SLA_UNDER_WARRANTY || '168', 10), // 7 days
  slaOutOfWarranty: parseInt(process.env.SLA_OUT_OF_WARRANTY || '240', 10), // 10 days
  slaOnsiteBuffer: parseInt(process.env.SLA_ONSITE_BUFFER || '48', 10), // 2 days
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10), // Increased from 100 to 1000
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Development mode check
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
