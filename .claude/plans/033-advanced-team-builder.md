# Plan 033: Advanced team builder — movesets, ability, nature, level, IVs/EVs (with legality)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat bac0ec6..HEAD -- src/presentation/store/teamBuilderStore.ts src/domain/usecases/calculateStats.ts src/domain/data/natures.ts src/domain/entities/Move.ts src/domain/ports/PokemonRepository.ts src/presentation/components/organisms/TeamBuilder.tsx`
> Plan 032 may have added a `saveTeam` sync hook around `teamBuilderStore` —
> that is expected. Any change to `calculateStats.ts`, `natures.ts`, or the
> `findMoveLearnset` signature beyond what is quoted IS a STOP.

## Status

- **Priority**: P3 (direction)
- **Effort**: L
- **Risk**: MED (lots of UI surface; data-legality correctness is the crux)
- **Done**: 2026-06-15 — all steps implemented and verified (typecheck ✓, lint ✓, 456 tests ✓, build ✓, migration applied)
- **Depends on**:
  - **Hard for cloud persistence**: plan 032 (the `teamMembers` table gains the
    build columns; saved builds need the DB). The local-only build editor can
    be developed before 032 lands, but the **full** feature (saved enriched
    teams per account) needs 032.
  - **Soft**: plan 031 (unrelated; reduces branch churn).
- **Category**: direction
- **Planned at**: commit `bac0ec6`, 2026-06-14

## Why this matters

The team builder today stores only identity per slot (`id, name, displayName,
types, sprite`). Competitive value comes from the **build**: held ability,
nature, level, IVs, EVs, and a moveset. The project already has most of the
machinery: `findMoveLearnset(id, locale)` returns the real, legal learnset;
`Pokemon.abilities` is the legal ability list; `NATURES` + `calculateAllStats`

- the IV/EV/level constants already power `/tools/stat-calculator`. This plan
  wires those into a per-slot build editor whose inputs are **constrained to what
  is actually legal** — illegal moves and abilities never appear as options.

## Legality — get this right (it is the heart of the request)

The requester asked that "attacks or natures the Pokémon can't have shouldn't
appear." The accurate model:

- **Moves**: species-restricted. Source of truth = `findMoveLearnset(id,
locale)` (already in the repository port). The move picker lists **only** the
  learnset; nothing else is selectable. Max 4 moves, no duplicates.
- **Abilities**: species-restricted. Source of truth = `Pokemon.abilities`
  (`readonly PokemonAbilityRef[]`, includes `isHidden`). The ability picker
  lists **only** those; exactly one is selected.
- **Nature**: **NOT** species-restricted — correction to the original premise.
  All 25 natures (`NATURES`) are legal for every Pokémon in the games. So the
  nature picker shows all 25; there is nothing to filter. (Document this in the
  PR description so it is a conscious decision, not an oversight.)
- **IVs**: 0–`IV_MAX` (31) per stat.
- **EVs**: 0–`EV_MAX` (252) per stat, and total ≤ `EV_TOTAL_MAX` (510).
- **Level**: `LEVEL_MIN`..`LEVEL_MAX` (1–100).

All five numeric/enum constraints already exist as constants in
`src/domain/usecases/calculateStats.ts`. Validation is a pure domain function
(Step 1) so it is testable without UI and reusable by the server (plan 032's
save action must re-validate — never trust client-submitted builds).

## Current state (what you are extending)

- `src/presentation/store/teamBuilderStore.ts` — `TeamMember` =
  `{ id, name, displayName, types, sprite }` (all readonly). `persist` under
  cookie key `pokemon-team`, with a `withValidation(cookieStorage, zodSchema)`
  guard whose schema must be extended in lockstep with the type (Step 3).
  `TEAM_MAX_SIZE = 6`. Actions: `addMember`, `addMembers`, `removeMember`,
  `reorderTeam`, `clear`.
- `src/domain/usecases/calculateStats.ts` — `calculateAllStats(base, ivs, evs,
level, nature)` + `IV_MAX/EV_MAX/EV_TOTAL_MAX/LEVEL_MIN/LEVEL_MAX`. Reuse,
  do not reimplement.
