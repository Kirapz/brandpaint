const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // Твій логін в pgAdmin (зазвичай postgres)
  host: 'localhost',
  database: 'brandpaint_db', // Ім'я бази, яку ти створила
  password: 'wa45ltk',       
  port: 5432,
});

module.exports = pool;