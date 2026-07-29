# Infrastructure Gap Report — Edition 1 (2026-W29)

**Owner:** Steward (CFO) · **Goal:** Infrastructure & integrations · **Cadence:** weekly (see routine created alongside this report) · **Snapshot time:** 2026-07-14T19:10Z

## 1. Purpose

Recurring inventory of (a) AO tooling that already exists, (b) what Motherboard has actually integrated into its own operations, and (c) the gap between the two. Every gap below is a captured requirement for a future integration proposal — **nothing here authorizes installing, crediting, or provisioning anything.** Per Constitution 2.2/3.6, adoption requires a real integration proposal through the approvals gate, ratified by a board member.

## 2. Tooling inventory

| Tool | What it does | Status in this company |
|---|---|---|
| **Paperclip** (this platform) | Goals, issues, documents with revision history, comments (recorded deliberation), approvals gate, agent/company budgets with hard-stops | **Fully integrated.** In active use for all five loops today: this report is a Paperclip document, the MOT-9 re-plan ran through issue comments, budgets are enforced per-agent (see §4). |
| **SafeMolt AO plugin** (`stanfordao.safemolt-ao`, source at `/home/sam/plugin-repos/paperclip-plugin-safemolt-ao`) | Path A: real-time milestone events → SafeMolt. Path B: weekly rollup (`week_rollup` tool computes a deterministic `kpi_snapshot v2` — throughput, coordination, **treasury/llm_cost_cents, budget_incidents** — then `submit_weekly_update` publishes the narrative). Path C: Paperclip documents with `safemolt_publish: true` frontmatter become SafeMolt working papers after the publish gate. Ships a `weekly-update` routine (Mon 09:00 UTC) and a dead-letter retry job. | **Not installed.** No plugin routines, no `week_rollup`/`submit_weekly_update` tools are registered for this company (verified: company routines list is empty, tool search finds nothing). It exists only as source code on the local filesystem — it has never been proposed or approved for this company. |
| **`thelastjosh/autonomous-organizations`** (GitHub repo) | Canonical home for AO Index entries; agent-authored PRs of schema-conformant JSON, merged by humans. Not a Motherboard-owned datastore (Constitution §4, platform-first). | **Not connected.** Blocked on a board-supplied scoped GitHub credential (flagged in the MOT-3 board rescope comment, 2026-07-14; no credential-provisioning approval found in this company's approvals list as of this snapshot — `GET /api/companies/{id}/approvals` returns empty). Cartographer's MOT-12/14 curation can proceed by hand-validating against the schema doc in the meantime, per that same comment. |

## 3. Finding 1 — today's course-correction as the worked example

Before the Constitution/Statutory Charter landed, the original roadmap (MOT-1/MOT-2) followed the platform's default startup script: hire an engineer, build infrastructure, deploy. Three tasks were opened against that instinct and all three duplicated ground the inventory above already covers:

- **MOT-5** (working-paper publishing pipeline behind a human gate) and **MOT-6** (charter versioning + recorded-deliberation log) — both **cancelled**. Paperclip documents already carry full revision history and gate publication via comments/approvals; SafeMolt Path C already renders a gated working-paper pipeline. Building either in-house would have been new software where an existing mechanism serves (Constitution §4).
- **MOT-7** (confirm hosting provider + budget for a Motherboard-owned deployment) — **cancelled** by board decision: Motherboard runs on the Paperclip host the board already operates, and the sign-off route used (engineer → Steward, agent-to-agent) does not satisfy Constitution 2.2's "board approval via the approvals gate" requirement for spend/provisioning. That comment is a direct correction of Steward's own prior handling of MOT-7 — recorded here as the concrete example of the bright line, not just an abstract rule.
- **MOT-3** (AO Index datastore) and **MOT-4** (claims register store) were **rescoped, not cancelled** — both had already shipped a full backing service before the board redirect landed (a real `index_entries`/`claims` datastore, ingestion CLI, query surface). The board's rescope reduced them to: file-based/JSON storage plus a thin integrity-check script, because the index's real home is the GitHub repo (not a Motherboard datastore) and the claims register is versioned data, not a service. The engineering work was sound; the target was over-built relative to what the platform-first principle actually calls for.

**Root cause:** the default-startup-script plan predates the governance documents and defaults to a build-first instinct. The structural fix already exists — Constitution §4's platform-first ordering (Paperclip → SafeMolt plugin → the GitHub repo → only then new software) and §3.6's proposal-before-install requirement — but this report is the first time it's been applied retrospectively as a named gap-detection pass rather than a one-off board correction.

## 4. Finding 2 — the SafeMolt plugin is a ready-made answer to this issue's own ask

This issue asks Steward to "allocate the weekly compute budget... report spend-per-artifact... recurring, feeds the bi-weekly dispatch." The SafeMolt plugin's Path B (`week_rollup` + `submit_weekly_update`) already computes exactly this shape of data every week — `kpi_snapshot.treasury` (balance, allocated, `spent_by_category`, allocation_decisions, allocations_gated_by_human) and `kpi_snapshot.throughput.llm_cost_cents`, sourced from Paperclip's own `cost_events`/`budget_incidents` tables, deterministically reproducible, with a dry-run default (`dryRun: true`) that logs the would-be publish instead of sending. Hand-rolling a parallel spend-per-artifact process (as this edition partly does, in §6 below, for lack of anything else installed yet) is exactly the duplication Finding 1 describes, just one loop over. **Gap:** no integration proposal has been filed to adopt this plugin. Recommendation in §7.

## 5. Finding 3 — no unified spend-per-artifact ledger

Agent budgets (`spentMonthlyCents`) are visible per-agent via Paperclip's own API, but nothing today decomposes that spend by deliverable/artifact — this report's §6 table is a manual reconciliation against issue comments, done by hand this edition. The company-level spend snapshot (**$18.62** company-wide) does not reconcile exactly against the sum of the five agents' individual snapshots (**$16.19**) taken moments apart in this same session — expected, since both are live counters and this report itself consumes budget while being written, but it means point-in-time manual reconciliation will always show drift. This is the same gap as Finding 2 from a different angle: `kpi_snapshot.treasury.spent_by_category` is the existing mechanism for exactly this, once the plugin is installed.

## 6. Finding 4 — agent-level budget ceilings sum above the company-level hard-stop

Company budget: **$200.00/month** (20000 cents), **$18.62** spent to date. Each of the five agents individually carries a **$50.00/month** ceiling (5000 cents) — summed, **$250.00/month**, i.e. **25% above** the company-level ceiling. Constitution 3.4 makes both levels hard-stops. As configured, if all five agents pace evenly toward their own $50 ceiling, the company-level stop binds first (at 80% of the sum of individual caps) and halts *all* agents pending human approval, even though no individual agent has breached its own limit. This isn't a crisis at $18.62/$200 spent, but it's worth the board's attention before load increases — either raise the company ceiling to match the sum of agent ceilings, or lower agent ceilings so they sum to the company figure, whichever reflects the board's actual intent.

## 7. Weekly budget allocation (this edition)

Company ceiling $200/month ≈ **$46/week** (using a 4.345-week month). Allocated across the five loops by current priority/load, not equally — Charter re-plan, AO Index, and Claims are the active mission-critical loops this week; Infrastructure & Publication carry lighter weekly load right now:

| Loop | Owning agent | Weekly target | Rationale |
|---|---|---|---|
| Charter loop | Chartermaster (CEO) | $8/wk | MOT-9 re-plan (critical) + MOT-10 first amendment cycle, both in progress |
| AO Index | Cartographer (PM) | $11/wk | MOT-12/14 curation targeting ≥10 entries in 2 weeks; scout sub-agents not yet spawned |
| Claims & research directions | Research Analyst | $11/wk | MOT-13/15 targeting ≥10 evidence-linked claims in 2 weeks |
| Infrastructure & integrations | Steward (CFO) | $9/wk | This report + integration-proposal drafting (§8); Founding Engineer draws separately per below |
| Publication | Chartermaster (CEO), dry-run only | $7/wk | MOT-17 founding paper, dry-run until Editorial Policy is ratified by Josh Tan — kept light while output can't yet go public |
| **Total** | | **$46/wk** | matches the $200/mo company ceiling at a 4.345-week month |

**Founding Engineer (millwright) and any future sub-agents:** per Constitution §5, sub-agents are spawned within Steward-allocated budget, drawn from the commissioning loop's line above (not a separate fixed line) — e.g. Cartographer requesting index-scout sub-agents draws from the AO Index $11/wk. No sub-agents are active in the company today. Millwright itself is a board-ratified core hire, not a sub-agent, and is currently between assignments (MOT-3/4 rescoped work shipped; next request should route through whichever loop needs engineering next — likely AO Index PR-prep tooling once the GitHub credential lands).

These are **internal pacing targets**, not new hard-stops — the enforced ceilings remain the board-set company ($200/mo) and per-agent ($50/mo each) figures above.

## 8. Spend-per-artifact (actual, to date — manual reconciliation, see Finding 3)

All five agents were created earlier today (2026-07-14); figures are cumulative since creation, not a full week.

| Agent | Spent to date | Artifacts delivered | Approx. $/artifact |
|---|---|---|---|
| Founding Engineer (millwright) | $11.23 | 3 — MOT-2 substrate skeleton; MOT-3 rescoped AO Index ingest tooling; MOT-4 rescoped claims register + integrity checker | ~$3.74 |
| Chartermaster (CEO) | $3.32 | Hiring plan (MOT-1); MOT-9 re-plan directive follow-through; MOT-10/MOT-17 in progress (not yet counted as delivered) | not final — work in progress |
| Steward (CFO, self) | $1.64 | MOT-7 hosting/budget decision write-up; this gap report (in progress) | not final — work in progress |
| Cartographer (PM) | $0.00 | 0 delivered yet — MOT-12/14 in progress | — |
| Research Analyst | $0.00 | 0 delivered yet — MOT-13/15 in progress | — |
| **Company total (snapshot)** | **$18.62** | | |

## 9. Recommendations / next steps

1. **File an integration proposal for the SafeMolt AO plugin** (Finding 2) through the approvals gate — install in its default `dryRun: true` mode, scoped to Path B first (weekly rollup/dispatch) since that's the immediate need; Path A/C adoption can follow as separate proposals once Editorial Policy is ratified. Steward will draft this as a follow-up issue; **nothing is installed by this report**.
2. **Board to resolve the GitHub credential path** for `thelastjosh/autonomous-organizations` (Finding 1) — no credential-provisioning request currently exists in this company's approvals gate; this is blocking Cartographer's automated PR-prep tooling (rescoped MOT-3) but not manual, hand-validated curation.
3. **Board to reconcile the company vs. agent budget ceiling mismatch** (Finding 4) — confirm whether $200/mo company-wide or $250/mo (sum of agent ceilings) reflects actual intent, and adjust one side.
4. **Recurring cadence:** a weekly routine (`Infrastructure gap report`, Mon 09:00 UTC) has been created alongside this report so Edition 2 is scheduled automatically; each firing creates a fresh issue under the Infrastructure & integrations goal.
