# Plan 030: Add a daily type-matchup quiz as a second game mode

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 56438cc..HEAD -- src/presentation/store/gameStore.ts src/application/usecases/getGameChallenge.ts "src/app/[locale]/game" src/domain/entities/typeChart.ts src/presentation/lib/validatedStorage.ts messages`
> Plan 026 adds `computeOffensiveCoverage` to `typeChart.ts` — that addition
> is expected and NOT a STOP. Any change to `gameStore.ts` or the game page
> beyond the excerpts below IS a STOP.

## Status

- **Priority**: P3 (direction)
- **Effort**: M–L (largest of the 2026-06-12 batch)
- **Risk**: MED (new gameplay state machine; do not destabilize the existing game)
- **Depends on**: none hard. Soft: land 025 (E2E) first so the existing game
  flow has a regression guard. Sequencing with 026: both touch
  `typeChart.ts` additively — either order, trivial rebase.
- **Category**: direction
- **Planned at**: commit `56438cc`, 2026-06-12

## Why this matters

The game section has daily seeding, streaks, best score, per-day history, and
share links — infrastructure built for more than the single
"Who's That Pokémon?" mode it serves today. A "which type is
super-effective?" quiz reuses the 18×18 type chart (zero API calls), gives the
game section replay value, and exercises the same daily-challenge muscle.
**Design decision (made by the advisor, not open for re-deliberation): the
quiz gets its own store and route rather than generalizing `gameStore` into a
mode-keyed machine** — the existing store's persisted state, zod-validated
share path, and streak semantics stay untouched; shared logic is extracted
into a small helper. Selected as a direction feature by the maintainer in the
2026-06-12 advisory session.

## Current state

- `src/presentation/store/gameStore.ts` — the structural template. Key facts:

  ```ts
  export const TIMER_SECONDS = 30;
  export const MAX_ROUNDS = 10;
  export const HISTORY_LIMIT = 60;

  type GamePhase = 'playing' | 'revealed';

  interface GameState {
    dailySeed: number;
    phase: GamePhase;
    selectedId: number | null;
    score: { correct: number; total: number };
    challenge: GameChallenge | null;
    roundOffset: number;
    streak: number;
    bestScore: number;
    lastCompletedSeed: number | null;
    history: { seed: number; correct: number }[];
  }
  ```

  Actions: `initOrRestore`, `guess`, `timeOut`, `startNext`. Completion
  bookkeeping lives in a module-level pure function (excerpt):

  ```ts
  function completionUpdate(
    state: Pick<GameStore, 'dailySeed' | 'streak' | 'bestScore' | 'lastCompletedSeed' | 'history'>,
    correct: number,
  ): Partial<GameState> {
    const alreadyCounted = state.lastCompletedSeed === state.dailySeed;
    if (alreadyCounted) return {};
    const continued = state.lastCompletedSeed === state.dailySeed - 1;
    return {
      streak: continued ? state.streak + 1 : 1,
      bestScore: Math.max(state.bestScore, correct),
      lastCompletedSeed: state.dailySeed,
      history: [...state.history, { seed: state.dailySeed, correct }].slice(-HISTORY_LIMIT),
    };
  }
  ```

  Persistence: `persist(..., { name: 'pokemon-game-v2', skipHydration: true })`
  — note it does NOT use `withValidation` (see below); the newer stores do.

- `src/presentation/lib/validatedStorage.ts` — `withValidation(storage, stateSchema)`
  wraps a zustand `StateStorage` with a zod schema. `favoritesStore.ts`,
  `compareStore.ts`, `teamBuilderStore.ts` use it — copy the wiring from
  `favoritesStore.ts` (localStorage-backed, like the quiz store will be).

- `src/application/usecases/getGameChallenge.ts` — exports
  `getDailySeed(): number` (UTC day number) and a local `seededRng(seed)`
  (imul/xorshift hash, **not exported**). The quiz needs the same RNG
  approach in domain code; re-implement it there (domain cannot import
  application).

- `src/domain/entities/typeChart.ts` — `TYPE_CHART:
Record<PokemonType, Record<PokemonType, number>>` (attacker → defender →
  0 | 0.5 | 1 | 2), `POKEMON_TYPES` (18 types, from
  `src/domain/entities/Pokemon.ts`), `getTypeChart()` accessor.

- `src/domain/usecases/calculateTypeEffectiveness.ts` exists — the domain
  usecases directory is the home for the question generator.

- `src/app/[locale]/game/page.tsx` — Server Component; parses share params,
  fetches the daily challenge + `getTranslations('game')`, renders
  `WhosThatPokemon` in a `max-w-sm` column. The quiz page mirrors this but
  needs no repository at all.

- `src/presentation/components/organisms/WhosThatPokemon.tsx` — the client
  organism exemplar: drives the store, renders timer, 4 choice buttons,
  reveal feedback, round counter, game-over panel with streak/best labels.
  Read it fully before writing the quiz organism and mirror its structure and
  styling.

- i18n: namespace `game` (20 keys) in all six `messages/*.json`; parity
  enforced by `pnpm i18n:check`.

- Tests: `src/__tests__/presentation/store/` contains the gameStore tests —
  model the quiz store tests on them;
  `src/__tests__/application/getGameChallenge.test.ts` shows determinism
  testing for seeded RNG.

## Commands you will need

| Purpose   | Command              | Expected on success |
| --------- | -------------------- | ------------------- |
| Install   | `pnpm install`       | exit 0              |
| Typecheck | `pnpm typecheck`     | exit 0              |
| Tests     | `pnpm test`          | all pass            |
| Coverage  | `pnpm test:coverage` | thresholds hold     |
| Lint      | `pnpm lint`          | exit 0              |
| i18n      | `pnpm i18n:check`    | exit 0              |
| Build     | `pnpm build`         | exit 0              |

## Scope

**In scope** (create unless noted):

- `src/domain/usecases/getTypeQuizQuestion.ts`
- `src/__tests__/domain/getTypeQuizQuestion.test.ts`
- `src/presentation/store/gameProgress.ts` (extracted shared helper)
- `src/presentation/store/gameStore.ts` (modify ONLY to import the extracted
  helper — behavior identical)
- `src/presentation/store/typeQuizStore.ts`
- `src/__tests__/presentation/store/typeQuizStore.test.ts`
- `src/presentation/components/organisms/TypeQuiz.tsx`
- `src/app/[locale]/game/type-quiz/page.tsx`
- `src/app/[locale]/game/page.tsx` (modify: add a link/banner to the quiz)
- `messages/*.json` (all six) — new `typeQuiz` namespace + one `game` key

**Out of scope** (do NOT touch):

- `gameStore.ts` beyond the helper extraction — no schema changes, no
  `withValidation` retrofit (separate decision), no renames. The persisted
  key `pokemon-game-v2` must survive untouched.
- `gameShare.ts` / `SharedGameResult` — quiz result sharing is deferred
  (see Maintenance notes).
- `getGameChallenge.ts` — the quiz does not use the repository.

## Git workflow

- Branch: `advisor/030-type-quiz-game-mode`
- Conventional commits, e.g. `feat: add daily type-matchup quiz game mode`;
  the helper extraction is its own commit
  (`refactor: extract shared game completion helper`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Domain — deterministic question generator (tests first)

Create `src/domain/usecases/getTypeQuizQuestion.ts`:

```ts
import type { PokemonType } from '../entities/Pokemon';

export interface TypeQuizQuestion {
  /** The defending type combination shown to the player (1 or 2 types). */
  readonly defendingTypes: readonly PokemonType[];
  /** Exactly 4 options, exactly one of which is correct. */
  readonly choices: readonly PokemonType[];
  /** The attacking type that hits the defender super-effectively (≥2×). */
  readonly correct: PokemonType;
}

