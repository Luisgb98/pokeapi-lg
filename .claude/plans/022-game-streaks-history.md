# Plan 022: Add daily-streak and score-history tracking to the game

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 84b8672..HEAD -- src/presentation/store/gameStore.ts src/presentation/components/organisms/WhosThatPokemon.tsx messages`
> On any mismatch with the "Current state" excerpts, STOP.

## Status

- **Status**: done (commit d75d252, 2026-06-12)
- **Priority**: P3 (direction)
- **Effort**: M
- **Risk**: MED (persisted-state changes)
- **Depends on**: 021 (i18n parity check — it catches a forgotten locale when you add the new keys; soft dependency, can proceed without it but then double-check all six locale files manually)
- **Category**: direction
- **Planned at**: commit `84b8672`, 2026-06-12

## Why this matters

The daily game has all the infrastructure of a Wordle-style habit loop —
seeded daily challenge (`getDailySeed()` = UTC days since epoch), persisted
state, shareable results — but tracks nothing across days: each session is
isolated, and finishing a challenge offers no reason to come back beyond
"come back tomorrow". Streak + best score + per-day history are the missing
metrics; they are purely additive client-side state with no new API calls.
This was selected as a direction feature by the maintainer in the 2026-06-12
advisory session.

## Current state

- `src/presentation/store/gameStore.ts` (relevant excerpts at `84b8672`):

  ```ts
  export const TIMER_SECONDS = 30;
  export const MAX_ROUNDS = 10;

  interface GameState {
    dailySeed: number;
    phase: GamePhase;
    selectedId: number | null;
    score: { correct: number; total: number };
    challenge: GameChallenge | null;
    roundOffset: number;
  }

  const INITIAL_STATE: GameState = { dailySeed: 0, phase: 'playing', selectedId: null,
    score: { correct: 0, total: 0 }, challenge: null, roundOffset: 0 };

  // actions (abridged):
  initOrRestore: (initialChallenge) => {
    const today = getDailySeed();
    const { dailySeed, challenge } = get();
    if (dailySeed === today && challenge !== null) return;
    set({ ...INITIAL_STATE, dailySeed: today, challenge: initialChallenge });
  },
  guess: (pokemonId) => {
    const { phase, challenge, score } = get();
    if (phase !== 'playing' || !challenge) return;
    const isCorrect = pokemonId === challenge.correct.id;
    set({ phase: 'revealed', selectedId: pokemonId,
      score: { correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 } });
  },
  timeOut: () => {
    const { phase, score } = get();
    if (phase !== 'playing') return;
    set({ phase: 'revealed', selectedId: null, score: { ...score, total: score.total + 1 } });
  },
  // persist options:
  { name: 'pokemon-game-v2', skipHydration: true }
  ```

  Persistence is **localStorage** (zustand default), `skipHydration: true`,
  rehydrated manually in `WhosThatPokemon` via `useGameStore.persist.rehydrate()`.

- `src/presentation/components/organisms/WhosThatPokemon.tsx` — game-over
  panel (lines ~227–243):

  ```tsx
  {isGameOver ? (
    <div className="rounded-xl bg-stone-50 px-5 py-5 text-center dark:bg-stone-800">
      <p className="font-display text-lg font-bold ...">{t('gameOver')}</p>
      <p className="mt-1 font-display text-5xl font-black ...">
        {score.correct}
        <span className="text-xl font-bold ...">/{MAX_ROUNDS}</span>
      </p>
      <p className="mt-2 text-sm ...">{t('gameOverSubtitle')}</p>
      <GameShareButton />
    </div>
  ) : ( ... )}
  ```

  A game is **complete** when `score.total` reaches `MAX_ROUNDS`
  (`isGameOver = isRevealed && score.total >= MAX_ROUNDS`).

- `getDailySeed()` (`src/application/usecases/getGameChallenge.ts:10-13`)
  returns UTC days since epoch — consecutive days differ by exactly 1.

- i18n: `messages/{en,es,fr,de,it,pt}.json`, namespace `game`. All six files
  must receive any new key (plan 021 adds a CI check for this).

- Store tests: `src/__tests__/presentation/store/gameStore.test.ts` — follow
  its existing structure (it exercises the store directly via
  `useGameStore.getState()` / actions).

- Zustand persist merge note: the default `merge` is
  `{ ...initialState, ...persistedState }`, so **adding** fields with defaults
  is backward compatible — an existing user's persisted blob simply lacks the
  new keys and the defaults apply. No `version`/`migrate` needed for additive
  fields. Do not rename the persist key.

## Commands you will need

| Purpose | Command           | Expected on success         |
| ------- | ----------------- | --------------------------- |
| Types   | `pnpm typecheck`  | exit 0                      |
| Tests   | `pnpm test`       | all pass                    |
| Lint    | `pnpm lint`       | exit 0                      |
| i18n    | `pnpm i18n:check` | exit 0 (if plan 021 landed) |
| Build   | `pnpm build`      | exit 0                      |

## Scope

**In scope**:

- `src/presentation/store/gameStore.ts`
- `src/presentation/components/organisms/WhosThatPokemon.tsx`
- `messages/en.json`, `es.json`, `fr.json`, `de.json`, `it.json`, `pt.json` (game namespace keys)
- `src/__tests__/presentation/store/gameStore.test.ts`

**Out of scope** (do NOT touch):

- `src/application/usecases/getGameChallenge.ts` — seeding logic is frozen.
- `SharedGameResult.tsx`, `gameShare.ts` — share format unchanged (streak in
  the share text is an explicitly deferred follow-up).
- No new pages/routes (a `/game/history` page is a future option, not this plan).
- The persist key `'pokemon-game-v2'` must NOT change.

## Git workflow

- Branch: `advisor/022-game-streaks-history`
- Commits: `feat: track game streaks, best score, and per-day history`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extend the store state

In `gameStore.ts` add to `GameState` (and `INITIAL_STATE` with the defaults
shown):

```ts
/** Consecutive completed days, counted at completion time. */
streak: number; // default 0
/** Highest correct-count ever achieved in a completed challenge. */
bestScore: number; // default 0
/** Seed (UTC day number) of the most recently completed challenge. */
lastCompletedSeed: number | null; // default null
/** Most recent completed days, newest last, capped at HISTORY_LIMIT. */
history: {
  seed: number;
  correct: number;
}
[]; // default []
```

Add `export const HISTORY_LIMIT = 60;`.

**Verify**: `pnpm typecheck` → exit 0 (Steps 1–3 may need to land together
for typecheck to pass; that is fine — verify after the unit).

### Step 2: Record completion in `guess` and `timeOut`

Both actions advance `score.total`; when the new total reaches `MAX_ROUNDS`
the challenge is complete. Add a private helper above the store creator:

```ts
function completionUpdate(
  state: Pick<GameStore, 'dailySeed' | 'streak' | 'bestScore' | 'lastCompletedSeed' | 'history'>,
  correct: number,
) {
  const alreadyCounted = state.lastCompletedSeed === state.dailySeed; // same-day re-completion: no-op
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

In `guess`, when `score.total + 1 === MAX_ROUNDS`, spread
`...completionUpdate(get(), score.correct + (isCorrect ? 1 : 0))` into the
`set` payload. Same in `timeOut` with `score.correct` unchanged. Keep the
existing payload fields exactly as they are.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Preserve the new fields across the daily reset

`initOrRestore` currently resets with `set({ ...INITIAL_STATE, dailySeed:
today, challenge: initialChallenge })` — this would wipe streak/history every
new day. Change it to carry them over:

```ts
initOrRestore: (initialChallenge) => {
  const today = getDailySeed();
  const { dailySeed, challenge, streak, bestScore, lastCompletedSeed, history } = get();
  if (dailySeed === today && challenge !== null) return;
  set({
    ...INITIAL_STATE,
    dailySeed: today,
    challenge: initialChallenge,
    streak,
    bestScore,
    lastCompletedSeed,
    history,
  });
},
```

**Verify**: `pnpm test -- gameStore` → existing tests pass (some may need
updating if they assert the full reset shape — updating those assertions to
include the carried-over fields is expected, not a STOP).

### Step 4: Display streak and best in the game-over panel

In `WhosThatPokemon.tsx`, extend the existing store destructuring with
`streak`, `bestScore`, `lastCompletedSeed`, `dailySeed`. Compute the display
streak — a chain broken before today shows 0:

```ts
const displayStreak = lastCompletedSeed !== null && lastCompletedSeed >= dailySeed - 1 ? streak : 0;
```

In the game-over panel, under `gameOverSubtitle`, add a row:

```tsx
<p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
  {t('streakLabel', { count: displayStreak })} · {t('bestLabel', { best: bestScore })}
</p>
```

Match the surrounding Tailwind idiom; no `style=` props (CLAUDE.md rule).

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 5: Translations

Add to the `game` namespace in **all six** `messages/*.json`:

- `streakLabel`: en `"Streak: {count} 🔥"`, es `"Racha: {count} 🔥"`,
  fr `"Série : {count} 🔥"`, de `"Serie: {count} 🔥"`,
  it `"Serie: {count} 🔥"`, pt `"Sequência: {count} 🔥"`.
- `bestLabel`: en `"Best: {best}/10"`, es `"Mejor: {best}/10"`,
  fr `"Record : {best}/10"`, de `"Rekord: {best}/10"`,
  it `"Record: {best}/10"`, pt `"Recorde: {best}/10"`.

**Verify**: `pnpm i18n:check` → exit 0 (or, if plan 021 hasn't landed, run
the equivalent manual comparison across the six files).

### Step 6: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

## Test plan

Extend `src/__tests__/presentation/store/gameStore.test.ts` (follow its
existing setup/reset pattern). Drive the store to completion by calling
`guess`/`timeOut` + `startNext` until `score.total === MAX_ROUNDS`. Cases:

1. Completing a challenge sets `streak = 1`, `lastCompletedSeed = dailySeed`,
   appends one history entry, sets `bestScore` to the run's correct count.
2. Completion on the next consecutive day (simulate by setting state with
   `useGameStore.setState({ dailySeed: X, lastCompletedSeed: X - 1, ... })`
   before completing) increments streak.
3. Completion after a gap (`lastCompletedSeed = X - 3`) resets streak to 1.
4. Re-running completion logic on the same day does not double-count
   (`lastCompletedSeed === dailySeed` → no change).
5. `bestScore` only increases (complete with lower score → unchanged).
6. `history` is capped at `HISTORY_LIMIT`.
7. `initOrRestore` on a new day preserves streak/bestScore/history and resets
   score/phase/roundOffset.

Verification: `pnpm test` → all pass including ≥7 new tests.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` exit 0
- [ ] `grep -n "streak" src/presentation/store/gameStore.ts` matches state, completion logic, and initOrRestore carry-over
- [ ] `grep -c "streakLabel" messages/en.json messages/es.json messages/fr.json messages/de.json messages/it.json messages/pt.json` → 1 in each
- [ ] New store tests for cases 1–7 exist and pass
- [ ] Persist key still `'pokemon-game-v2'` (`grep -n "pokemon-game" src/presentation/store/gameStore.ts`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The store excerpts don't match (another change landed in gameStore).
- Existing gameStore tests fail for reasons beyond the reset-shape assertion
  described in Step 3.
- You find completion can be triggered more than once for the same day through
  a path not covered by the `alreadyCounted` guard — report the path.

## Maintenance notes

- Follow-up candidates deliberately deferred: streak in the share text
  (`buildShareText`), a `/game/history` page rendering the `history` array,
  and zod validation of this store's persisted blob (reuse `withValidation`
  from plan 018).
- Timezone caveat: "consecutive day" is UTC-based (matches the challenge
  rotation). A user playing at 23:50 UTC and 00:10 UTC plays two "days" —
  acceptable, same rule as Wordle.
- Reviewer: scrutinize the same-day re-completion guard and that
  `initOrRestore` carries the new fields (the bug this plan most risks
  introducing is wiping streaks at midnight).