- `src/domain/data/natures.ts` — `NATURES` (25), `getNature(name)`,
  `Nature { increased, decreased }`.
- `src/domain/entities/Move.ts` — `Move`, `LearnedMove { move, learnMethod,
levelLearnedAt }`, `LEARN_METHODS`.
- `src/domain/ports/PokemonRepository.ts` — `findMoveLearnset(id, locale):
Promise<readonly LearnedMove[]>` and `findById(id): Promise<Pokemon | null>`
  (gives `stats` (base) + `abilities`).
- `src/app/[locale]/tools/stat-calculator/page.tsx` +
  `presentation/components/organisms/StatCalculator.tsx` — the existing
  IV/EV/nature/level UI exemplar; **read it and reuse its sliders/inputs and
  the live `calculateAllStats` wiring** rather than building new stat controls.
- `src/presentation/components/organisms/TeamBuilder.tsx`,
  `molecules/TeamSlot.tsx`, `molecules/SortableTeamSlot.tsx` — the slot UI to
  extend with a "configure build" affordance.

## Commands you will need

| Purpose   | Command              | Expected        |
| --------- | -------------------- | --------------- |
| Typecheck | `pnpm typecheck`     | exit 0          |
| Tests     | `pnpm test`          | all pass        |
| Coverage  | `pnpm test:coverage` | thresholds hold |
| Lint      | `pnpm lint`          | exit 0          |
| i18n      | `pnpm i18n:check`    | exit 0          |
| Build     | `pnpm build`         | exit 0          |

## Scope

**In scope:**

- `src/domain/entities/TeamMemberBuild.ts` (CREATE — the build value object)
- `src/domain/usecases/validateTeamMemberBuild.ts` (CREATE — pure legality validator)
- `src/__tests__/domain/validateTeamMemberBuild.test.ts` (CREATE)
- `src/presentation/store/teamBuilderStore.ts` (MODIFY — add optional `build`
  to `TeamMember`, extend zod schema, add `setMemberBuild(id, build)` action,
  bump persisted key with a migration — see Step 3)
- `src/presentation/queries/*` (CREATE/EXTEND — a query for `findMoveLearnset`
  - `findById` for the slot being configured; reuse existing query-key style)
- `src/presentation/components/organisms/TeamMemberBuildEditor.tsx` (CREATE —
  the per-slot build panel: ability select, nature select, level, IV/EV
  sliders reusing StatCalculator controls, move multi-select from learnset)
- `src/presentation/components/molecules/MovePicker.tsx` (CREATE — ≤4 from learnset)
- `TeamSlot.tsx` / `TeamBuilder.tsx` (MODIFY — open the editor; show a build
  summary on the slot)
- `messages/*.json` (all six) — `teamBuild` namespace
- **If plan 032 is landed**: `infrastructure/db` migration adding build columns
  to `teamMembers`; `DrizzleUserDataRepository` + `saveTeamAction` updated to
  persist & **re-validate** the build server-side.

**Out of scope:**

- Held items / Tera types / move PP-ups — explicitly deferred (note in
  maintenance). Keep the build value object open for them but do not build UI.
- Damage calculation between Pokémon — separate future plan.
- Changing `calculateAllStats`, `NATURES`, or `findMoveLearnset` signatures.

## Git workflow

- Branch: `advisor/033-advanced-team-builder`
- Conventional commits, e.g. `feat: add per-slot competitive build editor to team builder`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Domain — build value object + legality validator (tests first)

Create `src/domain/entities/TeamMemberBuild.ts`:

```ts
import type { PokemonStats } from './Pokemon';

export interface TeamMemberBuild {
  readonly abilityName: string; // must be one of the Pokémon's abilities
  readonly natureName: string; // any of the 25 NATURES
  readonly level: number; // LEVEL_MIN..LEVEL_MAX
  readonly ivs: PokemonStats; // each 0..IV_MAX
  readonly evs: PokemonStats; // each 0..EV_MAX, total <= EV_TOTAL_MAX
  readonly moveNames: readonly string[]; // <=4, unique, all in the learnset
}
```

