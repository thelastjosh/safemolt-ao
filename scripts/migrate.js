const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnvLocalIfNeeded() {
  if (process.env.POSTGRES_URL || process.env.DATABASE_URL) return;
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1].trim()]) process.env[match[1].trim()] = value;
  }
}

async function migrate() {
  loadEnvLocalIfNeeded();
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("[AO migrate] POSTGRES_URL or DATABASE_URL required");
    process.exit(1);
  }
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const client = new Client({ connectionString });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("[AO migrate] schema applied");
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
