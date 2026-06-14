# Plan 018: Validate untrusted inputs at app boundaries with zod

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 84b8672..HEAD -- "src/app/[locale]/game/page.tsx" src/presentation/lib src/presentation/store "src/app/api/og/[id]/route.tsx" src/application/actions/pokemon.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `84b8672`, 2026-06-12

## Why this matters

Three boundaries currently accept untrusted input without validation: (1) the
shared-game-result URL params on `/game` — `day` is NaN-checked but unbounded,
so `?result=5&total=10&day=-9999` renders a nonsense pre-epoch date and huge
values render "Invalid Date"; (2) Zustand stores persisted to cookies and
localStorage hydrate via plain `JSON.parse` with no shape check, so a tampered
or corrupted cookie hydrates malformed state and crashes downstream UI; (3) the
OG image route accepts any positive integer ID. Meanwhile `zod@4.4.3` is
declared in `package.json` dependencies with **zero imports anywhere in
`src/`** — a dead dependency. This plan fixes all three boundaries _using_ zod,
which resolves the dead-dep finding without removing a package we want anyway.
It also adds the missing `Secure` cookie attribute and a test for the only
untested server action, `fetchPokemonFormById`.

## Current state

Files and their roles:

- `src/app/[locale]/game/page.tsx` — server page; lines 26–36 parse share params manually:

  ```tsx
  // game/page.tsx:26-36 (current)
  if (sp.result !== undefined && sp.day !== undefined) {
    const day = parseInt(sp.day, 10);
    if (!Number.isNaN(day)) {
      const score = Math.max(0, Math.min(parseInt(sp.result, 10) || 0, MAX_ROUNDS));
      const total = Math.max(
        1,
        Math.min(parseInt(sp.total ?? String(MAX_ROUNDS), 10) || MAX_ROUNDS, MAX_ROUNDS),
      );
      return <SharedGameResult score={score} total={total} day={day} locale={locale} />;
    }
  }
  ```

- `src/presentation/components/organisms/SharedGameResult.tsx` — line 15 does
  `new Date(day * 86_400_000)`; `day` is UTC days since epoch. Valid values are
  `0 .. getDailySeed()` (today). `getDailySeed()` lives in
  `src/application/usecases/getGameChallenge.ts:10-13`.

- `src/presentation/lib/gameShare.ts` — currently only `buildShareUrl` and
  `buildShareText` (15 lines). The parsing counterpart will live here so it is
  unit-testable.

- `src/presentation/lib/cookieStorage.ts` — `setItem` writes
  `` `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax` ``
  with no `Secure` attribute.

- Persisted stores (`src/presentation/store/`):
  - `teamBuilderStore.ts` — persist name `'pokemon-team'`, `storage: createJSONStorage(() => cookieStorage)`. State shape: `{ team: TeamMember[] }` where `TeamMember = { id: number; name: string; displayName: string; types: PokemonType[]; sprite: string }`, max 6.
  - `compareStore.ts` — persist name `'pokemon-compare'`, cookieStorage. State shape: `{ slots: { a: number|null; b: number|null; c: number|null } }`.
  - `favoritesStore.ts` — persist name `'pokemon-favorites'`, **default storage (localStorage)**. State shape: `{ ids: number[] }`.
  - `gameStore.ts` — persist name `'pokemon-game-v2'`, localStorage, `skipHydration: true`. **OUT OF SCOPE** (see Scope) — its persisted `challenge` shape is complex and plan 022 modifies this store.

- `src/app/api/og/[id]/route.tsx` — lines 36–41:

  ```tsx
  const numericId = parseInt(id, 10);
  if (!Number.isFinite(numericId) || numericId < 1) {
    return new Response('Not found', { status: 404 });
  }
  ```

  No upper bound. Note: legitimate form IDs go up to ~10300 on PokeAPI, so the
  cap must be generous (use 20000), not 1025.

- `src/application/actions/pokemon.ts` — `fetchPokemonFormById` (lines 13–16)
  is the only export with no test coverage. Existing tests for this file:
  `src/__tests__/application/pokemonActions.test.ts` (use as the pattern; it
  injects a mock repository via `setRepository` from `@/application/container`).

- zod version is **v4** (`zod@^4.4.3`): import as `import { z } from 'zod'`;
  `z.coerce.number()` and `safeParse` work as in v3.

Conventions: TypeScript strict, no `any`. Layer rules: `presentation/` may
import `domain/` and `application/`; never `infrastructure/`. Tests live in
`src/__tests__/` mirroring the source tree, Vitest with globals enabled.

## Commands you will need

| Purpose   | Command          | Expected on success |
| --------- | ---------------- | ------------------- |
| Install   | `pnpm install`   | exit 0              |
| Typecheck | `pnpm typecheck` | exit 0, no errors   |
| Tests     | `pnpm test`      | all pass            |
| Lint      | `pnpm lint`      | exit 0              |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):

