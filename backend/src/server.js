const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Authentication Server Running                   ║
║                                                       ║
║   Port:        ${config.port}                                  ║
║   Environment: ${config.nodeEnv}                        ║
║   CORS Origin: ${config.corsOrigin}          ║
║                                                       ║
║   API Endpoints:                                      ║
║   POST   /api/auth/signup                            ║
║   POST   /api/auth/login                             ║
║   GET    /api/auth/verify                            ║
║   POST   /api/auth/logout                            ║
║   GET    /api/users                                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

