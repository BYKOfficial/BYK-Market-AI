const router = require('express').Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware - Token verify karo
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

// BUY
router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const { asset_name, asset_type, quantity, price } = req.body;
    const userId = req.user.id;
    const total = quantity * price;

    // User ka balance check karo
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (user.virtual_balance < total) {
      return res.status(400).json({ success: false, message: '❌ Insufficient balance!' });
    }

    // Balance deduct karo
    await pool.query(
      'UPDATE users SET virtual_balance = virtual_balance - $1 WHERE id = $2',
      [total, userId]
    );

    // Portfolio check karo - already hai?
    const existing = await pool.query(
      'SELECT * FROM portfolio WHERE user_id = $1 AND asset_name = $2',
      [userId, asset_name]
    );

    if (existing.rows.length > 0) {
      // Average price update karo
      const old = existing.rows[0];
      const newQty = parseFloat(old.quantity) + parseFloat(quantity);
      const newAvg = ((parseFloat(old.quantity) * parseFloat(old.avg_buy_price)) + total) / newQty;
      await pool.query(
        'UPDATE portfolio SET quantity = $1, avg_buy_price = $2 WHERE user_id = $3 AND asset_name = $4',
        [newQty, newAvg, userId, asset_name]
      );
    } else {
      // Naya entry banao
      await pool.query(
        'INSERT INTO portfolio (user_id, asset_name, asset_type, quantity, avg_buy_price) VALUES ($1, $2, $3, $4, $5)',
        [userId, asset_name, asset_type, quantity, price]
      );
    }

    // Transaction record karo
    await pool.query(
      'INSERT INTO transactions (user_id, type, asset_name, asset_type, quantity, price, total) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userId, 'BUY', asset_name, asset_type, quantity, price, total]
    );

    const updatedUser = await pool.query('SELECT virtual_balance FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: `✅ ${asset_name} kharida gaya!`,
      data: {
        asset_name, quantity, price, total,
        remaining_balance: updatedUser.rows[0].virtual_balance
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SELL
router.post('/sell', authMiddleware, async (req, res) => {
  try {
    const { asset_name, quantity, price } = req.body;
    const userId = req.user.id;
    const total = quantity * price;

    // Portfolio check karo
    const existing = await pool.query(
      'SELECT * FROM portfolio WHERE user_id = $1 AND asset_name = $2',
      [userId, asset_name]
    );

    if (existing.rows.length === 0) {
      return res.status(400).json({ success: false, message: '❌ Asset portfolio mein nahi hai!' });
    }

    const holding = existing.rows[0];
    if (parseFloat(holding.quantity) < parseFloat(quantity)) {
      return res.status(400).json({ success: false, message: '❌ Itna quantity nahi hai!' });
    }

    const profit_loss = (price - parseFloat(holding.avg_buy_price)) * quantity;
    const newQty = parseFloat(holding.quantity) - parseFloat(quantity);

    if (newQty === 0) {
      await pool.query('DELETE FROM portfolio WHERE user_id = $1 AND asset_name = $2', [userId, asset_name]);
    } else {
      await pool.query('UPDATE portfolio SET quantity = $1 WHERE user_id = $2 AND asset_name = $3', [newQty, userId, asset_name]);
    }

    // Balance add karo
    await pool.query('UPDATE users SET virtual_balance = virtual_balance + $1 WHERE id = $2', [total, userId]);

    // Transaction record karo
    await pool.query(
      'INSERT INTO transactions (user_id, type, asset_name, asset_type, quantity, price, total, profit_loss) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [userId, 'SELL', asset_name, holding.asset_type, quantity, price, total, profit_loss]
    );

    const updatedUser = await pool.query('SELECT virtual_balance FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: `✅ ${asset_name} becha gaya!`,
      data: {
        asset_name, quantity, price, total,
        profit_loss: profit_loss.toFixed(2),
        new_balance: updatedUser.rows[0].virtual_balance
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;