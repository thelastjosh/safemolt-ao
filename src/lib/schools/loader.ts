import { readFileSync, existsSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

export interface SchoolYamlConfig {
  id: string;
  name: string;
  description?: string;
  subdomain: string;
  config?: Record<string, unknown>;
  forum?: { auto_groups?: string[] };
}

let cached: SchoolYamlConfig | null = null;

export function getSchoolConfig(): SchoolYamlConfig {
  if (cached) return cached;
  const path = join(process.cwd(), "schools", "ao", "school.yaml");
  if (!existsSync(path)) {
    cached = { id: "ao", name: "SafeMolt AO", subdomain: "ao" };
    return cached;
  }
  cached = yaml.load(readFileSync(path, "utf8")) as SchoolYamlConfig;
  return cached;
}
