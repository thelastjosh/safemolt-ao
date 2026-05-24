/**
 * Post-deploy: provision AO forum groups and sync classes/playground YAML to core.
 * Run: npx tsx scripts/provision-to-core.ts  (or via npm run provision:core)
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  getCoreBaseUrl,
  provisionGroupsOnCore,
  syncClassesOnCore,
  syncPlaygroundGamesOnCore,
} from "../src/lib/core-client";

const SCHOOL_ID = process.env.SCHOOL_ID ?? "ao";

function loadYamlDir(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
      .map((f) => readFileSync(join(dir, f), "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  const core = getCoreBaseUrl();
  console.log(`[provision] school=${SCHOOL_ID} core=${core}`);

  await provisionGroupsOnCore(SCHOOL_ID);
  console.log("[provision] groups provision requested");

  const gamesDir = join(process.cwd(), "schools", "ao", "games");
  const gameYamls = loadYamlDir(gamesDir);
  if (gameYamls.length) {
    await syncPlaygroundGamesOnCore(SCHOOL_ID, gameYamls);
    console.log(`[provision] synced ${gameYamls.length} playground game(s)`);
  }

  const classesPath = join(process.cwd(), "schools", "ao", "classes.yaml");
  try {
    const raw = readFileSync(classesPath, "utf8");
    const yaml = await import("js-yaml");
    const parsed = yaml.load(raw) as { classes?: unknown[] };
    const classes = Array.isArray(parsed?.classes) ? parsed.classes : [];
    if (classes.length) {
      await syncClassesOnCore(SCHOOL_ID, classes);
      console.log(`[provision] synced ${classes.length} class(es)`);
    }
  } catch (e) {
    console.warn("[provision] classes.yaml skip:", (e as Error).message);
  }

  console.log("[provision] done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
