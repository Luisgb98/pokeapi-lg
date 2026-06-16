# Plan 021: Add an i18n key-parity check to CI

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 84b8672..HEAD -- messages package.json .github/workflows/ci.yml`
> If the locale files changed, first re-run the parity comparison (Step 1
> verification) — if locales have drifted out of parity since this plan was
> written, fixing the missing keys becomes part of this plan (add the missing
> keys with translations, or English fallback values marked `// TODO`).

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `84b8672`, 2026-06-12

## Why this matters

The app ships 6 locales (`messages/en.json`, `es`, `fr`, `de`, `it`, `pt`) and
nothing verifies they stay in sync. A key added only to `en.json` renders as
the raw key name (e.g. `game.streakLabel`) for the other five locales, and
nobody notices until a user reports it. As of commit `84b8672` all six files
are in **full key parity** (verified by recursive key comparison), so the
check can land green today — and immediately protects upcoming plans (022/023/
024 all add translation keys to all six files).

## Current state

- `messages/` contains exactly: `de.json en.json es.json fr.json it.json pt.json`.
- Values are nested JSON objects of strings; top-level namespaces as of
  `84b8672`: `metadata, home, filter, grid, detail, notFound, error, types,
nav, teamBuilder, typeChart, favorites, compare, species, forms, moves,
game, typeCalculator`.
- `package.json` scripts (relevant excerpt):

  ```json
  "test": "vitest run",
  "ci": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build"
  ```

- `.github/workflows/ci.yml` has separate jobs `format`, `lint`, `typecheck`,
  `test`, `build`. The `lint` job's last step is:

  ```yaml
  - name: Lint
    run: pnpm lint
  ```

- There is no `scripts/` directory yet at repo root.
- Repo is ESM-friendly; a plain Node script (`.mjs`) needs no dependencies.

## Commands you will need

| Purpose   | Command                          | Expected on success             |
| --------- | -------------------------------- | ------------------------------- |
| Run check | `pnpm i18n:check` (after step 2) | exit 0, "all locales in parity" |
| Format    | `pnpm format:check`              | exit 0                          |

## Scope

**In scope** (create/modify only these):

- `scripts/check-i18n.mjs` (create)
- `package.json` (add `i18n:check` script; extend `ci` script)
- `.github/workflows/ci.yml` (add one step to the `lint` job)

**Out of scope** (do NOT touch):

- `messages/*.json` — they are in parity; no edits needed (unless the drift
  check at the top says otherwise).
- Any `src/` file. No runtime i18n behavior changes.
- Do NOT add npm dependencies (no glob libs — `fs.readdirSync` suffices).

## Git workflow

- Branch: `advisor/021-i18n-key-parity-check`
- Commit: `ci: add i18n key parity check across locales`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write the checker script

Create `scripts/check-i18n.mjs`:

```js
#!/usr/bin/env node
/**
 * Verifies every messages/<locale>.json has exactly the same key set as
 * messages/en.json (both directions). Exits 1 with a per-locale report on
 * any mismatch.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MESSAGES_DIR = new URL('../messages', import.meta.url).pathname;
const REFERENCE = 'en.json';

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') keys.push(...flattenKeys(value, path));
    else keys.push(path);
  }
  return keys;
}

const load = (file) =>
  new Set(flattenKeys(JSON.parse(readFileSync(join(MESSAGES_DIR, file), 'utf8'))));

const referenceKeys = load(REFERENCE);
const locales = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json') && f !== REFERENCE);

let failed = false;
for (const locale of locales) {
  const keys = load(locale);
  const missing = [...referenceKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !referenceKeys.has(k));
  if (missing.length > 0 || extra.length > 0) {
    failed = true;
    console.error(`✖ ${locale}`);
    for (const k of missing) console.error(`  missing: ${k}`);
    for (const k of extra) console.error(`  extra:   ${k}`);
  } else {
    console.log(`✓ ${locale} (${keys.size} keys)`);
  }
}

if (failed) {
  console.error('\ni18n key parity check FAILED — sync messages/*.json with en.json');
  process.exit(1);
}
console.log(`All ${locales.length} locales in parity with ${REFERENCE}.`);
```

**Verify**: `node scripts/check-i18n.mjs` → exit 0, prints `✓` for de, es,
fr, it, pt and the final parity line.

### Step 2: Wire into package.json

- Add to `scripts`: `"i18n:check": "node scripts/check-i18n.mjs"`.
- Extend the `ci` script to include it after `lint`:
  `"ci": "pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build"`.

**Verify**: `pnpm i18n:check` → exit 0.

### Step 3: Wire into the GitHub Actions lint job

In `.github/workflows/ci.yml`, add after the `Lint` step of the `lint` job:

```yaml
- name: i18n key parity
  run: pnpm i18n:check
```

(Indentation must match the sibling steps — 6 spaces before `- name:`.)

**Verify**: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` → no error.

### Step 4: Prove the check fails on drift (canary)

Temporarily add a fake key to `messages/de.json` (e.g. `"__canary": "x"` at
the top level), run `pnpm i18n:check` → must exit 1 reporting `extra: __canary`.
Then revert: `git checkout -- messages/de.json`.

**Verify**: `git status` shows no change to `messages/`; `pnpm i18n:check` →
exit 0 again.

## Test plan

The canary in Step 4 is the behavioral test. No Vitest test needed — the
script is CI infrastructure, and a unit test would duplicate the canary.
(If the operator prefers a Vitest test, mirror the canary as a test that runs
`flattenKeys` on fixtures — but this is explicitly optional.)

## Done criteria

ALL must hold:

- [ ] `pnpm i18n:check` exits 0 and reports 5 locales in parity
- [ ] Step 4 canary produced exit 1 before revert
- [ ] `grep -c "i18n:check" package.json` → 2 (script def + ci chain)
- [ ] `grep -n "i18n key parity" .github/workflows/ci.yml` → 1 match
- [ ] `git status` clean except the three in-scope files (+ plans/README.md)
- [ ] `pnpm format:check` exits 0

## STOP conditions

- The parity check fails on the **current** locale files (drift since
  `84b8672`) and the missing keys need real translations you cannot produce
  confidently — report the key list instead of inventing translations.
- `ci.yml` job structure differs from the excerpt (workflow rewritten).

## Maintenance notes

- Plans 022/023/024 add keys to all six locale files — this check is what
  catches a forgotten locale, which is why it should land before them.
- If a 7th locale is added, no script change is needed (it auto-discovers
  `messages/*.json`).
- Deliberately NOT checking ICU placeholder consistency (e.g. `{name}`
  present in all translations) — worthwhile follow-up if translation bugs
  appear, but out of scope here.
