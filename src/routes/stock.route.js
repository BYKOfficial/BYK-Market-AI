const router = require('express').Router();
const axios = require('axios');

router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const meta = response.data.chart.result[0].meta;

    res.json({
      success: true,
      message: `📈 ${symbol} Stock Price`,
      data: {
        symbol: meta.symbol,
        name: meta.longName || symbol,
        price: meta.regularMarketPrice,
        change: (meta.regularMarketPrice - meta.previousClose).toFixed(2),
        change_percent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
        currency: meta.currency
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch stock price',
      error: error.message
    });
  }
});

router.post('/prices', async (req, res) => {
  try {
    const { symbols } = req.body;
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
          const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          const meta = response.data.chart.result[0].meta;
          return {
            symbol: meta.symbol,
            name: meta.longName || symbol,
            price: meta.regularMarketPrice,
            change: (meta.regularMarketPrice - meta.previousClose).toFixed(2),
            change_percent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
            currency: meta.currency,
            success: true
          };
        } catch {
          return { symbol, success: false, price: null };
        }
      })
    );

    res.json({
      success: true,
      message: '📊 Stock Prices',
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch stocks',
      error: error.message
    });
  }
});

module.exports = router;