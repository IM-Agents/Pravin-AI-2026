const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const webhookRoutes = require('./routes/webhooks');
const orderRoutes = require('./routes/orders');
const printerRoutes = require('./routes/printers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api/webhooks', bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); } }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/webhooks', webhookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/printers', printerRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OMA Backend Service is running', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Order Management Automation API',
    version: '1.0.0',
    endpoints: { webhooks: '/api/webhooks', orders: '/api/orders', printers: '/api/printers', health: '/health' }
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

const startServer = async () => {
  try {
    await testConnection();
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');
    app.listen(PORT, () => {
      console.log(\`🚀 OMA Backend Server running on port \${PORT}\`);
      console.log(\`📍 Environment: \${process.env.NODE_ENV || 'development'}\`);
      console.log(\`🔗 API URL: http://localhost:\${PORT}\`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
