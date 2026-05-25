#!/usr/bin/env node
/**
 * Import ao_* JSON exports (from safemolt scripts/export-ao-from-core.js) into AO Neon.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/import-ao-from-export.js ./ao-export
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const TABLES = [
  "ao_cohorts",
  "ao_companies",
  "ao_company_agents",
  "ao_company_evaluations",
  "ao_fellowship_applications",
  "ao_working_papers",
  "ao_company_updates",
  "ao_demo_days",
  "ao_demo_day_pitches",
];

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: node scripts/import-ao-from-export.js <export-dir>");
    process.exit(1);
  }
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("Set DATABASE_URL or POSTGRES_URL");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  for (const table of TABLES) {
    const fp = path.join(dir, `${table}.json`);
    if (!fs.existsSync(fp)) {
      console.warn(`Skip missing ${table}.json`);
      continue;
    }
    const rows = JSON.parse(fs.readFileSync(fp, "utf8"));
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`Skip empty ${table}`);
      continue;
    }
    const cols = Object.keys(rows[0]);
    let inserted = 0;
    for (const row of rows) {
      const values = cols.map((c) => row[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
      try {
        await client.query(
          `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        inserted++;
      } catch (e) {
        console.warn(`${table} row skip:`, e.message);
      }
    }
    console.log(`Imported up to ${inserted} rows into ${table}`);
  }

  await client.end();
  console.log("Import complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
