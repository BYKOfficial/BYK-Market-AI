const router = require('express').Router();
const axios = require('axios');

const COINS = ['BTC','ETH','BNB','SOL','XRP','DOGE','ADA','TRX','DOT','LTC'];
const NAMES = {
  BTC:'Bitcoin', ETH:'Ethereum', BNB:'BNB', SOL:'Solana',
  XRP:'XRP', DOGE:'Dogecoin', ADA:'Cardano', TRX:'TRON',
  DOT:'Polkadot', LTC:'Litecoin'
};

router.get('/prices', async (req, res) => {
  try {
    const USD_TO_INR = 84;
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${COINS.join(',')}&tsyms=USD`
    );

    const raw = response.data.RAW;
    const coins = COINS.map(symbol => ({
      id: symbol.toLowerCase(),
      name: NAMES[symbol],
      symbol: symbol,
      price_inr: parseFloat((raw[symbol].USD.PRICE * USD_TO_INR).toFixed(2)),
      change_24h: parseFloat(raw[symbol].USD.CHANGEPCT24HOUR.toFixed(2)),
      market_cap: raw[symbol].USD.MKTCAP,
      image: `https://www.cryptocompare.com${raw[symbol].USD.IMAGEURL}`
    }));

    res.json({ success: true, message: '🚀 Live Crypto Prices', count: coins.length, data: coins });

  } catch (error) {
    res.status(500).json({ success: false, message: '❌ Failed to fetch crypto prices', error: error.message });
  }
});

module.exports = router;