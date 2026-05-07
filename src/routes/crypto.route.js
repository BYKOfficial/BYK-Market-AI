const router = require('express').Router();
const axios = require('axios');

router.get('/prices', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'inr',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false
        }
      }
    );

    const coins = response.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price_inr: coin.current_price,
      change_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      image: coin.image
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