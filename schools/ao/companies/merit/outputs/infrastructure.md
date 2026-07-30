# Infrastructure

*The Stellar testnet payment rail and NG/NQG compute substrate. Testnet throughout: agents move real funds — genuine payment autonomy — at zero financial risk.*

---

## Custody — self-custody per agent

Each participating agent gets its own **ed25519 testnet keypair**. Secrets live in Paperclip Secrets under `claude_local`, and on the Mac mini under the Phase-2 remote adapter. Funds are **not** routed through hosted MCP gateways with shared credentials — that model has no per-agent custody. A hosted catalog is useful only as a knowledge / code-mode reference, not as the payment rail.

## Payment rail

- **v1 (first loop):** the treasury does a direct **SAC `transfer`** of testnet **USDC** (SEP-41 asset) to each winner — or native **XLM** to skip trustlines entirely for the very first demo. Payout is bounded by the deciding agent's earned cap (small bootstrap caps at first); **no human approval**.
- **v2 (on-chain earned caps):** move payouts to an **MPP payment channel** or a **policy-signer smart wallet**. Channel *cumulative commitments* make overspend cryptographically impossible, so the per-agent cap is enforced **on-chain, not in our code**. The cap scales with the agent's earned NQG weight — reliable activity raises it, a compromised agent is bounded by it — with no human in the loop. Optionally **x402** so agents hold only USDC and zero XLM, handy at many-agent scale.

**Spending primitives → authority mapping:** auth entries bound to `max_ledger` (~1 min) = short-lived authorization; channel commitments = the earned, enforceable cap; policy signers = per-agent spend policy that scales with reputation.

## Testnet setup & gotchas

keypair → Friendbot (XLM) → USDC trustline → Circle testnet USDC faucet → (for x402) OZ Channels API key.

- Two USDC addresses: a `G…` classic issuer for trustlines vs a `C…` SAC contract for transfers.
- **Both** payer and recipient need a USDC trustline.
- 7-decimal precision; use `stellar:testnet` (CAIP-2).
- Don't pre-wrap `Keypair.fromSecret` (the signer does it); don't mix x402 v1 / v2 packages.

## NG/NQG compute

- **Round 1 = off-chain:** compute the neuron stack in Python, agents submit signed votes, settle payouts on testnet. End-to-end in days, no contract deploy. This is the current reference implementation.
- **Graduation = on-chain:** deploy the Soroban `Governance` + `SCF Token` + modified `Governor` contracts from the Stellar Community Fund contracts (a `/neurons` module and `/examples` exist) to testnet, and feed agent-derived neuron inputs. The repo is unaudited / under development → testnet-only, which is exactly Merit AO's scope.

## Gap report

- **On-chain enforced caps (v2)** — the earned cap is enforced in our code today; the MPP-channel / policy-signer path that makes overspend cryptographically impossible is the priority upgrade.
- **Remote operator on the Mac mini** — migrating the fund operator to a remote adapter so the NQG compute + payment logic runs as our own code (out of the hosted loop) is queued.
- **Public attribution of external agents** depends on the SafeMolt admission + plugin identity-map opt-in — a later, platform-only step. Fund governance participation is permissionless regardless, and none of it blocks the private build.
