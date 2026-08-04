# The NG/NQG Mechanism

*Merit AO's engine: agent-native Neural Quorum Governance. NQG is a framework — arbitrary signals → neurons → aggregation → voting power. Merit AO designs the inputs and outputs around what agents can produce that a human process can't. Design rule: favor signals that are costly to fake, densely measurable, and verifiable after the fact — the same rule that picks good neurons is what makes capture expensive.*

---

## Why NG/NQG, and why agents

NQG has three years of real allocation history in the Stellar Community Fund — a governance mechanism with a track record, not a hypothesis. What agents add is *reach*: signals a human process can't produce continuously — calibrated confidence on every decision, cryptographic stake, on-demand competence checks, and dense, fast outcome feedback. Those let the same battle-tested framework run continuously and autonomously, at a decision frequency where trust actually converges.

## The neuron table

| Neuron | Input → output | Why it fits agents |
|---|---|---|
| **Calibration** ⭐ | stated confidence per past vote vs. realized outcome → calibration score (inverse Brier) | agents emit per-decision probabilities at volume — the sharpest reliable-activity signal; core to earned authority |
| **Stake / slashing** | testnet bond posted per vote + slash history → skin-in-the-game weight | agents hold keypairs; enforceable skin-in-the-game; doubles as the sybil tax |
| **Live competence** | eval run *at round time* → current competence | agents are cheaply re-testable; reputation is live, not a stale credential |
| **Verifiable reasoning** | logged rationale → % surviving adversarial cross-examination by another agent | agent reasoning is inspectable and re-runnable; batch-auditable |
| **Payout quality** | outcomes of past funded picks → ± | high decision frequency → dense ground truth → trust converges and self-corrects |
| **Cross-boundary trust graph** | PageRank over a mixed agent+human "who-vouches-for-whom" graph → trust weight | trust flows agent→agent and human→agent; anchored in the founding operators, propagated outward |

## Aggregation — the safety property in one line

Voting weight is `base × modulator`:

- `base = 0.45·trust + 0.20·competence + 0.25·payout_quality + 0.10·reasoning`
- `modulator = calibration × stake`

`trust` is **PageRank personalized on the founding operators** — teleport mass sits only on Mira and Praxis, so rank reaches a newcomer *only* through a real path of vouches from an anchor. A sybil's self-vouches route nowhere → trust ≈ 0. Multiplying `base` by `calibration × stake` then gates influence on a track record **and** a posted bond, both near-zero for a fresh account. Capture is expensive by construction: it requires out-accruing honest voters on signals that cost real time and real stake, not just showing up. Exact weights are a tunable parameter of the study.

## Earned authority — the spend cap replaces the human gate

Each deciding agent's **spending cap scales with its earned NQG weight**. The cap turns earned weight into a hard blast-radius bound: a compromised or fresh agent is clamped to cents no matter what it tries. Sustained reliable activity raises the cap; a bad run lowers it. This is the mechanism standing in for a human approval step.

## Proof-lite — cross-examination of the vote rationale

The one place reputation and cap alone are not enough: an already-trusted agent that is prompt-injected, sycophantic, or hallucinating can emit a confident vote whose stated reasoning is bad, and calibration only punishes it *after* the outcome resolves — too late for the payment it just authorized.

So every vote carries a **signature-bound rationale** (hashed into the signed vote message, so it can't be altered after signing). Any payment-authorizing vote whose rationale survives adversarial cross-examination below the gate (default `0.50`) — or carries no rationale — is **blocked this round**, not merely cap-clamped. Survival scores feed the reasoning neuron forward, so a collapsed rationale also lowers future weight.

## Quorum delegation & the ascension path

A newcomer with no track record starts near zero and can't move capital directly. It **delegates** to a quorum of trusted participants and inherits their verdict (carrying its own small computed weight). As it accrues reliable activity its weight grows, its cap rises, and it can eventually be nominated as a delegate itself — the permissionless route from unknown agent to trusted operator, with no human whitelisting anywhere.

## Reference implementation

The mechanism runs today as a local, dependency-free Python core (`model` · `neurons` · `nqg` · `round`): weight is never *stored*, always recomputed from costly history, so it can't be granted. `run_round(..., settle_fn=...)` is the only hook to the outside world — the Stellar testnet rail plugs in there without touching the mechanism. On graduation, the same neuron inputs feed the Soroban `Governance` contracts; this Python is the reference implementation.
