const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 BYK Market AI Server is LIVE!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
