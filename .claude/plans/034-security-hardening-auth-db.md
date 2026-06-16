# Plan 034: Security hardening for the auth + DB surface (Plan 032 follow-up)

> **Executor instructions**: Follow this plan phase by phase. Each phase is
> independently shippable and ends with a verification gate. Do not start the
> next phase until the current one is green. When done, update the status row
> for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 529df9d..HEAD -- src/infrastructure/auth src/infrastructure/db src/application/actions/userData.ts next.config.* .env.example`
> Any change to these files beyond what is quoted below IS a STOP — re-read
> before proceeding.

## Status

- **Priority**: P1 (production-readiness; auth + DB went live in 529df9d)
- **Effort**: M (3 small phases, each its own PR)
- **Risk**: MEDIUM — touches auth env wiring and adds a request gate; mistakes
  here can lock users out, so each phase has an explicit verification gate.
- **Depends on**: 032 (this hardens what 032 shipped).
- **Category**: security / hardening
- **Planned at**: commit `529df9d`, 2026-06-14

## Origin of this plan

Produced by a focused security review of the Plan 032 auth/DB surface
(`infrastructure/auth`, `infrastructure/db`, `application/actions/userData.ts`,
schema, container, NextAuth route). AgentShield gave the _agent-config_ surface
an A/100; this plan covers the _application_ findings AgentShield does not scan.

### What is already correct (DO NOT "fix" — verified safe)

- ✅ **No IDOR.** Every `DrizzleUserDataRepository` query is scoped by `userId`
  (favorites, `listTeams`, `getTeam`, `saveTeam` UPDATE `WHERE userId`,
  `deleteTeam`, comparisons). Client never supplies `userId`.
- ✅ **Auth enforced server-side.** Every action calls `requireUserId()` and
  returns `Unauthenticated` before touching data.
- ✅ **All client input is Zod `safeParse`d** with tight bounds (uuid, positive
  int, slot 0–5, name length).
- ✅ **No SQL injection** — Drizzle parameterizes everything.
- ✅ **No secret leakage** — nothing under `infrastructure/db` or
  `infrastructure/auth` is imported by `presentation/`; no `NEXT_PUBLIC_*`
  secrets; `.env*` is git-ignored and no env file is tracked.
- ✅ **`AUTH_SECRET` is correctly consumed** — verified in
  `node_modules/next-auth/next/index.js`: `process.env.NEXTAUTH_SECRET ??
process.env.AUTH_SECRET`. Leave it as-is.
- ✅ Schema FKs are all `onDelete: 'cascade'` from `user` → clean account
  deletion.

---

## Phase 1 — Fix `AUTH_URL` (it is silently ignored by next-auth v4) — MEDIUM

**Finding.** The app documents and validates `AUTH_URL`, but next-auth v4.24.14
never reads it. Verified in `node_modules`:

- `next-auth/utils/detect-origin.js` returns `process.env.NEXTAUTH_URL` (and
  honors `AUTH_TRUST_HOST` / `VERCEL` for forwarded-host detection).
- `next-auth/core/lib/assert.js` warns `NEXTAUTH_URL` when origin can't be
  derived.

`AUTH_URL` is the Auth.js **v5** name; on v4 it is a no-op. On Vercel origin is
auto-detected so it appears to work, but on any self-host / non-Vercel host the
callback URL and CSRF **origin check** fall back to header-derived values
without `AUTH_TRUST_HOST`, which can break sign-in or weaken origin validation.

**Fix (pick the rename path — clearest for v4):**

1. `infrastructure/db/env.ts`: rename the schema key `AUTH_URL` →
   `NEXTAUTH_URL`. Keep it **optional** (next-auth auto-detects on Vercel):
   `NEXTAUTH_URL: z.string().url().optional()`.
2. `.env.example`: rename `AUTH_URL` → `NEXTAUTH_URL`; add a commented
   `# AUTH_TRUST_HOST=true  # set when self-hosting behind a proxy`.
3. `CLAUDE.md` "Required environment variables" block: rename `AUTH_URL` →
   `NEXTAUTH_URL` and note the `AUTH_TRUST_HOST` self-host option.
4. Do **not** rename `AUTH_SECRET` — it is read correctly.

**Verification gate.**

- `pnpm typecheck && pnpm test` green.
- Manual: with `NEXTAUTH_URL` unset locally, sign-in still works (auto-detect);
  grep confirms no remaining `AUTH_URL` reference:
  `grep -rn "AUTH_URL" src .env.example CLAUDE.md` returns nothing.

---

## Phase 2 — Add a production CSP + security headers — MEDIUM

**Finding.** `next.config.*` has no `headers()` and there is no middleware. The
project's own `web/security.md` mandates a production CSP plus HSTS,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and
`Permissions-Policy`. None are currently sent.