- `src/presentation/lib/gameShare.ts` (extend)
- `src/app/[locale]/game/page.tsx` (use new parser)
- `src/presentation/lib/cookieStorage.ts` (Secure flag)
- `src/presentation/lib/validatedStorage.ts` (create)
- `src/presentation/store/teamBuilderStore.ts`, `compareStore.ts`, `favoritesStore.ts` (wire validated storage)
- `src/app/api/og/[id]/route.tsx` (upper bound)
- `src/__tests__/presentation/lib/gameShare.test.ts` (extend)
- `src/__tests__/presentation/lib/validatedStorage.test.ts` (create)
- `src/__tests__/application/pokemonActions.test.ts` (extend)

**Out of scope** (do NOT touch):

- `src/presentation/store/gameStore.ts` — plan 022 owns it; its persisted
  `challenge` field is a complex nested shape not worth schema-validating here.
- `src/presentation/lib/teamShare.ts` — `parseTeamParam` already validates
  (integer, 1–1025, max 6). Leave as is.
- Any repository/infrastructure code; PokeAPI response validation is a
  separate concern, deliberately not in this plan.

## Git workflow

- Branch: `advisor/018-validate-untrusted-boundaries`
- Conventional commits, e.g. `fix: validate game share params and persisted store state`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a tested parser for game share params

In `src/presentation/lib/gameShare.ts`, add:

```ts
import { z } from 'zod';
import { getDailySeed } from '@/application/usecases/getGameChallenge';
import { MAX_ROUNDS } from '@/presentation/store/gameStore';

export interface GameShareParams {
  readonly score: number;
  readonly total: number;
  readonly day: number;
}

const shareParamsSchema = z.object({
  result: z.coerce.number().int().min(0),
  total: z.coerce.number().int().min(1).max(MAX_ROUNDS),
  day: z.coerce.number().int().min(0),
});

/** Returns null when params are absent, malformed, or out of range. */
export function parseGameShareParams(sp: {
  result?: string;
  total?: string;
  day?: string;
}): GameShareParams | null {
  if (sp.result === undefined || sp.day === undefined) return null;
  const parsed = shareParamsSchema.safeParse({
    result: sp.result,
    total: sp.total ?? String(MAX_ROUNDS),
    day: sp.day,
  });
  if (!parsed.success) return null;
  const { result, total, day } = parsed.data;
  if (day > getDailySeed()) return null; // future days are meaningless
  if (result > total) return null;
  return { score: result, total, day };
}
```

Check first that importing `MAX_ROUNDS` from the store and `getDailySeed` from
the use case does not create an import cycle (`gameStore.ts` already imports
`getDailySeed`, and `gameShare.ts` currently imports nothing — there is no
cycle as of `84b8672`).

**Intended behavior change**: malformed share URLs (e.g. `result=abc`) now fall
through to the normal game page instead of rendering a clamped 0-score card.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Use the parser in the game page

In `src/app/[locale]/game/page.tsx`, replace lines 26–36 (the block excerpted
in Current state) with:

```tsx
const shared = parseGameShareParams(sp);
if (shared) {
  return (
    <SharedGameResult score={shared.score} total={shared.total} day={shared.day} locale={locale} />
  );
}
```

Import `parseGameShareParams` from `@/presentation/lib/gameShare`. Remove the
now-unused `MAX_ROUNDS` import from the page if nothing else uses it.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 3: Secure flag on cookies

In `src/presentation/lib/cookieStorage.ts` `setItem`, append `; Secure` when
served over HTTPS (keep localhost dev working over HTTP):

```ts
const secure = document.location.protocol === 'https:' ? '; Secure' : '';
document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax${secure}`;
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 4: Validated persist storage

Create `src/presentation/lib/validatedStorage.ts`:

```ts
import type { z } from 'zod';
import type { StateStorage } from 'zustand/middleware';

/**
 * Wraps a StateStorage so that hydration only succeeds when the persisted
 * payload's `state` field matches the given schema. Invalid or corrupted
 * payloads behave as if nothing was persisted (returns null → store falls
 * back to initial state).
 */
export function withValidation(storage: StateStorage, stateSchema: z.ZodType): StateStorage {
  return {
    getItem: (name) => {
      const raw = storage.getItem(name);
      if (raw === null || raw instanceof Promise) return raw;
      try {
        const parsed: unknown = JSON.parse(raw as string);
        const state = (parsed as { state?: unknown })?.state;
        return stateSchema.safeParse(state).success ? raw : null;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => storage.setItem(name, value),
    removeItem: (name) => storage.removeItem(name),
  };
}
```

Note: zustand's persisted JSON envelope is `{ state: {...}, version: number }`;
the schema validates only `state`. The `instanceof Promise` guard keeps the
synchronous storages used here working without async plumbing.

Wire it up:

