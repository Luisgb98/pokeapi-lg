# Plan 026: Add offensive coverage analysis to the team builder

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 56438cc..HEAD -- src/domain/entities/typeChart.ts src/presentation/components/organisms/TeamBuilder.tsx src/presentation/components/organisms/TeamCoverageDisplay.tsx messages src/__tests__/domain/teamCoverage.test.ts`
> On any mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P3 (direction)
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (pairs with 025: after landing, add one E2E assertion if 025 is done)
- **Category**: direction
- **Planned at**: commit `56438cc`, 2026-06-12

## Why this matters

The team builder's coverage analysis (`TeamCoverageDisplay`) is **defense
only**: it shows which attacking types threaten your team. It never answers
the complementary question every team builder asks — "which defending types
can my team NOT hit super-effectively?" (e.g. "nothing on this team is
super-effective against Steel"). The answer is a pure function over the
existing 18×18 type chart using each member's own types as STAB attacking
types — no API calls, no new data. Selected as a direction feature by the
maintainer in the 2026-06-12 advisory session.

## Current state

- `src/domain/entities/typeChart.ts` — owns `TYPE_CHART`
  (`Record<PokemonType, Record<PokemonType, number>>`, attacker → defender →
  multiplier), `getTypeChart()` (line 369), `computeTeamCoverage()` (line 383,
  defensive: iterates `POKEMON_TYPES` as _attackers_ against each team
  member's type combo), and `computeDefensiveMatchups()` (line 419). Excerpt
  of the existing defensive function's core loop:

  ```ts
  // typeChart.ts:383
  export function computeTeamCoverage(
    team: readonly (readonly PokemonType[])[],
  ): readonly TeamCoverageEntry[] {
    return POKEMON_TYPES.map((attackingType) => {
      ...
      for (const memberTypes of team) {
        const multiplier = memberTypes.reduce(
          (acc, defendingType) => acc * TYPE_CHART[attackingType][defendingType],
          1,
        );
  ```

- `src/presentation/components/organisms/TeamCoverageDisplay.tsx` — client
  component; props `{ teamTypes: readonly (readonly PokemonType[])[]; typeLabels: Record<PokemonType, string>; title: string }`;
  calls `computeTeamCoverage` in a `useMemo`, renders a responsive grid of
  `CoverageCell`s inside a `<section>` with this heading style (match it):

  ```tsx
  <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 dark:border-stone-700 dark:bg-stone-900">
    <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
      {title}
    </h2>
  ```

- `src/presentation/components/organisms/TeamBuilder.tsx` — renders
  `TeamCoverageDisplay` (find the call site with
  `grep -n "TeamCoverageDisplay" src/presentation/components/organisms/TeamBuilder.tsx`)
  and receives `typeLabels` from the server page
  (`src/app/[locale]/team/page.tsx`).

- i18n: 6 locale files `messages/{en,es,fr,de,it,pt}.json`, namespace
  `teamBuilder` (29 keys). CI runs `pnpm i18n:check` (key parity across all
  six). Every new key must be added to **all six** files.

- `src/presentation/lib/typeColors.ts` — exports `TYPE_CLASSES` (Tailwind
  class strings per type). `TypeBadge` atom
  (`src/presentation/components/atoms/TypeBadge.tsx`) renders a type chip —
  reuse it for listing gap types.

- Tests: `src/__tests__/domain/teamCoverage.test.ts` covers
  `computeTeamCoverage` with `describe`/`it` blocks per scenario (empty team,
  single member, multiple members). Model new tests after it.

- Architecture rules (CLAUDE.md): domain has zero internal imports;
  presentation may import domain; `style=` props banned; component-specific
  CSS goes in CVA variants or Tailwind classes, never globals.css.

## Commands you will need

| Purpose   | Command                                                          | Expected on success |
| --------- | ---------------------------------------------------------------- | ------------------- |
| Install   | `pnpm install`                                                   | exit 0              |
| Typecheck | `pnpm typecheck`                                                 | exit 0              |
| Tests     | `pnpm test`                                                      | all pass            |
| One file  | `pnpm vitest run src/__tests__/domain/offensiveCoverage.test.ts` | new tests pass      |
| Lint      | `pnpm lint`                                                      | exit 0              |
| i18n      | `pnpm i18n:check`                                                | exit 0              |
| Build     | `pnpm build`                                                     | exit 0              |

## Scope

**In scope** (the only files you should modify or create):

- `src/domain/entities/typeChart.ts` — add `computeOffensiveCoverage` (additive only)
- `src/__tests__/domain/offensiveCoverage.test.ts` (create)
- `src/presentation/components/organisms/OffensiveCoverageDisplay.tsx` (create)
- `src/presentation/components/organisms/TeamBuilder.tsx` — render the new display
- `messages/en.json`, `messages/es.json`, `messages/fr.json`,
  `messages/de.json`, `messages/it.json`, `messages/pt.json` — new keys in `teamBuilder`
- `src/app/[locale]/team/page.tsx` — ONLY if new translated labels must be
  passed down (follow how `typeLabels` is built there)

**Out of scope** (do NOT touch):

- `computeTeamCoverage`, `computeDefensiveMatchups`, `TYPE_CHART` — existing
  functions and data must not change.
- `TeamCoverageDisplay.tsx` — add a sibling component, don't extend this one.
- `teamBuilderStore.ts`, the picker modal, drag-and-drop.

## Git workflow

- Branch: `advisor/026-offensive-team-coverage`
- Conventional commits, e.g. `feat: add offensive coverage analysis to team builder`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Domain function + tests (TDD: tests first)

Create `src/__tests__/domain/offensiveCoverage.test.ts` covering the function
specified below (write tests, watch them fail, then implement). Then add to
`src/domain/entities/typeChart.ts`:

```ts
export interface OffensiveCoverageEntry {
  /** The single defending type being evaluated. */
  readonly defendingType: PokemonType;
  /** Best STAB multiplier any team member achieves vs this type (0 | 0.5 | 1 | 2). */
  readonly bestMultiplier: number;
  /** How many team members have a STAB type that hits this type super-effectively. */
  readonly superEffectiveCount: number;
}

/**
 * STAB-only offensive coverage: for each defending type, the best multiplier
 * achievable using only the team members' own types as attacking types.
 * Coverage moves are intentionally ignored (approximation).
 */
export function computeOffensiveCoverage(
  team: readonly (readonly PokemonType[])[],
): readonly OffensiveCoverageEntry[];
```

Semantics: for each `defendingType` in `POKEMON_TYPES`, iterate team members;
a member's multiplier vs that type is
`Math.max(...memberTypes.map((t) => TYPE_CHART[t][defendingType]))`
(its best STAB option); `bestMultiplier` is the max across members (0 for an
empty team, since no attack exists); `superEffectiveCount` counts members
whose best multiplier vs that type is `>= 2`. Note this evaluates single
defending types only (real opponents can be dual-typed) — that limitation is
acceptable and documented in the UI label.

Required test cases (model structure after `teamCoverage.test.ts`):

1. Empty team → 18 entries, all `bestMultiplier === 0`, all counts 0.
2. `[['water']]` vs `fire` → `bestMultiplier === 2`, `superEffectiveCount === 1`.
3. `[['water']]` vs `water` → `bestMultiplier === 0.5` (resisted), count 0.
4. `[['normal']]` vs `ghost` → `bestMultiplier === 0` (immune), count 0.
5. Dual member `[['water', 'ground']]` vs `fire` → `bestMultiplier === 2`,
   count 1 (one member, even though both its types hit super-effectively).
6. `[['fire'], ['water']]` vs `grass` → fire hits 2, water hits 0.5 →
   `bestMultiplier === 2`, `superEffectiveCount === 1`.
7. Team `[['normal']]` → normal-type attacks hit nothing super-effectively →
   assert NO entry has `superEffectiveCount > 0`.

**Verify**: `pnpm vitest run src/__tests__/domain/offensiveCoverage.test.ts`
→ all pass. `pnpm typecheck` → exit 0.

### Step 2: `OffensiveCoverageDisplay` component

Create `src/presentation/components/organisms/OffensiveCoverageDisplay.tsx`,
a client component (`'use client'`) mirroring `TeamCoverageDisplay`'s
structure and props:

```ts
interface OffensiveCoverageDisplayProps {
  teamTypes: readonly (readonly PokemonType[])[];
  typeLabels: Record<PokemonType, string>;
  title: string;
  /** e.g. "Based on STAB types only" */
  subtitle: string;
  /** e.g. "Not covered super-effectively:" */
  gapsLabel: string;
  /** e.g. "Your team covers every type" */
  noGapsLabel: string;
}
```

Render: `useMemo(() => computeOffensiveCoverage(teamTypes), [teamTypes])`;
section + h2 styled exactly like `TeamCoverageDisplay` (copy the className
strings shown in Current state); the `subtitle` in small muted text under the
heading; then a "gaps" row: all entries with `bestMultiplier < 2`, each
rendered with the existing `TypeBadge` atom
(`src/presentation/components/atoms/TypeBadge.tsx` — read it first and pass
the props it needs). If there are no gaps, show `noGapsLabel`. Optionally
below, a compact grid of all 18 entries with their best multiplier
(×2 / ×1 / ×½ / ×0) — keep cells visually consistent with `CoverageCell` in
`TeamCoverageDisplay.tsx`. When `teamTypes.length === 0`, mirror whatever
empty-team behavior the existing coverage display has (check its call site in
`TeamBuilder.tsx`; if the parent guards on empty team, rely on that, else
`return null`).

**Verify**: `pnpm typecheck` → exit 0; `pnpm lint` → exit 0.

### Step 3: Render it in `TeamBuilder` + i18n keys

In `TeamBuilder.tsx`, render `<OffensiveCoverageDisplay …/>` directly after
the existing `<TeamCoverageDisplay …/>`, passing the same `teamTypes` and
`typeLabels`. Labels come via `useTranslations('teamBuilder')` if that hook is
already used in `TeamBuilder.tsx`, otherwise via props from
`src/app/[locale]/team/page.tsx` — **match how the existing `title` for
`TeamCoverageDisplay` is provided** and do the same.

Add to the `teamBuilder` namespace in **all six** `messages/*.json` files:

| Key               | en value                                      |
| ----------------- | --------------------------------------------- |
| `offenseTitle`    | "Offensive Coverage"                          |
| `offenseSubtitle` | "Based on your team's own types (STAB only)"  |
| `offenseGaps`     | "Not hit super-effectively:"                  |
| `offenseNoGaps`   | "Your team hits every type super-effectively" |

Translate the values for es/fr/de/it/pt (natural translations, not
machine-literal word order).

**Verify**: `pnpm i18n:check` → exit 0. `pnpm build` → exit 0. Then run
`pnpm dev`, open `http://localhost:3000/en/team?team=1,4,7`, and confirm the
new section renders with gap badges (a Bulbasaur/Charmander/Squirtle team
does NOT cover every type).

### Step 4: Full gate

**Verify**: `pnpm format && pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test && pnpm build`
→ all exit 0.

## Test plan

- New: `src/__tests__/domain/offensiveCoverage.test.ts` — the 7 cases in
  Step 1, AAA style, modeled on `src/__tests__/domain/teamCoverage.test.ts`.
- No component unit tests required (presentation is excluded from coverage
  thresholds); the manual check in Step 3 plus E2E (if plan 025 landed)
  cover the UI.
- Coverage: `pnpm test:coverage` must stay ≥80% on domain (the new function
  is fully covered by the new tests).

## Done criteria

- [ ] `computeOffensiveCoverage` exists in `src/domain/entities/typeChart.ts`; existing exports untouched (`git diff` shows only additions in that file)
- [ ] `pnpm vitest run src/__tests__/domain/offensiveCoverage.test.ts` → ≥7 tests pass
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm i18n:check`, `pnpm build` all exit 0
- [ ] `/en/team?team=1,4,7` visibly renders the Offensive Coverage section
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row for 026 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `TeamCoverageDisplay`'s call site in `TeamBuilder.tsx` doesn't exist or its
  props differ from the excerpt (drift).
- `TypeBadge`'s props don't accommodate a plain type + label (you would have
  to modify the atom — report instead).
- Adding the section requires changing `teamBuilderStore` or the page's data
  flow beyond passing existing values down.

## Maintenance notes

- The STAB-only approximation is the documented contract. If move data is
  ever wired into the team builder, `computeOffensiveCoverage` gains a
  variant that accepts move types — keep the current signature stable.
- Reviewer should scrutinize: the immunity case (multiplier 0 is a gap just
  like 1× — both are `< 2`), and that all six locale files got all four keys.
- If plan 025 (E2E) is DONE, add one assertion to the team journey in
  `e2e/smoke.spec.ts` (offensive section visible) — one line, same test.
