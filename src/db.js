const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.ilhpjxuzafojdtrxjubc',
  password: process.env.DB_PASSWORD || 'BYK767002amin',
  ssl: { rejectUnauthorized: false },
  family: 4
});

module.exports = pool;