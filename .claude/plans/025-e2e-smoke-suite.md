# Plan 025: Add a Playwright E2E smoke suite for the critical user flows

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 56438cc..HEAD -- package.json .github/workflows/ci.yml playwright.config.ts e2e`
> If `playwright.config.ts` or an `e2e/` directory already exists, STOP —
> someone built this already. Changes to package.json scripts or CI also
> require comparing against the "Current state" excerpts before proceeding.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests / dx
- **Planned at**: commit `56438cc`, 2026-06-12

## Why this matters

`@playwright/test` has sat unused in devDependencies since at least the
2026-06-11 audit, and `plans/README.md` records an open maintainer decision:
build a minimal suite or drop the dependency. The maintainer chose to build it
(2026-06-12 advisory session). The app now has several client-heavy,
store-driven flows — team share URLs, the daily game, favorites→team bulk add —
that unit tests structurally cannot cover (Vitest runs in node/jsdom against
stores and pure functions only). This suite is the verification baseline that
future feature plans (026–030) build on.

## Current state

- `package.json` — `@playwright/test: ^1.60.0` in devDependencies; scripts are:

  ```json
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "ci": "pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build"
  ```

  There is **no** `e2e` script, no `playwright.config.ts`, no `e2e/` directory.

- `.github/workflows/ci.yml` — five jobs: `format`, `lint` (also runs
  `pnpm i18n:check`), `typecheck`, `test` (coverage + artifact upload),
  `build` (uploads `nextjs-build` artifact). Every job repeats the same setup
  block: `actions/checkout@v4`, `pnpm/action-setup@v4`,
  `actions/setup-node@v4` with `node-version: 22` and `cache: pnpm`, then
  `pnpm install --frozen-lockfile`. Match that block exactly in the new job.

- The app is a Next.js 16 App Router site backed by the live PokeAPI
  (`https://pokeapi.co`), with an in-memory server-side cache
  (`src/infrastructure/pokeapi/cache.ts`). All routes are locale-prefixed
  (`/en`, `/es`, …); the root `/` redirects to the browser locale via
  next-intl middleware. **Always navigate to `/en/...` paths in tests** to
  avoid locale-redirect ambiguity.

- Key user-visible facts the tests will assert (verified at planning time):
  - `/en` — Pokédex grid with infinite scroll and a search input.
  - `/en/pokemon/25` — detail page; heading shows "Pikachu" (rendered by
    `PokemonDetailHeader`), a "Base Stats" section exists.
  - `/en/team?team=1,4,7` — team builder pre-populated with 3 members
    parsed server-side from the URL (see `src/app/[locale]/team/page.tsx`,
    `parseTeamParam`).
  - `/en/game` — heading "Who's that Pokémon?" plus 4 answer-choice buttons
    (rendered by `WhosThatPokemon`).
  - Favorites: heart buttons on Pokémon cards persist to localStorage
    (`favoritesStore`); `/en/favorites` lists hearted Pokémon.

- Repo conventions: TypeScript everywhere, `@/` path alias → `src/` (do NOT
  use the alias inside `e2e/` — that alias is configured for the Next/Vitest
  toolchains, not Playwright; use relative imports or none). Prettier and
  ESLint run over the whole repo (`pnpm lint` = `eslint .`), so new files must
  pass both.

## Commands you will need

| Purpose          | Command                                 | Expected on success          |
| ---------------- | --------------------------------------- | ---------------------------- |
| Install          | `pnpm install`                          | exit 0                       |
| Install browsers | `pnpm exec playwright install chromium` | exit 0                       |
| Typecheck        | `pnpm typecheck`                        | exit 0                       |
| Unit tests       | `pnpm test`                             | all pass (unchanged by plan) |
| Lint             | `pnpm lint`                             | exit 0                       |
| Format           | `pnpm format`                           | rewrites new files           |
| E2E (new)        | `pnpm e2e`                              | all tests pass               |

## Scope

**In scope** (the only files you should create or modify):

- `playwright.config.ts` (create)
- `e2e/smoke.spec.ts` (create — one file is enough for 5 journeys)
- `package.json` (add `e2e` script only)
- `.github/workflows/ci.yml` (add one `e2e` job)
- `.gitignore` (add Playwright output dirs)
- `eslint.config.mjs` — ONLY if `pnpm lint` fails on the `e2e/` directory
  (e.g. a project-service error for files outside `tsconfig`); the minimal
  fix is adding `e2e/**` to the existing ignores list.

**Out of scope** (do NOT touch):

