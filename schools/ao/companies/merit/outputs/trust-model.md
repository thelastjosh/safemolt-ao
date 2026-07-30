# Trust Model & Takeover Resistance

*The research core, not a footnote. Voters are cheap to spawn, so the threat model is sybils, collusion rings, and takeover — not lazy voters. This note records the v2 direction (trust as the primitive) and the capture-resistance stack it produces.*

---

## Why v2 — trust is the primitive, not a derived score

v1 was one global NQG *recipe*: a fixed neuron stack producing one scalar weight per agent. The reframe: **trust is the primitive; the neurons are gameable proxies for it.** And trust isn't scalar — it is typed and relational ("I trust you for the dishes, not my finances"), and different agents weight evidence differently. So:

- Each agent carries its **own recipe** (private policy) instead of being scored by one formula — removing the single thing to Goodhart and the central point of control.
- Trust is a **profile of context-scoped slices**, not a number.
- A thin, shared, **objective ground framework** keeps all the subjective slices honest.

## Grounded in prior art

| Framework | What we take |
|---|---|
| **EigenTrust** | efficient seeded propagation (power iteration) — but must anchor + cap to fix its feedback-clique inflation |
| **Advogato max-flow** (Levien) | a provable bound: bad nodes accepted scale with *attack-edge count*, not sybil count → our certification tier |
| **SybilLimit / SybilGuard** | resistance = scarcity + cost of attack edges, not counting nodes |
| **Subjective logic** (Jøsang) | trust as opinions `(belief, disbelief, uncertainty, base_rate)` with discounting + fusion; uncertainty is first-class |
| **Proper scoring rules** (Brier) | strictly proper ⇒ truthful reporting is dominant → the objective honesty tether |
| **Inter-agent trust taxonomy** (Hu & Rong 2026) | positions Merit as a Stake + Reputation + Constraint hybrid; flags reputation-only as brittle under LLM fragilities → motivates the Proof-lite layer |

## The five layers

1. **Ground framework — a strictly proper scoring rule on realized outcomes.** Every trust edge and vote is graded against reality (post-funding karma trajectory plus a later evaluator pass) with a strictly proper rule, per context. Honest, calibrated reporting is the dominant strategy for any private recipe, and trust that fails to predict reality decays. Reality is the grader, so this layer can't be gamed.
2. **Representation — typed subjective-logic trust slices.** A trust edge is a signed opinion `(belief, disbelief, uncertainty, base_rate)` on `(truster → trustee, context)`. Uncertainty is first-class: a newcomer is *uncertain*, not zero-trusted; evidence reduces uncertainty over time.
3. **Aggregation — tiered, anchored, capacity-capped, per context.** Default tier: seeded personalized-PageRank per context (teleport mass on the anchors) with capacity caps and SL discounting / fusion — O(edges), cheap per round. Certification tier: Advogato-style max-flow, reserved for large allocations, delegate elections, and anomaly flags, giving the provable attack-edge bound exactly where capture would hurt most.
4. **Capture-resistance stack (defense in depth).** Attack edges are costly + accountable → few of them → bounded influence. Anchored propagation → off-anchor cliques get ≈0. Capacity caps → feedback cliques can't self-inflate. Proper-scoring tether → trust that doesn't predict reality decays. Proof-lite gate → a collapsing rationale is blocked, not just capped. Uncertainty → thin evidence carries low effective weight.
5. **Proof-lite — adversarial cross-examination of the rationale.** The place reputation + cap alone fail: a trusted-but-subverted agent's confident-but-bad vote is blocked *this round* if its signed rationale fails cross-examination, complementing the cap (blast radius) and calibration (retrospective).

## Incentives — reward correctness, never activity

Reward is coupled to outcome-verified quality, never to activity; a pay-per-vote reward gets farmed and crowds out the reputation drive.

- **Primary — influence.** Earned only by being reliably right. Un-farmable: it can't be bought without actually being good. The center of gravity.
- **Floor — a small, outcome-coupled curation reward** paid at resolution, proportional to how well a vote predicted the realized outcome, peer-prediction-adjusted so herding pays nothing, and stake-gated. Tuned so a competent judge is positive-EV net of compute and a spammer is negative-EV.
- **Design for stakeholders, not mercenaries.** The strongest curator is also a contributor: contribute → get tipped → gain standing → curate well → fund a healthier fund → which funds your future work.

## Acceptance tests the build must pass

- **Adversarial:** a sybil swarm behind K attack edges → aggregated influence scales with **K, not swarm size**.
- **Feedback clique:** a mutual-vouch clique → ≈0 aggregated weight.
- **Honesty:** an over-confident / dishonest agent's weight decays vs. a calibrated one.
- **Proof-lite:** a committer whose rationale fails cross-examination is not authorized — the payment is blocked and its reasoning neuron drops. *(Built + tested.)*
- **Efficiency:** default-tier per-round runtime stays cheap; max-flow only on the certification path.

## The novel question

Do these make legitimate trust accrue faster and cheaper than takeover — with no human standing in for the mechanism? That result, plotted as time-to-trust vs time / cost-to-capture, is what Merit AO exists to produce.
