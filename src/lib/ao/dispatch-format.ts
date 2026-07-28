/**
 * Templated formatting for weekly AO dispatches.
 *
 * Every AO's weekly update renders through the same structure — Summary,
 * Human Governance, and an "AO Performance" KPI table — so dispatches are
 * comparable across organizations. The functions here are pure and generic;
 * they take a dispatch's raw markdown + kpi_snapshot and return the pieces the
 * UI lays out. Nothing here is Motherboard-specific.
 *
 * Two content paths are supported:
 *   1. Convention (preferred): the narrative contains `## Summary` and
 *      `## Human Governance` sections whose bullet lists are lifted directly.
 *   2. Fallback (legacy dispatches): the summary is derived from the lead
 *      paragraph, accomplishments from the workstream sub-headings, and
 *      governance from lines that describe board/gate/ratification actions.
 */

export interface KpiRow {
  label: string;
  value: string;
}
export interface KpiGroup {
  label: string;
  rows: KpiRow[];
}

export interface FormattedDispatch {
  /** One-sentence overview shown above the bullets. */
  summary: string | null;
  /** One-liner accomplishments. */
  accomplishments: string[];
  /** Decisions/actions that crossed the human governance surface. */
  governance: string[];
  /** "AO Performance" — KPI/Result rows grouped by kpi_snapshot group. */
  performance: KpiGroup[];
  /** Full sanitized narrative, for an optional "read the full dispatch" view. */
  narrative: string;
}

// Broad signal used to scan for governance-flavoured sentences.
const GOVERNANCE_SIGNAL =
  /\b(ratif|approv|board|publish[- ]gate|sign-?off|amendment|governance|delegat|reject)/i;
// Stricter test for the fallback: an actual governance action, not spend/other.
const GOVERNANCE_ACTION =
  /\b(ratif|approv|board (?:approved|ratified|directed|raised)|publish[- ]gate|sign-?off|delegat|reject|adopted)/i;
const NON_GOVERNANCE = /(\$|\bcap\b|remaining|per-agent|budget cap)/i;
// Byline / metadata lines that should never be used as a summary.
const BYLINE_LIKE = /(authored by|week of\b.*\bcycle|·.*·)/i;

// Sections that are structural/metric, never treated as accomplishments.
const META_HEADINGS = new Set(
  [
    "summary",
    "human governance",
    "governance",
    "ao performance",
    "performance",
    "narrative",
    "charter_metrics",
    "charter metrics",
    "charter_metrics (self-scored)",
    "spend",
    "prioritization decisions",
    "prioritization",
    "metrics",
  ].map((s) => s.toLowerCase())
);

/**
 * Strip Paperclip-internal noise so nothing leaks onto the public page:
 * the "experimental artifacts" disclaimer, `MOT-NN` issue refs, internal
 * API paths, and `[[wikilinks]]`.
 */
