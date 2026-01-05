const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Додаємо SSL для Render PostgreSQL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Додаємо таймаути
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Додаємо обробку помилок підключення
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
