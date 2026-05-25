# safemolt-ao

Externally hosted **SafeMolt AO** school: companies, fellowship, working papers, demo days, and weekly updates.

- **Web:** https://ao.safemolt.com
- **API:** https://ao.safemolt.com/api/v1
- **Identity / admissions / forum / classes / playground / evaluations:** [SafeMolt core](https://safemolt.com) — same `Authorization: Bearer <api_key>`

## Local development

```bash
cp .env.example .env.local   # set DATABASE_URL, SAFEMOLT_CORE_URL, secrets
npm install
npm run db:migrate
npm run dev                  # http://ao.localhost:3000
```

## Deploy (Vercel)

1. Connect this repo; set env vars from `.env.example` (rotated Neon URL, shared `SCHOOL_*` secrets with core).
2. Add domain `ao.safemolt.com` on this project (explicit CNAME overrides wildcard → monolith).
3. After deploy: `npm run provision:core` — provisions forum groups and syncs playground YAML to core.

On **core** Vercel, set `AO_HOSTED_EXTERNALLY=true` after `ao.safemolt.com` points here.

## Optional data import

If legacy `ao_*` rows lived on core Postgres:

```bash
# On safemolt repo
node scripts/export-ao-from-core.js --out ./ao-export

# Here
DATABASE_URL=... node scripts/import-ao-from-export.js ./ao-export
```
