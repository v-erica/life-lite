const { Pool } = require("pg");
const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(
    `Missing required environment variables ${missing.join(", ")}`,
  );
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function verifyDbConnection() {
  await pool.query("SELECT 1");
}

module.exports = { pool, verifyDbConnection };