/** Deterministic for a given (seed, round). */
export function getTypeQuizQuestion(seed: number, round: number): TypeQuizQuestion;
```

Algorithm (keep it exactly this simple):

1. Derive an RNG from `seed * 1000 + round` using the same imul/xorshift
   construction as `seededRng` in
   `src/application/usecases/getGameChallenge.ts` (copy the 6 lines into this
   file — domain must not import application; add a comment noting the
   intentional duplication).
2. Pick a defender: 50% single type, 50% an ordered pair of two distinct
   types (combined multiplier = product of the two columns, like
   `computeDefensiveMatchups` does).
3. Compute the set of attacking types with multiplier ≥ 2 vs the defender
   and the set with multiplier < 2. If the super-effective set is empty or
   the non-super-effective set has fewer than 3 members, re-roll the
   defender (loop; terminates — almost every combo qualifies).
4. `correct` = random pick from the super-effective set; 3 distractors =
   random distinct picks from the non-super-effective set; shuffle the 4
   choices with the same RNG (Fisher–Yates, as in `getGameChallenge`).

Tests (`src/__tests__/domain/getTypeQuizQuestion.test.ts`):

- Determinism: same (seed, round) twice → deeply equal questions.
- Different rounds → different questions for at least one of rounds 0–5
  (not all identical).
- Property check over seeds 1–200, round 0: exactly 4 unique choices;
  `correct` is among `choices`; `TYPE_CHART`-verified: correct's multiplier
  vs the defender ≥ 2; every other choice's multiplier < 2; defender has 1–2
  types, distinct.

**Verify**: `pnpm vitest run src/__tests__/domain/getTypeQuizQuestion.test.ts`
→ pass.

### Step 2: Extract the shared completion helper

Create `src/presentation/store/gameProgress.ts` exporting `HISTORY_LIMIT`
and a generalized `completionUpdate` (same logic as the gameStore excerpt;
parameterize nothing else — copy the function, give it an exported type for
its input slice). In `gameStore.ts`, delete the local copy and import from
`./gameProgress`. **Behavioral diff must be zero.**

**Verify**: `pnpm test` → the existing gameStore tests pass unchanged.
`git diff src/presentation/store/gameStore.ts` shows only the import swap and
deletion.

### Step 3: `typeQuizStore`

Create `src/presentation/store/typeQuizStore.ts` modeled on `gameStore.ts`
with these differences:

- State: `dailySeed, phase ('playing' | 'revealed'), selected: PokemonType | null,
score, round (number, 0-based), streak, bestScore, lastCompletedSeed,
history` — the current question is **derived**
  (`getTypeQuizQuestion(dailySeed, round)`), not stored; no `challenge`
  field, no server data.
- Actions: `initOrRestore()` (no args — reads `getDailySeed()` from
  `@/application/usecases/getGameChallenge`, which presentation may import),
  `answer(type: PokemonType)`, `timeOut()`, `next()`. Completion at
  `MAX_ROUNDS = 10` via the shared `completionUpdate`.
- Reuse `TIMER_SECONDS` by importing it from `gameStore.ts` (or move it to
  `gameProgress.ts` if that import feels tangled — either is fine).
- Persistence: `persist` with
  `name: 'pokemon-typequiz-v1'`, `skipHydration: true`, and
  `withValidation(...)` + a zod schema for the persisted shape — copy the
  wiring pattern from `favoritesStore.ts` exactly.

Tests (`src/__tests__/presentation/store/typeQuizStore.test.ts`, modeled on
the gameStore tests): correct answer increments score and reveals; wrong
answer reveals without incrementing; timeout counts a round; completing 10
rounds sets streak/best/history exactly once (re-answering doesn't
double-count); `initOrRestore` on a new day resets play state but preserves
streak/best/history; consecutive-day completion increments streak, gapped
day resets it to 1.

**Verify**: `pnpm vitest run src/__tests__/presentation/store/typeQuizStore.test.ts`
→ pass. `pnpm typecheck` → exit 0.

### Step 4: UI — organism, page, link, i18n

`src/presentation/components/organisms/TypeQuiz.tsx` (`'use client'`) —
mirror `WhosThatPokemon.tsx`'s skeleton: countdown timer (30s), question
("Which type is super-effective against …?" with the defender rendered via
the existing `TypeBadge` atom), 4 choice buttons (use `TypeBadge`/type
colors from `TYPE_CLASSES`), reveal state (correct = accent, wrong pick =
muted/red), round counter, game-over panel with streak/best labels from the
new `typeQuiz` namespace. Timer behavior: copy `WhosThatPokemon`'s timer
implementation verbatim (it already handles cleanup and phase changes).

`src/app/[locale]/game/type-quiz/page.tsx` — Server Component, no
repository: `generateMetadata` from the `typeQuiz` namespace; render header +
`<TypeQuiz />` in a `max-w-sm` column like the game page.

`src/app/[locale]/game/page.tsx` — add a small link card under the existing
content linking to the quiz using the new `game.typeQuizCta` key (use the
locale-aware `Link` the app already uses — check `TopNav.tsx` for the import
source).

New i18n keys in **all six** `messages/*.json` — namespace `typeQuiz`:

| Key                | en value                                     |
| ------------------ | -------------------------------------------- |
| `heading`          | "Type Quiz"                                  |
| `subtitle`         | "Daily challenge — which type hits hardest?" |
| `question`         | "Which type is super-effective against…?"    |
| `correct`          | "Correct!"                                   |
| `wrong`            | "Wrong! The answer was {type}"               |
| `timeout`          | "Time's up! The answer was {type}"           |
| `nextRound`        | "Next Round"                                 |
| `roundOf`          | "Round {current}/{total}"                    |
| `gameOver`         | "Challenge Complete!"                        |
| `gameOverSubtitle` | "Come back tomorrow for a new challenge"     |
| `streakLabel`      | "Streak: {count} 🔥"                         |
| `bestLabel`        | "Best: {best}/10"                            |

Plus one key in the `game` namespace: `typeQuizCta` = "Try the Type Quiz →".
Translate all values for es/fr/de/it/pt.

**Verify**: `pnpm i18n:check` → exit 0. `pnpm build` → exit 0. `pnpm dev`:
`/en/game/type-quiz` plays a full 10-round game; answers reveal correctly
(spot-check one question against the type chart); refresh mid-game restores
position; `/en/game` still works and shows the CTA link.

### Step 5: Full gate

**Verify**: `pnpm format && pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build`
→ all exit 0.

## Test plan

- Domain: determinism + property tests for `getTypeQuizQuestion` (Step 1).
- Store: the behavioral cases in Step 3, modeled on the existing gameStore
  tests in `src/__tests__/presentation/store/`.
- Regression: the existing gameStore tests must pass **unchanged** after the
  Step 2 extraction.
- If plan 025's E2E suite exists, add one journey: `/en/game/type-quiz`
  loads, heading + 4 type buttons visible.

## Done criteria

- [ ] `pnpm vitest run src/__tests__/domain/getTypeQuizQuestion.test.ts src/__tests__/presentation/store/typeQuizStore.test.ts` → all pass
- [ ] Existing gameStore tests pass with zero modifications to their file
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check`, `pnpm test:coverage`, `pnpm build` all exit 0
- [ ] `/en/game/type-quiz` is playable end-to-end; `/en/game` unaffected plus CTA link
- [ ] `localStorage` key `pokemon-game-v2` format untouched; quiz persists under `pokemon-typequiz-v1`
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row for 030 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `gameStore.ts` no longer matches the excerpts (another plan or manual work
  changed it) — the extraction in Step 2 depends on `completionUpdate` being
  exactly as quoted.
- The gameStore tests reference `completionUpdate` directly (they shouldn't —
  it's module-private today; if they do, the extraction plan changes — report).
- `WhosThatPokemon.tsx`'s timer is entangled with challenge-fetching in a way
  that can't be copied standalone.
- The re-roll loop in Step 1 can't be shown to terminate for some seed
  (it should — if your property test finds a hang, report the seed).

## Maintenance notes

- Quiz **share links** were deliberately deferred: `gameShare.ts` validates
  `result/total/day` params for the silhouette game; extending it to carry a
  mode discriminator is a follow-up plan if wanted.
- Two stores now share `completionUpdate` — a future change to streak
  semantics must update both stores' tests.
- The 50/50 single/dual defender split and the ≥2× correctness bar are
  gameplay-tuning constants; keep them named at the top of
  `getTypeQuizQuestion.ts`.
- Reviewer should scrutinize: Step 2's diff (must be a pure extraction), the
  derived-question pattern (no question stored in state — prevents
  stale-question bugs on day rollover), and that `initOrRestore` preserves
  streak/best/history across days exactly like the gameStore's.
