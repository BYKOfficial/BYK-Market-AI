const router = require('express').Router();
const axios = require('axios');

router.get('/prices', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coincap.io/v2/assets?limit=10'
    );

    const USD_TO_INR = 84;

    const coins = response.data.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price_inr: parseFloat((parseFloat(coin.priceUsd) * USD_TO_INR).toFixed(2)),
      change_24h: parseFloat(parseFloat(coin.changePercent24Hr).toFixed(2)),
      market_cap: parseFloat(coin.marketCapUsd),
      image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`
    }));

    res.json({
      success: true,
      message: '🚀 Live Crypto Prices',
      count: coins.length,
      data: coins
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch crypto prices',
      error: error.message
    });
  }
});

module.exports = router;