Create `src/domain/usecases/validateTeamMemberBuild.ts` — a pure function that
takes the build plus the **legal context** (the Pokémon's ability names and its
legal move names) and returns a discriminated result
(`{ ok: true } | { ok: false; errors: BuildError[] }`). Rules: ability ∈ legal
abilities; nature ∈ `NATURES`; level in range; every IV 0..31; every EV
0..252 and Σ ≤ 510; ≤4 moves, unique, each ∈ legal move names. Reuse the
constants from `calculateStats.ts`; do not hardcode 31/252/510.

Tests cover each rule's pass and fail path (illegal ability rejected, 5th move
rejected, duplicate move rejected, EV total 511 rejected, EV single 253
rejected, IV 32 rejected, level 0/101 rejected, unknown nature rejected, a
fully-legal build accepted).

**Verify**: `pnpm vitest run src/__tests__/domain/validateTeamMemberBuild.test.ts`
→ pass.

### Step 2: Presentation data — fetch the legal context per slot

Add a query (TanStack Query, mirror `presentation/queries/` and the existing
query-key conventions) that, given a slot's `pokemonId` + locale, fetches:

- `findById(id)` → base `stats` + `abilities` (the legal ability list)
- `findMoveLearnset(id, locale)` → the legal move list

These go through the existing server/repository path (presentation must not
touch `infrastructure/` directly — use the same loader pattern the detail page
uses). The build editor consumes this to populate its option lists. The base
stats feed the **live** `calculateAllStats` preview.

**Verify**: in `pnpm dev`, open a slot's editor for Garchomp — the move list
shows only Garchomp's learnset; the ability list shows only Sand Veil / Rough
Skin; pick an illegal move = impossible (not in the list).

### Step 3: Store — carry the optional build + migrate persisted state

In `teamBuilderStore.ts`:

- Extend `TeamMember` with `readonly build?: TeamMemberBuild`.
- Extend the persisted zod schema to allow an optional `build` object (each
  field validated: ivs/evs as 6-number objects, moveNames array, etc.).
- Add action `setMemberBuild(id: number, build: TeamMemberBuild)` (immutable
  update — replace the member, never mutate).
- **Persisted-state migration**: bump the persist `name` to `pokemon-team-v2`
  (or add a `version` + `migrate` to the persist config) so old saved teams
  without builds load cleanly. Existing members simply have `build:
undefined`. Do not silently drop existing teams.

Update `src/__tests__/presentation/store/teamBuilderStore.test.ts`:
`setMemberBuild` sets/replaces a build immutably; members without a build still
load; the new schema accepts a valid build and rejects a malformed one.

**Verify**: `pnpm vitest run src/__tests__/presentation/store/teamBuilderStore.test.ts`
→ pass. Manually confirm a pre-existing `pokemon-team` cookie still hydrates.

### Step 4: UI — the build editor

`TeamMemberBuildEditor.tsx` (`'use client'`): opened from a slot. Sections:

- **Ability**: a select limited to the Pokémon's abilities (mark the hidden one).
- **Nature**: a select over all 25 `NATURES`, showing the +/− stat hint from
  `Nature.increased/decreased`.
- **Level**: numeric input/slider 1–100.
- **IVs / EVs**: reuse the StatCalculator's sliders/number inputs. Enforce the
  EV total ≤510 live (disable/clamp when the remaining budget is 0); show the
  remaining EV budget. (No `style=` props — use the CSS-variable bridge pattern
  for any runtime bar widths, per CLAUDE.md.)
- **Moves**: `MovePicker.tsx` — a searchable list of the learnset, select up to
  4 (disable further selection at 4), localized move names already provided by
  `findMoveLearnset`.
- **Live computed stats**: call `calculateAllStats(base, ivs, evs, level,
getNature(natureName))` and render the resulting final stats (this is the
  payoff — the same calc the stat-calculator tool shows).

