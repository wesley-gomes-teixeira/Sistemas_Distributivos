export {};
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "users_db"
});

async function waitForDatabase(maxRetries = 15, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      console.log(`Aguardando users-db ficar pronto (${attempt}/${maxRetries})...`);

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function initializeDatabase(): Promise<void> {
  await waitForDatabase();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL DEFAULT '',
      role VARCHAR(30) NOT NULL DEFAULT 'analyst'
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT ''
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'analyst'
  `);
}

module.exports = pool;
module.exports.initializeDatabase = initializeDatabase;
