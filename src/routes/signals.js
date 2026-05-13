const express = require('express');
const router = express.Router();
const axios = require('axios');

function getSignal(change) {
  const c = parseFloat(change);
  if (isNaN(c)) return { signal: 'HOLD', reason: 'Data unavailable', color: '#aaa' };
  if (c >= 5) return { signal: 'SELL', reason: `+${c.toFixed(2)}% — Overbought`, color: '#ff4444' };
  if (c >= 2) return { signal: 'SELL', reason: `+${c.toFixed(2)}% — Rising fast`, color: '#ff8800' };
  if (c <= -5) return { signal: 'BUY', reason: `${c.toFixed(2)}% — Oversold`, color: '#00ff88' };
  if (c <= -2) return { signal: 'BUY', reason: `${c.toFixed(2)}% — Dip opportunity`, color: '#00cc66' };
  return { signal: 'HOLD', reason: `${c.toFixed(2)}% — Stable`, color: '#ffcc00' };
}

router.get('/', async (req, res) => {
  try {
    const cryptoRes = await axios.get('https://byk-market-ai.onrender.com/api/crypto/prices');
    const signals = cryptoRes.data.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      price: coin.price_inr,
      change: coin.change_24h,
      ...getSignal(coin.change_24h),
    }));
    res.json({ success: true, data: signals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;