On save, run `validateTeamMemberBuild` (defense in depth even though the UI
constrains inputs) and call `setMemberBuild`. Show a build summary on the slot
(nature + 4 move chips + level) via `TeamSlot.tsx`.

i18n: `teamBuild` namespace in all six `messages/*.json`
(`configure`, `ability`, `hiddenAbility`, `nature`, `level`, `ivs`, `evs`,
`evBudget`, `moves`, `selectUpToFour`, `finalStats`, `save`, `reset`…).
Translate for es/fr/de/it/pt.

**Verify**: `pnpm i18n:check` exit 0; `pnpm build` exit 0; manual: configure a
slot end-to-end, reopen it (build persisted), final stats match the
stat-calculator tool for the same inputs.

### Step 5 (only if plan 032 is landed): persist builds to the account

- Migration adding columns to `teamMembers`: `abilityName text`,
  `natureName text`, `level smallint`, `ivs jsonb`, `evs jsonb`,
  `moveNames text[]` (all nullable — a slot may have no build yet).
- `DrizzleUserDataRepository.saveTeam` reads/writes these columns; `getTeam`
  rebuilds the `TeamMemberBuild`.
- `saveTeamAction` (server) **re-runs `validateTeamMemberBuild`** for each
  member against freshly-fetched legal context before writing — never trust the
  client's claim of legality. Reject the whole save on any illegal build.

**Verify**: logged-in, configure a build, save the team, reload on another
session → build round-trips; a crafted illegal payload to the action is
rejected.

### Step 6: Full gate

**Verify**:
`pnpm format && pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build`
→ all exit 0.

## Test plan

- Domain: `validateTeamMemberBuild` — every rule's pass/fail (Step 1).
- Store: `setMemberBuild` immutability + schema migration (Step 3).
- Server (if 032): action re-validation rejects illegal builds (Step 5).
- Manual legality spot-check: a chosen Pokémon's move list = its learnset only;
  ability list = its abilities only; EV total cannot exceed 510 in the UI.
- E2E (if plan 025 suite exists): one journey configuring a slot's build.

## Done criteria

- [ ] Move options for a slot are exactly the Pokémon's learnset; ability
      options are exactly its abilities (illegal choices unreachable)
- [ ] Nature picker shows all 25 (documented: natures are not species-restricted)
- [ ] IV (0–31), EV (≤252 each, ≤510 total), level (1–100) enforced in UI and
      re-validated by `validateTeamMemberBuild`
- [ ] Live final stats match `calculateAllStats` / the stat-calculator tool
- [ ] Build persists locally (migrated `teamBuilderStore`); existing teams still load
- [ ] If 032 landed: builds persist per account and are server-re-validated
- [ ] `pnpm i18n:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build` exit 0
- [ ] `plans/README.md` row for 033 updated

## STOP conditions

Stop and report (do not improvise) if:

- `findMoveLearnset` returns an empty list for a common Pokémon (e.g. id 6) —
  the learnset source is broken; do not ship a build editor with no moves.
- `calculateStats.ts` constants or `calculateAllStats` signature differ from
  the Current-state description (another plan changed them).
- Bumping the `teamBuilderStore` persist key would discard existing user teams
  without a migration path — implement the `migrate` callback instead, and if
  that is not possible, report.
- Plan 033 Step 5 is reached but plan 032's `teamMembers` table / `saveTeam`
  do not exist — stop at Step 4 (local-only) and report that 032 must land first.

## Maintenance notes

- The original request said "natures the Pokémon can't have shouldn't appear" —
  this plan corrects that: natures are universal; the real legality is on moves
  and abilities. Keep that correction visible in the PR description.
- Held items, Tera type, and move PP-ups are deliberately out of scope; the
  `TeamMemberBuild` value object is shaped so they can be added as optional
  fields without another migration churn.
- `validateTeamMemberBuild` is the single source of truth for legality and is
  used by **both** the client editor and (with 032) the server save action —
  any new constraint goes there once.
- Learnset is fetched "most recent available game" (per the port JSDoc); if a
  future plan adds generation/format scoping, the move legality context becomes
  generation-aware and this validator gains a generation parameter.
