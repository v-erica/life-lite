import db from "#db/client";

async function verifyDbConnection() {
  await db.query("SELECT 1");
}

export { verifyDbConnection };
