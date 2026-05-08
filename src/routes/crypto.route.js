const router = require('express').Router();
const axios = require('axios');

const COINS = [
  { id: 'BTC', name: 'Bitcoin', kraken: 'XBTUSD' },
  { id: 'ETH', name: 'Ethereum', kraken: 'ETHUSD' },
  { id: 'SOL', name: 'Solana', kraken: 'SOLUSD' },
  { id: 'XRP', name: 'XRP', kraken: 'XRPUSD' },
  { id: 'DOGE', name: 'Dogecoin', kraken: 'XDGUSD' },
  { id: 'ADA', name: 'Cardano', kraken: 'ADAUSD' },
  { id: 'LTC', name: 'Litecoin', kraken: 'XLTCZUSD' },
  { id: 'DOT', name: 'Polkadot', kraken: 'DOTUSD' },
  { id: 'AVAX', name: 'Avalanche', kraken: 'AVAXUSD' },
  { id: 'LINK', name: 'Chainlink', kraken: 'LINKUSD' },
];

router.get('/prices', async (req, res) => {
  try {
    const USD_TO_INR = 84;

    const krakenPairs = COINS.map(c => c.kraken).join(',');
    const krakenRes = await axios.get(
      `https://api.kraken.com/0/public/Ticker?pair=${krakenPairs}`
    );
    const krakenData = krakenRes.data.result;

    const results = COINS.map(coin => {
      const ticker = krakenData[coin.kraken] || Object.values(krakenData).find((_, i) => Object.keys(krakenData)[i].includes(coin.id));
      const priceUsd = ticker ? parseFloat(ticker.c[0]) : 0;
      const open = ticker ? parseFloat(ticker.o) : 0;
      const change = open > 0 ? parseFloat(((priceUsd - open) / open * 100).toFixed(2)) : 0;

      return {
        id: coin.id.toLowerCase(),
        name: coin.name,
        symbol: coin.id,
        price_inr: parseFloat((priceUsd * USD_TO_INR).toFixed(2)),
        change_24h: change,
        market_cap: 0,
        image: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${coin.id.toLowerCase()}.png`
      };
    });

    res.json({ success: true, message: '🚀 Live Crypto Prices', count: results.length, data: results });

  } catch (error) {
    res.status(500).json({ success: false, message: '❌ Failed to fetch crypto prices', error: error.message });
  }
});

module.exports = router;