require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Country Currency & Exchange API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synced');

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;