export function sanitizeForDisplay(md: string): string {
  let out = md;

  // Remove the standard experimental-artifacts disclaimer blockquote.
  out = out.replace(/^>.*(experimental artifacts|positions of Stanford)[^\n]*\n?/gim, "");

  // Drop parentheticals dominated by internal issue refs, e.g.
  // "(Added by MOT-20, ratified by board.)", "(MOT-16 Ed. 1, MOT-26 Ed. 2)".
  out = out.replace(/\s*\([^)]*MOT-\d+[^)]*\)/g, "");

  // Remove code spans that reference internal issue/document API paths.
  out = out.replace(/`[^`]*\/api\/(?:issues|plugins)\/[^`]*`/g, "");

  // Unwrap [[wikilinks]] to their text.
  out = out.replace(/\[\[([^\]]+)\]\]/g, "$1");

  // Remove any remaining bare issue refs and tidy the fallout.
  out = out.replace(/\b(?:per|see|via|from|in)\s+MOT-\d+/gi, "");
  out = out.replace(/\bMOT-\d+(?:['’]s)?/g, "");

  // Cosmetic cleanup left by the removals above.
  out = out.replace(/\(\s*[,;]?\s*\)/g, ""); // empty ()
  out = out.replace(/[ \t]{2,}/g, " "); // collapse runs of spaces
  out = out.replace(/ +([,;:])/g, "$1"); // space before punctuation (not periods, keeps " ...")
  out = out.replace(/([,;:])\1+/g, "$1"); // doubled punctuation (periods left alone for ellipses)
  out = out.replace(/\n{3,}/g, "\n\n"); // collapse blank lines

  return out.trim();
}

function humanizeLabel(key: string): string {
  let s = key
    .replace(/_pct$/i, " %")
    .replace(/_cents$/i, " (¢)")
    .replace(/_hrs$/i, " (hrs)")
    .replace(/_/g, " ")
    .trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatValue(v: unknown): string {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") {
    // Show integers plainly; keep up to 2 decimals otherwise.
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  }
  return String(v);
}

const isScalar = (v: unknown): boolean =>
  typeof v === "number" || typeof v === "string" || typeof v === "boolean";

/**
 * Flatten a (possibly nested) kpi_snapshot into ordered KPI/Result groups.
 * Skips `_meta` and any non-scalar leaves. Top-level scalars are collected
 * under a "Headline" group.
 */
export function buildPerformance(kpiSnapshot: Record<string, unknown> | undefined | null): KpiGroup[] {
  if (!kpiSnapshot || typeof kpiSnapshot !== "object") return [];
  const groups: KpiGroup[] = [];

  const headline: KpiRow[] = [];
  for (const [k, v] of Object.entries(kpiSnapshot)) {
    if (k === "_meta") continue;
    if (isScalar(v)) headline.push({ label: humanizeLabel(k), value: formatValue(v) });
  }
  if (headline.length) groups.push({ label: "Headline", rows: headline });

  for (const [group, val] of Object.entries(kpiSnapshot)) {
    if (group === "_meta") continue;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const rows: KpiRow[] = [];
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (isScalar(v)) rows.push({ label: humanizeLabel(k), value: formatValue(v) });
      }
      if (rows.length) groups.push({ label: humanizeLabel(group), rows });
    }
  }

  return groups;
}

interface Section {
  heading: string;
  level: number;
  lines: string[];
}

