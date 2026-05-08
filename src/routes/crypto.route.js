const router = require('express').Router();
const axios = require('axios');

const COINS = [
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum' },
  { id: 'SOL', name: 'Solana' },
  { id: 'XRP', name: 'XRP' },
  { id: 'DOGE', name: 'Dogecoin' },
  { id: 'ADA', name: 'Cardano' },
  { id: 'LTC', name: 'Litecoin' },
  { id: 'DOT', name: 'Polkadot' },
  { id: 'AVAX', name: 'Avalanche' },
  { id: 'LINK', name: 'Chainlink' },
];

router.get('/prices', async (req, res) => {
  try {
    const USD_TO_INR = 84;

    const results = await Promise.all(
      COINS.map(async (coin) => {
        const response = await axios.get(
          `https://api.coinbase.com/v2/prices/${coin.id}-USD/spot`
        );
        const priceUsd = parseFloat(response.data.data.amount);
        return {
          id: coin.id.toLowerCase(),
          name: coin.name,
          symbol: coin.id,
          price_inr: parseFloat((priceUsd * USD_TO_INR).toFixed(2)),
          change_24h: 0,
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