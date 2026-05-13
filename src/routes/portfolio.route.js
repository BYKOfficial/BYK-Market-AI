const router = require('express').Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

const COIN_PAIRS = {
  'Bitcoin': 'BTC-USD', 'Ethereum': 'ETH-USD', 'Solana': 'SOL-USD',
  'XRP': 'XRP-USD', 'Dogecoin': 'DOGE-USD', 'Cardano': 'ADA-USD',
  'Litecoin': 'LTC-USD', 'Polkadot': 'DOT-USD', 'Avalanche': 'AVAX-USD',
  'Chainlink': 'LINK-USD',
};
const USD_TO_INR = 84;

async function getCurrentPrice(asset_name, asset_type, avg_buy_price) {
  try {
    if (asset_type === 'crypto') {
      const pair = COIN_PAIRS[asset_name];
      if (!pair) return parseFloat(avg_buy_price);
      const res = await axios.get(`https://api.exchange.coinbase.com/products/${pair}/stats`);
      return parseFloat(res.data.last) * USD_TO_INR;
    } else {
      const symbol = asset_name === 'TCS' ? 'TCS.BO' :
                     asset_name === 'Reliance Industries' ? 'RELIANCE.BO' :
                     asset_name === 'HDFC Bank' ? 'HDFCBANK.BO' :
                     asset_name === 'Infosys' ? 'INFY.BO' :
                     asset_name === 'Wipro' ? 'WIPRO.BO' : asset_name;
      const res = await axios.get(`https://byk-market-ai.onrender.com/api/stock/price/${symbol}`);
      return parseFloat(res.data.data.price);
    }
  } catch {
    return parseFloat(avg_buy_price);
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      'SELECT id, name, email, virtual_balance FROM users WHERE id = $1', [userId]
    );
    const user = userResult.rows[0];

    const portfolioResult = await pool.query(
      'SELECT * FROM portfolio WHERE user_id = $1', [userId]
    );

    let totalInvested = 0;
    let totalCurrentValue = 0;

    const holdingsWithPnL = await Promise.all(
      portfolioResult.rows.map(async (item) => {
        const qty = parseFloat(item.quantity);
        const avgPrice = parseFloat(item.avg_buy_price);
        const invested = qty * avgPrice;
        const currentPrice = await getCurrentPrice(item.asset_name, item.asset_type, avgPrice);
        const currentValue = qty * currentPrice;
        const pnl = currentValue - invested;
        const pnlPercent = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : 0;

        totalInvested += invested;
        totalCurrentValue += currentValue;

        return {
          ...item,
          current_price: parseFloat(currentPrice.toFixed(2)),
          current_value: parseFloat(currentValue.toFixed(2)),
          pnl: parseFloat(pnl.toFixed(2)),
          pnl_percent: parseFloat(pnlPercent),
        };
      })
    );

    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      message: '📊 Your Portfolio',
      data: {
        user: {
          name: user.name,
          email: user.email,
          virtual_balance: parseFloat(user.virtual_balance),
        },
        holdings: holdingsWithPnL,
        total_holdings: holdingsWithPnL.length,
        total_invested: totalInvested.toFixed(2),
        total_current_value: totalCurrentValue.toFixed(2),
        total_pnl: totalPnL.toFixed(2),
        total_pnl_percent: parseFloat(totalPnLPercent),
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC', [userId]
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