- `teamBuilderStore.ts`: define (next to the store)

  ```ts
  const persistedTeamSchema = z.object({
    team: z
      .array(
        z.object({
          id: z.number().int().positive(),
          name: z.string(),
          displayName: z.string(),
          types: z.array(z.string()),
          sprite: z.string(),
        }),
      )
      .max(TEAM_MAX_SIZE),
  });
  ```

  and change the persist options to
  `storage: createJSONStorage(() => withValidation(cookieStorage, persistedTeamSchema))`.

- `compareStore.ts`: schema
  `z.object({ slots: z.object({ a: z.number().int().positive().nullable(), b: ..., c: ... }) })`,
  same wiring.

- `favoritesStore.ts`: schema `z.object({ ids: z.array(z.number().int().positive()) })`.
  This store currently uses the **default** storage. Switch it to explicit
  validated localStorage:

  ```ts
  import { persist, createJSONStorage } from 'zustand/middleware';
  // ...
  {
    name: 'pokemon-favorites',
    storage: createJSONStorage(() =>
      withValidation(
        {
          getItem: (n) => (typeof window === 'undefined' ? null : window.localStorage.getItem(n)),
          setItem: (n, v) => window.localStorage.setItem(n, v),
          removeItem: (n) => window.localStorage.removeItem(n),
        },
        persistedFavoritesSchema,
      ),
    ),
  }
  ```

  (The persist key `'pokemon-favorites'` is unchanged, so existing users keep
  their favorites.)

Validate only — do not change any action logic, persist `name`s, or state
shapes in these stores.

**Verify**: `pnpm typecheck && pnpm test` → exit 0; all existing store tests in
`src/__tests__/presentation/store/` still pass.

### Step 5: OG route upper bound

In `src/app/api/og/[id]/route.tsx`, extend the existing guard:

```tsx
if (!Number.isFinite(numericId) || numericId < 1 || numericId > 20000) {
  return new Response('Not found', { status: 404 });
}
```

(20000, not 1025 — PokeAPI form IDs reach ~10300 and the detail pages link OG
images for form IDs.)

**Verify**: `pnpm typecheck` → exit 0.

### Step 6: Tests

See Test plan. Then run the full gate.

**Verify**: `pnpm test` → all pass; `pnpm build` → exit 0.

## Test plan

- Extend `src/__tests__/presentation/lib/gameShare.test.ts` (existing file —
  follow its structure) with `parseGameShareParams` cases:
  - happy path: compute a valid day in the test as
    `Math.floor(Date.now() / 86_400_000)` (avoids mocking `getDailySeed`);
    `{ result: '7', total: '10', day: String(validDay) }` →
    `{ score: 7, total: 10, day: validDay }`.
  - missing `result` or `day` → null.
  - non-numeric `result` → null. Negative `day` → null.
  - `day` in the future (`validDay + 5`) → null.
  - `result > total` (e.g. result 11, total 10) → null.
  - `total` omitted → defaults to MAX_ROUNDS.
- Create `src/__tests__/presentation/lib/validatedStorage.test.ts`:
  - valid envelope passes through unchanged.
  - malformed JSON string → getItem returns null.
  - wrong state shape (e.g. `{ state: { team: 'nope' } }`) → null.
  - setItem/removeItem delegate to the wrapped storage.
    Use a simple in-memory `Map`-backed StateStorage stub.
- Extend `src/__tests__/application/pokemonActions.test.ts` with
  `fetchPokemonFormById`: returns the repository result for a valid ID; returns
  null when the repository returns null. Follow the existing
  `setRepository`-based mocking in that file.

Verification: `pnpm test` → all pass, including the new cases.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all exit 0
- [ ] `grep -rln "from 'zod'" src/ | grep -v __tests__` lists at least `gameShare.ts`, `validatedStorage.ts`, and the three store files
- [ ] `grep -n "Secure" src/presentation/lib/cookieStorage.ts` matches
- [ ] `grep -n "20000" "src/app/api/og/[id]/route.tsx"` matches
- [ ] New tests exist and pass for parseGameShareParams, withValidation, fetchPokemonFormById
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts.
- Importing `getDailySeed` or `MAX_ROUNDS` into `gameShare.ts` creates a
  circular-import warning or runtime error.
- Wiring validated storage breaks an existing store test in a way that isn't a
  trivial test-setup fix (e.g. the test relied on hydrating arbitrary shapes).
- zod v4's API differs from the snippets in a way that requires more than a
  mechanical adjustment.

## Maintenance notes

- Plan 022 (game streaks) adds fields to `gameStore`; if it also wants schema
  validation, reuse `withValidation` from this plan.
- If team size or compare slots ever change, the schemas here must change in
  lockstep — they encode the same invariants the stores enforce.
- Reviewer should scrutinize: that hydration failures fall back silently to
  initial state (intended — no user-facing error for a corrupted cookie), and
  that the `'pokemon-favorites'` persist key didn't change.
