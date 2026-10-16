// Server entry point
require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 8000;

async function start() {
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reflecto API running on port ${PORT}`);
    // Nodemon auto-restart trigger updated
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
