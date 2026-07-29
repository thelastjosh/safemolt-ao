import { sanitizeForDisplay, buildPerformance, formatDispatch } from "./dispatch-format";

describe("sanitizeForDisplay", () => {
  it("removes the experimental-artifacts disclaimer blockquote", () => {
    const md = "> Motherboard is an AO; its outputs are experimental artifacts, not positions of Stanford University.\n\nReal content.";
    const out = sanitizeForDisplay(md);
    expect(out).not.toMatch(/experimental artifacts/i);
    expect(out).toContain("Real content.");
  });

  it("strips MOT issue references and their parentheticals", () => {
    const md = "Two amendments applied (Added by MOT-20, ratified by board). See MOT-12 for details.";
    const out = sanitizeForDisplay(md);
    expect(out).not.toMatch(/MOT-\d+/);
  });

  it("unwraps wikilinks and removes internal api paths", () => {
    const md = "Stored per [[claims_register_pattern]] via `GET/PUT /api/issues/MOT-13/documents/x`.";
    const out = sanitizeForDisplay(md);
    expect(out).toContain("claims_register_pattern");
    expect(out).not.toContain("[[");
    expect(out).not.toContain("/api/issues/");
  });

  it("preserves ellipses", () => {
    expect(sanitizeForDisplay("wait for it... done")).toContain("...");
  });
});

describe("buildPerformance", () => {
  it("flattens nested kpi_snapshot into KPI/Result groups and skips _meta", () => {
    const kpi = {
      _meta: { period: "2026-W29" },
      health: { rollbacks: 0, defections: 0 },
      throughput: { heartbeats: 347, median_cycle_time_hrs: 0.15 },
      note: [1, 2, 3], // non-scalar, ignored
    };
    const groups = buildPerformance(kpi);
    const labels = groups.map((g) => g.label);
    expect(labels).toContain("Health");
    expect(labels).toContain("Throughput");
    expect(labels).not.toContain("Meta");
    const health = groups.find((g) => g.label === "Health")!;
    expect(health.rows).toEqual([
      { label: "Rollbacks", value: "0" },
      { label: "Defections", value: "0" },
    ]);
  });

  it("humanizes suffixes and formats values", () => {
    const groups = buildPerformance({ g: { telemetry_coverage_pct: 60, ok: true, cost_cents: 3163 } });
    const rows = groups[0].rows;
    expect(rows).toContainEqual({ label: "Telemetry coverage %", value: "60" });
    expect(rows).toContainEqual({ label: "Ok", value: "Yes" });
    expect(rows).toContainEqual({ label: "Cost (¢)", value: "3163" });
  });
});

describe("formatDispatch", () => {
  it("lifts Summary and Human Governance sections when the convention is used", () => {
    const md = [
      "# Weekly Dispatch",
      "",
      "## Summary",
      "",
      "A strong week overall.",
      "",
      "- Shipped the index",
      "- Opened cycle 2",
      "",
      "## Human Governance",
      "",
      "- Editorial policy ratified by the board",
      "- Budget raised at the gate",
    ].join("\n");
    const f = formatDispatch(md, { output: { artifacts: 1 } });
    expect(f.summary).toBe("A strong week overall.");
    expect(f.accomplishments).toEqual(["Shipped the index", "Opened cycle 2"]);
    expect(f.governance).toEqual([
      "Editorial policy ratified by the board",
      "Budget raised at the gate",
    ]);
    expect(f.performance[0].rows).toContainEqual({ label: "Artifacts", value: "1" });
  });

  it("does not repeat the summary sentence as a governance item", () => {
    const md = [
      "# Dispatch",
      "",
      "## Narrative",
      "",
      "This week produced its first artifacts, cleared through human sign-off at the publish gate.",
      "",
      "### Publication",
      "",
      "**Editorial Policy ratified** by the board.",
    ].join("\n");
    const f = formatDispatch(md, {});
    // the summary mentions sign-off, but must not appear verbatim in governance
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    expect(f.governance.map(norm)).not.toContain(norm(f.summary ?? ""));
  });

  it("falls back to workstream headings + governance signals for legacy dispatches", () => {
    const md = [
      "# Dispatch",
      "",
      "**Week of X · Authored by Y**",
      "",
      "## Narrative",
      "",
      "First operational week across all loops.",
      "",
      "### Charter loop",
      "",
      "**Cycle 1 complete** — two amendments ratified by the board.",
    ].join("\n");
    const f = formatDispatch(md, {});
    expect(f.summary).toBe("First operational week across all loops.");
    expect(f.accomplishments[0]).toMatch(/Charter loop:/);
    expect(f.governance.some((g) => /ratified/i.test(g))).toBe(true);
  });
});
