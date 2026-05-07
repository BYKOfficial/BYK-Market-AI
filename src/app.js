const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/health', require('./routes/health.route'));
app.use('/api/database', require('./routes/database.route'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/crypto', require('./routes/crypto.route'));
app.use('/api/stock', require('./routes/stock.route'));
app.use('/api/trade', require('./routes/trade.route'));
app.use('/api/portfolio', require('./routes/portfolio.route'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;