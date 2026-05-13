const express = require('express');
const router = express.Router();
const axios = require('axios');

const COINS = [
  { id: 'BTC', name: 'Bitcoin', pair: 'BTC-USD' },
  { id: 'ETH', name: 'Ethereum', pair: 'ETH-USD' },
  { id: 'SOL', name: 'Solana', pair: 'SOL-USD' },
  { id: 'XRP', name: 'XRP', pair: 'XRP-USD' },
  { id: 'DOGE', name: 'Dogecoin', pair: 'DOGE-USD' },
  { id: 'ADA', name: 'Cardano', pair: 'ADA-USD' },
  { id: 'LTC', name: 'Litecoin', pair: 'LTC-USD' },
  { id: 'DOT', name: 'Polkadot', pair: 'DOT-USD' },
  { id: 'AVAX', name: 'Avalanche', pair: 'AVAX-USD' },
  { id: 'LINK', name: 'Chainlink', pair: 'LINK-USD' },
];

const USD_TO_INR = 84;

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
    const results = await Promise.all(
      COINS.map(async (coin) => {
        const response = await axios.get(
          `https://api.exchange.coinbase.com/products/${coin.pair}/stats`
        );
        const data = response.data;
        const last = parseFloat(data.last);
        const open = parseFloat(data.open);
        const change = open > 0 ? parseFloat(((last - open) / open * 100).toFixed(2)) : 0;
        const signal = getSignal(change);
        return {
          id: coin.id.toLowerCase(),
          name: coin.name,
          symbol: coin.id,
          image: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${coin.id.toLowerCase()}.png`,
          price: parseFloat((last * USD_TO_INR).toFixed(2)),
          change: change,
          signal: signal.signal,
          reason: signal.reason,
          color: signal.color,
        };
      })
    );
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;