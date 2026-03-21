require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oma'
  },
  
  shopify: {
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || ''
  },
  
  pdf: {
    storagePath: process.env.PDF_STORAGE_PATH || './generated-pdfs'
  },
  
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000'
  }
};
