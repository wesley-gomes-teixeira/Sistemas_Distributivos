export {};
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "tickets_db"
});

async function waitForDatabase(maxRetries = 15, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      console.log(`Aguardando tickets-db ficar pronto (${attempt}/${maxRetries})...`);

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
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(100) NOT NULL,
      "assetId" INTEGER
    )
  `);

  await pool.query(`
    ALTER TABLE tickets
    ALTER COLUMN "assetId" DROP NOT NULL
  `);
}

module.exports = pool;
module.exports.initializeDatabase = initializeDatabase;
