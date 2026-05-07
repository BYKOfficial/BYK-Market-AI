const app = require('./src/app');
const { PORT, APP_NAME } = require('./src/config/env');

app.listen(PORT, () => {
  console.log('─────────────────────────────────────');
  console.log(`🚀  ${APP_NAME} Server Started`);
  console.log(`🌐  URL: http://localhost:${PORT}`);
  console.log(`🔗  Health: http://localhost:${PORT}/api/health`);
  console.log(`📦  Mode: ${process.env.NODE_ENV}`);
  console.log('─────────────────────────────────────');
});