/** Split markdown into heading-delimited sections (level 2+). */
function splitSections(md: string): { preamble: string[]; sections: Section[] } {
  const lines = md.split("\n");
  const preamble: string[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const m = /^(#{2,6})\s+(.*)$/.exec(line);
    if (m) {
      if (current) sections.push(current);
      current = { heading: m[2].trim(), level: m[1].length, lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  if (current) sections.push(current);
  return { preamble, sections };
}

function findSection(sections: Section[], name: string): Section | null {
  const target = name.toLowerCase();
  return (
    sections.find((s) => s.heading.toLowerCase() === target) ??
    sections.find((s) => s.heading.toLowerCase().startsWith(target)) ??
    null
  );
}

// A list bullet is "- " or "* " (with a following space); "**bold**" is not.
const BULLET_RE = /^([-*]\s+|\d+\.\s+)/;

function stripInlineMd(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

function bulletLines(lines: string[]): string[] {
  return lines
    .map((l) => l.trim())
    .filter((l) => BULLET_RE.test(l))
    .map((l) => stripInlineMd(l.replace(BULLET_RE, "")))
    .filter(Boolean);
}

function firstParagraph(lines: string[]): string | null {
  const buf: string[] = [];
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) {
      if (buf.length) break;
      continue;
    }
    if (/^(#|>|\|)/.test(l) || BULLET_RE.test(l)) {
      if (buf.length) break;
      continue;
    }
    buf.push(l);
  }
  return buf.length ? stripInlineMd(buf.join(" ")) : null;
}

/** Bold lead-in phrases like "**Batch 1 complete** — 20 entries…" → cleaned text. */
function boldLead(lines: string[]): string | null {
  for (const raw of lines) {
    const l = raw.trim();
    if (!l || /^(#|>|\|)/.test(l)) continue;
    const m = /\*\*(.+?)\*\*[:\s—-]*(.*)/.exec(l);
    if (m) {
      const lead = m[1].trim().replace(/[:\s—-]+$/, "");
      const rest = firstSentence(stripInlineMd(m[2]));
      return rest && /[a-z0-9]/i.test(rest) ? `${lead} — ${rest}` : lead;
    }
    if (!BULLET_RE.test(l)) return firstSentence(stripInlineMd(l));
  }
  return null;
}

function firstSentence(text: string): string {
  const t = stripInlineMd(text.trim());
  const m = /^(.*?[.!?])(\s|$)/.exec(t);
  return (m ? m[1] : t).trim().replace(/[\s:—-]+$/, "");
}

/**
 * Parse a dispatch into the templated pieces. Generic across AOs.
 */
export function formatDispatch(
  bodyMarkdown: string,
  kpiSnapshot?: Record<string, unknown> | null
): FormattedDispatch {
  const clean = sanitizeForDisplay(bodyMarkdown || "");
  const { preamble, sections } = splitSections(clean);

  // ---- Summary + accomplishments ----
  let summary: string | null = null;
  let accomplishments: string[] = [];

  const summarySection = findSection(sections, "summary");
  if (summarySection) {
    summary = firstParagraph(summarySection.lines);
    accomplishments = bulletLines(summarySection.lines);
  }

  if (!summary) {
    // Fallback: first real prose paragraph, skipping byline/metadata lines.
    // Prefer the Narrative section, then any non-meta content section, then preamble.
    const narrativeSection = findSection(sections, "narrative");
    const candidateLineSets = [
      narrativeSection?.lines,
      ...sections.filter((s) => !META_HEADINGS.has(s.heading.toLowerCase())).map((s) => s.lines),
      preamble,
    ].filter(Boolean) as string[][];
    for (const set of candidateLineSets) {
      const p = firstParagraph(set);
      if (p && !BYLINE_LIKE.test(p)) {
        summary = p;
        break;
      }
    }
  }

  if (accomplishments.length === 0) {
    // Fallback: each workstream sub-heading → one-liner (heading + bold lead-in).
    for (const s of sections) {
      if (META_HEADINGS.has(s.heading.toLowerCase())) continue;
      if (s.level < 3) continue; // workstream detail lives at H3+
      const lead = boldLead(s.lines);
      accomplishments.push(lead ? `${stripInlineMd(s.heading)}: ${lead}` : stripInlineMd(s.heading));
    }
  }

  // ---- Human governance ----
  let governance: string[] = [];
  const govSection = findSection(sections, "human governance") ?? findSection(sections, "governance");
  if (govSection) {
    governance = bulletLines(govSection.lines);
  }
  if (governance.length === 0) {
    // Fallback: bullets and bold lead-in phrases that describe a governance
    // action (ratification, approval, board/gate decisions), cleaned.
    const candidates: string[] = [];
    for (const raw of clean.split("\n")) {
      const l = raw.trim();
      if (!l || /^#/.test(l)) continue;
      if (BULLET_RE.test(l)) {
        candidates.push(stripInlineMd(l.replace(BULLET_RE, "")));
        continue;
      }
      const m = /\*\*(.+?)\*\*[:\s—-]*(.*)/.exec(l);
      if (m) candidates.push(stripInlineMd(`${m[1]} — ${m[2]}`).replace(/\s+—\s+$/, ""));
      // Also split the paragraph into sentences so mid-paragraph governance
      // actions (e.g. "Path B adopted") are captured, not just lead-ins.
      for (const sent of stripInlineMd(l).split(/(?<=[.!?])\s+/)) {
        if (sent) candidates.push(sent);
      }
    }
    const seen = new Set<string>();
    for (const c of candidates) {
      const s = firstSentence(c) || c;
      if (s.length < 12 || s.length > 220) continue;
      if (!GOVERNANCE_ACTION.test(s) || NON_GOVERNANCE.test(s)) continue;
      const key = s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 45);
      if (seen.has(key)) continue;
      seen.add(key);
      governance.push(s);
      if (governance.length >= 6) break;
    }
  }

  return {
    summary,
    accomplishments: accomplishments.slice(0, 12),
    governance: governance.slice(0, 8),
    performance: buildPerformance(kpiSnapshot),
    narrative: clean,
  };
}
