const router = require('express').Router();
const pool = require('../db');
router.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: '🎉 Database Connected Successfully!',
      timestamp: result.rows[0].now,
      database: 'PostgreSQL (Supabase)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Database Connection Failed',
      error: error.message
    });
  }
});
module.exports = router;