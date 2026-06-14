# Plan 019: Enforce hexagonal layer boundaries with ESLint

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 84b8672..HEAD -- eslint.config.mjs src/application src/domain`
> If `eslint.config.mjs` changed since this plan was written, compare the
> "Current state" excerpt against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `84b8672`, 2026-06-12

## Why this matters

CLAUDE.md declares strict hexagonal layer rules (domain imports nothing
internal; application imports only domain; presentation never imports
infrastructure; etc.), but nothing enforces them — `eslint.config.mjs` contains
only Next.js defaults plus Prettier. Any contributor, human or agent, can
violate the architecture and CI stays green. This repo is largely maintained by
agents executing plans, which makes machine enforcement especially valuable:
the rules become a failing lint instead of prose someone must remember to read.
As of commit `84b8672` the codebase is verified clean (no violations exist), so
the rules can land without any code changes.

## Current state

- `eslint.config.mjs` (entire file, 16 lines):

  ```js
  import { defineConfig, globalIgnores } from 'eslint/config';
  import nextVitals from 'eslint-config-next/core-web-vitals';
  import nextTs from 'eslint-config-next/typescript';
  import prettierConfig from 'eslint-config-prettier';

  const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Pin React version so eslint-plugin-react doesn't call the removed context.getFilename() API.
    { settings: { react: { version: '19.0.0' } } },
    // Disables ESLint rules that conflict with Prettier formatting.
    prettierConfig,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**']),
  ]);

  export default eslintConfig;
  ```

- Layer rules from CLAUDE.md (the source of truth to encode):

  | Layer             | May import                      | NEVER import                              |
  | ----------------- | ------------------------------- | ----------------------------------------- |
  | `domain/`         | Nothing internal                | Everything below                          |
  | `application/`    | `domain/` only                  | `infrastructure/`, `presentation/`, React |
  | `infrastructure/` | `domain/`, `application/`       | `presentation/`                           |
  | `presentation/`   | `domain/`, `application/`       | `infrastructure/` directly                |
  | `app/`            | `presentation/`, `application/` | `infrastructure/` directly                |

- **Sanctioned exception**: `src/application/container.ts` is the composition
  root — it imports `PokeApiRepository` via a **relative** path
  (`'../infrastructure/pokeapi/PokeApiRepository'`) and is explicitly
  documented as the only place allowed to do so. It must be exempted.

- **Known deviation to tolerate**: `app/` pages import pure types/constants
  from `domain/` (e.g. `src/app/[locale]/pokemon/[id]/page.tsx` imports
  `POKEMON_TYPES` from `@/domain/entities/Pokemon`). CLAUDE.md's table doesn't
  list domain under app's "may import", but this is established practice for
  pure domain types. Do NOT forbid `app → domain`. Only forbid
  `app → infrastructure`.

- Imports use the `@/` alias (`@/` → `src/`) almost everywhere; the one
  relative cross-layer import is the container exception above. Rules must
  therefore restrict **both** `@/...` patterns and relative `**/infrastructure/**`
  style patterns.

- Verified clean at `84b8672`:
  - `grep -rn "from '@/infrastructure" src --include="*.ts*" | grep -v "^src/infrastructure\|__tests__"` → no matches
  - `grep -rln "from 'react'" src/application/ src/domain/` → no matches

- Tests in `src/__tests__/` intentionally import infrastructure (e.g.
  `PokeApiRepository.test.ts`); they must be exempt (the `files` globs below
  simply don't include `src/__tests__/`).

## Commands you will need

| Purpose | Command          | Expected on success |
| ------- | ---------------- | ------------------- |
| Lint    | `pnpm lint`      | exit 0              |
| Tests   | `pnpm test`      | all pass            |
| Types   | `pnpm typecheck` | exit 0              |

## Scope

**In scope** (the only files you should modify):

- `eslint.config.mjs`

**Out of scope** (do NOT touch):

- Any file under `src/` — the codebase is already compliant; if a rule fires
  on existing code, the rule is wrong (or the container exemption is missing),
  not the code. Fix the config, never the source.
- `package.json` — no new ESLint plugins. Use the core `no-restricted-imports`
  rule only.

## Git workflow

- Branch: `advisor/019-eslint-layer-boundaries`
- Commit message style: `chore: enforce hexagonal layer boundaries in eslint`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add per-layer no-restricted-imports blocks

In `eslint.config.mjs`, insert the following config objects into the
`defineConfig([...])` array **after** `prettierConfig` and **before**
`globalIgnores(...)`:

```js
// ---- Hexagonal layer boundaries (see CLAUDE.md) ----
// domain/ imports nothing internal and no UI/framework libraries.
{
  files: ['src/domain/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/application/*', '@/infrastructure/*', '@/presentation/*', '@/app/*'],
            message: 'domain/ must not import other layers (CLAUDE.md layer rules).' },
          { group: ['react', 'react-dom', 'next', 'next/*', 'next-intl', 'next-intl/*', 'zustand', 'zustand/*', '@tanstack/*'],
            message: 'domain/ must stay framework-free (CLAUDE.md layer rules).' },
        ],
      },
    ],
  },
},
// application/ imports only domain/ and must contain zero React.
{
  files: ['src/application/**/*.{ts,tsx}'],
  ignores: ['src/application/container.ts'], // composition root — sanctioned infrastructure import
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/infrastructure/*', '@/presentation/*', '@/app/*', '**/infrastructure/**', '**/presentation/**'],
            message: 'application/ may import only domain/ (CLAUDE.md layer rules).' },
          { group: ['react', 'react-dom', 'next-intl', 'next-intl/*', 'zustand', 'zustand/*', '@tanstack/*'],
            message: 'application/ must contain zero React imports (CLAUDE.md layer rules).' },
        ],
      },
    ],
  },
},
// infrastructure/ must not import presentation/ or app/.
{
  files: ['src/infrastructure/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/presentation/*', '@/app/*', '**/presentation/**'],
            message: 'infrastructure/ must not import presentation/ or app/ (CLAUDE.md layer rules).' },
        ],
      },
    ],
  },
},
// presentation/ and app/ never import infrastructure/ directly.
{
  files: ['src/presentation/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/infrastructure/*', '**/infrastructure/**'],
            message: 'Use the application layer (e.g. getRepository from @/application/container) instead of importing infrastructure/ directly (CLAUDE.md layer rules).' },
        ],
      },
    ],
  },
},
```

Notes for the executor:

- `next` and `next/*` are NOT restricted in `application/` — server actions
  there may legitimately use Next server utilities; the React/zustand bans are
  what CLAUDE.md mandates ("zero React imports"). If lint reveals existing
  `next/*` imports in application/, leave them be.
- Keep the existing config entries untouched.

**Verify**: `pnpm lint` → exit 0 (the current tree is compliant; any error
means a pattern is too broad — check it against the "Known deviation" notes
above before changing anything else).

### Step 2: Prove the rules actually fire (canary)

Create a temporary file `src/presentation/lib/__layer-canary.ts`:

```ts
import { PokeApiRepository } from '@/infrastructure/pokeapi/PokeApiRepository';
export const x = PokeApiRepository;
```

**Verify**: `pnpm eslint src/presentation/lib/__layer-canary.ts` → exits
non-zero with a `no-restricted-imports` error mentioning the CLAUDE.md message.

Then delete the canary:

```bash
rm src/presentation/lib/__layer-canary.ts
```

**Verify**: `git status` shows only `eslint.config.mjs` modified.

### Step 3: Full gate

**Verify**: `pnpm lint && pnpm typecheck && pnpm test` → all exit 0.

## Test plan

No unit tests — the canary in Step 2 is the behavioral test for the rule.
CI inherits enforcement automatically: the `lint` job in
`.github/workflows/ci.yml` already runs `pnpm lint`.

## Done criteria

ALL must hold:

- [ ] `pnpm lint` exits 0 on the unmodified source tree
- [ ] The canary check in Step 2 produced a lint error before deletion
- [ ] `git status` shows only `eslint.config.mjs` modified (plus `plans/README.md`)
- [ ] `grep -c "no-restricted-imports" eslint.config.mjs` ≥ 4
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm lint` reports layer violations in existing `src/` files that are not
  `src/application/container.ts` — that means the codebase drifted from the
  verified-clean state of `84b8672`, and the violation needs a human decision
  (fix code vs. amend rule), not an improvised exemption.
- The flat-config `ignores` key inside a `files` block doesn't take effect in
  this ESLint version (rule fires on container.ts) and you cannot exempt it
  via a dedicated `{ files: ['src/application/container.ts'], rules: { 'no-restricted-imports': 'off' } }`
  override block placed after the application block.
- The canary in Step 2 does NOT produce an error (rules silently inert).

## Maintenance notes

- If a new sanctioned cross-layer import is ever needed (e.g. a second
  composition root for per-request repositories — see the FOOTGUN comment in
  `src/application/container.ts`), add a targeted override block, never widen
  the patterns.
- Reviewer should scrutinize: that the canary step was actually performed
  (ask for the error output), and that no `eslint-disable` comments were added
  to source files.
- Deliberately deferred: enforcing `app/ → presentation/app only` (the
  app→domain type imports are established practice) and import-cycle detection
  (would need `eslint-plugin-import`; revisit only if cycles appear).
