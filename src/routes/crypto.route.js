const router = require('express').Router();
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

router.get('/prices', async (req, res) => {
  try {
    const USD_TO_INR = 84;

    const results = await Promise.all(
      COINS.map(async (coin) => {
        const response = await axios.get(
          `https://api.exchange.coinbase.com/products/${coin.pair}/stats`
        );
        const data = response.data;
        const last = parseFloat(data.last);
        const open = parseFloat(data.open);
        const change = open > 0 ? parseFloat(((last - open) / open * 100).toFixed(2)) : 0;

        return {
          id: coin.id.toLowerCase(),
          name: coin.name,
          symbol: coin.id,
          price_inr: parseFloat((last * USD_TO_INR).toFixed(2)),
          change_24h: change,
          market_cap: 0,
          image: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${coin.id.toLowerCase()}.png`
        };
      })
    );

    res.json({ success: true, message: '🚀 Live Crypto Prices', count: results.length, data: results });

  } catch (error) {
    res.status(500).json({ success: false, message: '❌ Failed to fetch crypto prices', error: error.message });
  }
});

module.exports = router;