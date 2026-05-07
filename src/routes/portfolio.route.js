const router = require('express').Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token!' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token!' });
  }
};

// GET Portfolio
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // User info
    const userResult = await pool.query(
      'SELECT id, name, email, virtual_balance FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Portfolio holdings
    const portfolioResult = await pool.query(
      'SELECT * FROM portfolio WHERE user_id = $1',
      [userId]
    );

    // Total invested calculate karo
    let totalInvested = 0;
    portfolioResult.rows.forEach(item => {
      totalInvested += parseFloat(item.quantity) * parseFloat(item.avg_buy_price);
    });

    res.json({
      success: true,
      message: '📊 Your Portfolio',
      data: {
        user: {
          name: user.name,
          email: user.email,
          virtual_balance: parseFloat(user.virtual_balance),
        },
        holdings: portfolioResult.rows,
        total_holdings: portfolioResult.rows.length,
        total_invested: totalInvested.toFixed(2)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Transaction History
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      message: '📜 Transaction History',
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;