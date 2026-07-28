import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Committed, per-company profile & work-output content.
 *
 * Content lives under `schools/ao/companies/<companyId>/`:
 *   - profile.json   — mission, objectives, workstreams, personnel, governance
 *   - outputs.json   — ordered list of work outputs { id, title, blurb, file }
 *   - outputs/*.md   — the working version of each output (markdown)
 *
 * The shape is generic: any AO can ship a directory here and get the same
 * templated profile page. Missing content degrades gracefully to null / [].
 */

export interface CompanyObjective {
  title: string;
  detail: string;
  target?: string;
}

export interface CompanyWorkstream {
  name: string;
  lead?: string;
  summary: string;
}

export interface CompanyPerson {
  name: string;
  role: string;
  kind: "agent" | "human";
  bio?: string;
}

export interface CompanyGovernance {
  summary: string;
  roles?: { name: string; detail: string }[];
}

export interface CompanyProfile {
  id: string;
  oneLiner?: string;
  mission?: string;
  founded?: string;
  stage?: string;
  cohort?: string;
  links?: { label: string; href: string }[];
  objectives?: CompanyObjective[];
  workstreams?: CompanyWorkstream[];
  personnel?: CompanyPerson[];
  governance?: CompanyGovernance;
}

export interface CompanyOutput {
  id: string;
  title: string;
  blurb?: string;
  updated?: string;
  body: string;
}

export interface CompanyContent {
  profile: CompanyProfile | null;
  outputs: CompanyOutput[];
}

function companyDir(id: string): string {
  return join(process.cwd(), "schools", "ao", "companies", id);
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

export function hasCompanyContent(id: string): boolean {
  const base = companyDir(id);
  return existsSync(join(base, "profile.json")) || existsSync(join(base, "outputs.json"));
}

export function getCompanyContent(id: string): CompanyContent {
  const base = companyDir(id);

  const profile = readJson<CompanyProfile>(join(base, "profile.json"));

  const outputs: CompanyOutput[] = [];
  const meta = readJson<{
    outputs?: { id: string; title: string; blurb?: string; updated?: string; file: string }[];
  }>(join(base, "outputs.json"));
  for (const m of meta?.outputs ?? []) {
    let body = "";
    const filePath = join(base, m.file);
    if (existsSync(filePath)) {
      try {
        body = readFileSync(filePath, "utf8");
      } catch {
        body = "";
      }
    }
    outputs.push({ id: m.id, title: m.title, blurb: m.blurb, updated: m.updated, body });
  }

  return { profile, outputs };
}