**Fix.** Add an async `headers()` to `next.config.ts` returning these for all
routes:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- A CSP scoped to this app's real origins (self, PokeAPI sprite/image hosts
  `raw.githubusercontent.com`, GitHub avatars `avatars.githubusercontent.com`
  for OAuth profile images). The browser does not call Neon directly, so keep
  `connect-src 'self'`. Add `frame-ancestors 'none'`, `object-src 'none'`,
  `base-uri 'self'`.

> Note: Next.js inline hydration scripts need either a per-request nonce
> (middleware) or `'unsafe-inline'` in `script-src`. Start with the
> header-based CSP and `script-src 'self' 'unsafe-inline'` documented as a known
> tradeoff; a follow-up can move to nonce-based CSP via middleware if desired.
> Verify image hosts against the existing `next.config` `images` allowlist so
> the CSP `img-src` matches.

**Verification gate.**

- `pnpm build` green.
- `curl -sI http://localhost:3000/` (after `pnpm start`) shows all headers.
- Manually load a Pokémon detail page + sign in with GitHub: no CSP console
  violations blocking sprites or avatars.

---

## Phase 3 — Rate-limit + consistent error envelope on server actions — MEDIUM/LOW

**Finding A (MEDIUM).** The mutating actions in `application/actions/userData.ts`
(`toggleFavoriteAction`, `saveTeamAction`, `deleteTeamAction`,
`saveComparisonAction`, `deleteComparisonAction`) have no rate limiting. An
authenticated user can hammer writes; `saveTeam` runs a multi-statement
transaction. Both `common/security.md` and `react/security.md` require rate
limiting sensitive/mutating actions.

**Fix A.** Add a small per-user limiter keyed by `userId`:

- Preferred for serverless/Vercel: `@upstash/ratelimit` + Upstash Redis (sliding
  window, e.g. 30 writes / 10s per user). Add `UPSTASH_REDIS_REST_URL/TOKEN` to
  `env.ts` as **optional** so local/dev without Redis still works.
- Fallback when Upstash is not configured: an in-process token-bucket keyed by
  `userId` (acceptable single-instance mitigation; document the limitation).
- Apply inside each mutating action right after `requireUserId()`; on limit
  return `err('Too many requests')`. Read-only list/get actions can stay
  unlimited or use a looser bucket.

**Finding B (LOW).** Error-handling is inconsistent: validation failures return
the `ActionResult` envelope (`err(...)`), but repository throws
(`'Team not found or unauthorized'`, DB errors) propagate as raw exceptions,
bypassing the envelope. Not a leak in prod (Next.js masks server errors to a
digest), but it breaks the contract clients rely on.

**Fix B.** Wrap each repository call in `try/catch`; log server-side, return
`err('Something went wrong')` (generic) to the client. Map the known
"not found or unauthorized" throw to `err('Not found')`.

**Finding C (LOW, optional).** `toggleFavoriteAction` does a full `getFavorites`
read then a write to compute `on`. Two concurrent toggles can race (idempotency
saves correctness via PK + `onConflictDoNothing`, so not a security issue) and
it fetches the whole list per toggle. Optional: have the client pass the desired
`on` boolean (still Zod-validated) and drop the extra read.

**Verification gate.**

- New unit tests: limiter returns `Too many requests` past threshold;
  actions return `err()` (not throw) on repo failure (mock the repo to throw).
- `pnpm test` ≥ 80% on `application/` retained.
- Manual: rapid repeated `saveTeamAction` calls eventually return the limit
  error.

---

## Suggested PR order

1. **Phase 1** (env rename) — smallest, highest correctness value, no deps.
2. **Phase 2** (headers/CSP) — independent, no auth interaction.
3. **Phase 3** (rate limit + error envelope) — adds one optional dependency.

Each phase is its own PR. None depend on the others; do them in any order if
convenient, but Phase 1 is the cheapest win.

## Severity summary

| #   | Finding                                                                   | Severity |
| --- | ------------------------------------------------------------------------- | -------- |
| 1   | `AUTH_URL` ignored by next-auth v4 (use `NEXTAUTH_URL`/`AUTH_TRUST_HOST`) | MEDIUM   |
| 2   | No CSP / security headers                                                 | MEDIUM   |
| 3A  | No rate limiting on mutating server actions                               | MEDIUM   |
| 3B  | Inconsistent error envelope (repo throws bypass `ActionResult`)           | LOW      |
| 3C  | `toggleFavoriteAction` read-then-write (perf/race nit)                    | LOW      |

No CRITICAL or HIGH findings. Core authz model (per-`userId` scoping, server-side
auth gate, Zod validation, parameterized queries, secret hygiene) is sound.