- Any file under `src/` — this plan adds tests, it does not change the app.
- `vitest.config.ts` — Vitest must not pick up `e2e/` (its config has no
  `include` for it; verify, don't edit).
- The `ci` package.json script — keep E2E out of the local `pnpm ci`
  pipeline; it is a separate, slower gate.

## Git workflow

- Branch: `advisor/025-e2e-smoke-suite`
- Conventional commits, e.g. `test: add Playwright E2E smoke suite` and
  `ci: run E2E smoke suite in GitHub Actions`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/en',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

Rationale to preserve: the dev server compiles pages on demand and proxies the
live PokeAPI, so first navigations are slow — hence the generous timeouts and
CI retries. Do not "optimize" these down.

Add `e2e` script to package.json (in scripts, after `"test:coverage"`):
`"e2e": "playwright test"`.

Add to `.gitignore`:

```
/test-results/
/playwright-report/
```

**Verify**: after Step 2, `pnpm exec playwright test --list` → lists 5 tests,
exit 0.

### Step 2: Write `e2e/smoke.spec.ts` with five journeys

Use resilient, user-facing locators (`getByRole`, `getByText`) — never CSS
class selectors (Tailwind classes churn). The five tests:

```ts
import { test, expect } from '@playwright/test';

test('pokedex home loads and search filters the grid', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('link', { name: /bulbasaur/i })).toBeVisible();
  const search = page.getByRole('textbox').first();
  await search.fill('charizard');
  await expect(page.getByRole('link', { name: /charizard/i })).toBeVisible();
});

test('pokemon detail page renders stats and matchups', async ({ page }) => {
  await page.goto('/en/pokemon/25');
  await expect(page.getByRole('heading', { name: /pikachu/i })).toBeVisible();
  await expect(page.getByText(/base stats/i)).toBeVisible();
});

test('shared team URL pre-populates the team builder', async ({ page }) => {
  await page.goto('/en/team?team=1,4,7');
  await expect(page.getByText(/bulbasaur/i).first()).toBeVisible();
  await expect(page.getByText(/charmander/i).first()).toBeVisible();
  await expect(page.getByText(/squirtle/i).first()).toBeVisible();
});

test('daily game loads with four choices', async ({ page }) => {
  await page.goto('/en/game');
  await expect(page.getByRole('heading', { name: /who's that pok/i })).toBeVisible();
  // assert exactly 4 answer-choice buttons (see note below)
});

test('hearting a pokemon adds it to the favorites page', async ({ page }) => {
  await page.goto('/en/pokemon/25');
  // click the favorite toggle, then:
  await page.goto('/en/favorites');
  await expect(page.getByText(/pikachu/i).first()).toBeVisible();
});
```

The last two tests are sketched, not final: **open the rendered pages and
adapt the locators to the real accessible names** (inspect via
`pnpm exec playwright test --debug` or a `--trace on` run). The assertion
_targets_ are fixed (4 game choice buttons; Pikachu appears on
`/en/favorites` after toggling); the locator strings are yours to pin down.
If the favorite toggle has no accessible name, scope with
`getByRole('button')` — do NOT add `data-testid` attributes to `src/`
(out of scope).

**Verify**: `pnpm e2e` → 5 passed. Run it twice to check for flakiness; if a
test fails intermittently, strengthen its waits (assert visibility before
interacting) rather than adding `waitForTimeout`.

### Step 3: Add the CI job

Append to `.github/workflows/ci.yml` jobs (match sibling jobs' setup exactly):

```yaml
e2e:
  name: E2E smoke
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - uses: pnpm/action-setup@v4

    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: pnpm

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Playwright browsers
      run: pnpm exec playwright install --with-deps chromium

    - name: Run E2E smoke suite
      run: pnpm e2e

    - name: Upload Playwright report
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 7
```

**Verify**: `git diff .github/workflows/ci.yml` — indentation matches sibling
jobs (job keys indented 2 spaces under `jobs:`).

### Step 4: Full local gate

**Verify**, in order:

1. `pnpm format` then `pnpm format:check` → exit 0
2. `pnpm lint` → exit 0 (see Scope note if `e2e/` trips the ESLint project service)
3. `pnpm typecheck` → exit 0
4. `pnpm test` → all unit tests pass, count unchanged
5. `pnpm e2e` → 5 passed

## Test plan

This plan IS the test plan: 5 new E2E journeys (pokedex search, detail page,
team share URL, game load, favorites round-trip). No unit tests are added or
changed. Verification: `pnpm e2e` → `5 passed`.

## Done criteria

- [ ] `playwright.config.ts` and `e2e/smoke.spec.ts` exist
- [ ] `pnpm e2e` exits 0 with 5 passing tests (run twice)
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` all exit 0
- [ ] `.github/workflows/ci.yml` contains an `e2e` job mirroring the sibling jobs' setup
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row for 025 updated

## STOP conditions

Stop and report back (do not improvise) if:

- A `playwright.config.ts` or `e2e/` directory already exists (drift).
- `pnpm dev` cannot reach the live PokeAPI from your environment (tests will
  time out on every page) — report "no network to pokeapi.co"; do not mock.
- After adapting locators, any single test still fails 3 consecutive runs.
- Making `pnpm lint` pass appears to require more than adding `e2e/**` to the
  ESLint ignore list.

## Maintenance notes

- The suite runs against the **live PokeAPI** through `next dev`. If CI
  flakiness becomes chronic, the next step is route-level mocking via
  `page.route()` fixtures — deliberately deferred to keep this plan small.
- Plans 026–030 add features with UI surface; each should extend this spec
  file with at most one journey, keeping the smoke suite under ~2 minutes.
- Reviewer should scrutinize: no `waitForTimeout` calls, no CSS-class
  selectors, no `data-testid` added to `src/`.
