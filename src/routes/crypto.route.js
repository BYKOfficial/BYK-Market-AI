const router = require('express').Router();
const axios = require('axios');

const CRYPTO_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', short: 'BTC' },
  { symbol: 'ETHUSDT', name: 'Ethereum', short: 'ETH' },
  { symbol: 'BNBUSDT', name: 'BNB', short: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana', short: 'SOL' },
  { symbol: 'XRPUSDT', name: 'XRP', short: 'XRP' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', short: 'DOGE' },
  { symbol: 'ADAUSDT', name: 'Cardano', short: 'ADA' },
  { symbol: 'TRXUSDT', name: 'TRON', short: 'TRX' },
  { symbol: 'DOTUSDT', name: 'Polkadot', short: 'DOT' },
  { symbol: 'LTCUSDT', name: 'Litecoin', short: 'LTC' },
];

router.get('/prices', async (req, res) => {
  try {
    const USD_TO_INR = 84;

    const results = await Promise.all(
      CRYPTO_SYMBOLS.map(async (coin) => {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.symbol}`
        );
        const data = response.data;
        const priceUsd = parseFloat(data.lastPrice);
        return {
          id: coin.short.toLowerCase(),
          name: coin.name,
          symbol: coin.short,
          price_inr: parseFloat((priceUsd * USD_TO_INR).toFixed(2)),
          change_24h: parseFloat(parseFloat(data.priceChangePercent).toFixed(2)),
          market_cap: 0,
          image: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${coin.short.toLowerCase()}.png`
        };
      })
    );

    res.json({
      success: true,
      message: '🚀 Live Crypto Prices',
      count: results.length,
      data: results
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