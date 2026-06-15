# Plan 031: Restructure /game into a games hub (Who's That + Type Quiz)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat bac0ec6..HEAD -- "src/app/[locale]/game" src/presentation/lib/gameShare.ts src/presentation/components/organisms/SharedGameResult.tsx src/presentation/components/organisms/TopNav.tsx messages`
> Any change to the game routes, `gameShare.ts`, or `SharedGameResult.tsx`
> beyond the excerpts quoted below IS a STOP — re-read those files before
> proceeding.

## Status

- **Priority**: P3 (direction)
- **Effort**: S–M
- **Risk**: LOW–MED (route move + share-link backward-compat is the only sharp edge)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `bac0ec6`, 2026-06-14

## Why this matters

The game section now ships **two** modes — "Who's That Pokémon?" at `/game`
and the type-matchup quiz at `/game/type-quiz` (plan 030). But `/game` is
still literally the silhouette game with a single CTA link bolted to the
bottom linking to the quiz. That does not scale to a third mode and it buries
the quiz below the fold. **Design decision (made by the advisor, not open for
re-deliberation): `/game` becomes a games hub (a landing page listing modes),
and the silhouette game moves to its own route `/game/whos-that`.** The hub is
a thin presentational page driven by a small static list of modes — no new
state, no store, no API.

## Current state

- `src/app/[locale]/game/page.tsx` — Server Component. `revalidate = 3600`.
  It: (a) parses share params (`?result/total/day`) via
  `parseGameShareParams` and, if present, renders `<SharedGameResult>`;
  otherwise (b) fetches the daily challenge (`getDailySeed()` +
  `getGameChallenge(repository, seed)`) and renders `<WhosThatPokemon
initialChallenge={challenge} />` inside a `max-w-sm` column, plus a CTA
  `<Link href="/game/type-quiz">` at the bottom. Read the file in full before
  editing.

- `src/app/[locale]/game/type-quiz/page.tsx` — the second mode (plan 030).
  Self-contained, no repository.

- `src/presentation/lib/gameShare.ts` — builds the share URL and exports
  `parseGameShareParams`. **Read it: find where the shared path string is
  constructed** (it currently targets `/game`). The share-link backward-compat
  in Step 3 hinges on this.

- `src/presentation/components/organisms/SharedGameResult.tsx` — line ~52 has a
  back-link `href={`/${locale}/game`}` ("play again"). This must point at the
  silhouette game's new route after the move.

- `src/presentation/components/organisms/TopNav.tsx` — tab `{ href: '/game',
label: t('game'), icon: Gamepad2 }`. The hub keeps this href; only the label
  may change (Step 5).

- i18n: namespace `game` in all six `messages/*.json`; parity enforced by
  `pnpm i18n:check`. The `Link` to use is `@/i18n/navigation` (locale-aware) —
  see `TopNav.tsx` / the existing game page imports.

## Commands you will need

| Purpose   | Command           | Expected on success |
| --------- | ----------------- | ------------------- |
| Typecheck | `pnpm typecheck`  | exit 0              |
| Tests     | `pnpm test`       | all pass            |
| Lint      | `pnpm lint`       | exit 0              |
| i18n      | `pnpm i18n:check` | exit 0              |
| Build     | `pnpm build`      | exit 0              |
| Dev       | `pnpm dev`        | manual smoke        |

## Scope

**In scope:**

- `src/app/[locale]/game/whos-that/page.tsx` (CREATE — the moved silhouette game)
- `src/app/[locale]/game/whos-that/loading.tsx` (CREATE — move/copy the existing `game/loading.tsx`)
- `src/app/[locale]/game/page.tsx` (REWRITE — becomes the hub; keeps share-link backward-compat)
- `src/presentation/lib/gameShare.ts` (MODIFY — share URL targets `/game/whos-that`)
- `src/presentation/components/organisms/SharedGameResult.tsx` (MODIFY — back-link → `/game/whos-that`)
- `src/presentation/components/organisms/GameModeCard.tsx` (CREATE — small presentational card for the hub; or inline if trivial)
- `src/presentation/components/organisms/TopNav.tsx` (MODIFY — label only, optional)
- `messages/*.json` (all six) — new `gamesHub` namespace
- Tests for `gameShare.ts` (UPDATE the existing `gameShare.test.ts` for the new path)

**Out of scope (do NOT touch):**

- `gameStore.ts`, `typeQuizStore.ts`, their persisted localStorage keys, and
  the game-play organisms (`WhosThatPokemon.tsx`, `TypeQuiz.tsx`) — this is a
  routing/landing change only, no gameplay logic changes.
- The type-quiz page beyond a back-link sanity check.

## Git workflow

- Branch: `advisor/031-games-hub`
- Conventional commits, e.g. `feat: add games hub landing at /game`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Move the silhouette game to `/game/whos-that`

Create `src/app/[locale]/game/whos-that/page.tsx` by moving the **non-share**
branch of the current `game/page.tsx` there: `generateMetadata` (namespace
`game`), `revalidate = 3600`, fetch the daily challenge, render the header +
`<WhosThatPokemon initialChallenge={challenge} />` in the `max-w-sm` column.
**Remove** the type-quiz CTA link from this page (it belongs on the hub now).
Move `game/loading.tsx` to `game/whos-that/loading.tsx` (the hub loads
instantly and needs no skeleton; if you prefer, leave a trivial hub loading
file).

**Verify**: `pnpm dev` → `/en/game/whos-that` plays a full game.

### Step 2: Rebuild `/game` as the hub (with share-link backward-compat)

Rewrite `src/app/[locale]/game/page.tsx`:

1. **Keep the share branch first.** Existing share URLs in the wild point at
   `/game?result=…&total=…&day=…`. Parse them with `parseGameShareParams` and,
   if present, render `<SharedGameResult>` exactly as today. This preserves
   every link already shared. (Do not redirect — render in place.)
2. Otherwise render the **hub**: a header (from new `gamesHub` namespace) and a
   list of mode cards built from a local static array:

   ```tsx
   const MODES = [
     { href: '/game/whos-that', key: 'whosThat', icon: HelpCircle },
     { href: '/game/type-quiz', key: 'typeQuiz', icon: Swords },
   ] as const;
   ```

   Render each via `<GameModeCard>` (Step 3) using `t('modes.<key>.title')` /
   `t('modes.<key>.blurb')`. Use the locale-aware `Link` from
   `@/i18n/navigation`. Keep the page a Server Component (no `"use client"`).

This page no longer needs the repository or `getGameChallenge` in the hub
branch — only the share branch is interactive-free server render.

### Step 3: `GameModeCard` presentational component

Create `src/presentation/components/organisms/GameModeCard.tsx` (no
`"use client"` — it is a `Link` wrapper). Mirror the existing CTA link card
styling that is currently at the bottom of `game/page.tsx` (rounded border,
hover states, light/dark variants) so the visual language is unchanged. Props:
`href`, `title`, `blurb`, `Icon`. Follow the project's design-quality rules —
give the cards real hierarchy (title scale contrast, icon, hover/active
states), not a flat uniform grid.

### Step 4: Fix share-link targets

- `src/presentation/lib/gameShare.ts` — change the constructed share path from
  `/game` to `/game/whos-that` so **new** shares deep-link to the game, not the
  hub. (Share params still also resolve on `/game` via Step 2's backward-compat
  branch — both work.) Update the existing `gameShare.test.ts` assertion for
  the new path.
- `src/presentation/components/organisms/SharedGameResult.tsx` line ~52 —
  change the back-link from `/${locale}/game` to `/${locale}/game/whos-that`.

**Verify**: `pnpm test` → `gameShare` tests pass with the new path.

### Step 5: i18n + nav label

Add namespace `gamesHub` to **all six** `messages/*.json`:

| Key                    | en value                                             |
| ---------------------- | ---------------------------------------------------- |
| `heading`              | "Games"                                              |
| `subtitle`             | "Daily Pokémon challenges — a new one every day"     |
| `modes.whosThat.title` | "Who's That Pokémon?"                                |
| `modes.whosThat.blurb` | "Name the Pokémon from its silhouette"               |
| `modes.typeQuiz.title` | "Type Quiz"                                          |
| `modes.typeQuiz.blurb` | "Pick the super-effective type before time runs out" |

Translate all values for es/fr/de/it/pt. Optionally change the `nav.game`
label to "Games" in all six files (and keep the `TopNav` href `/game`).

**Verify**: `pnpm i18n:check` → exit 0.

### Step 6: Full gate

**Verify**:
`pnpm format && pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build`
→ all exit 0. Then `pnpm dev`:

- `/en/game` shows the hub with two mode cards.
- `/en/game/whos-that` plays the silhouette game; finishing it and sharing
  produces a `/game/whos-that?result=…` link that renders the result.
- An **old-style** `/en/game?result=5&total=10&day=20000` link still renders
  `SharedGameResult` (backward-compat).
- `/en/game/type-quiz` still works.

## Test plan

- Update `gameShare.test.ts` for the `/game/whos-that` share path.
- If plan 025's E2E suite exists, update the game journey: navigate `/en/game`
  → assert two mode links → click "Who's That" → assert the game loads.
- Manual: the four URL cases in Step 6.

## Done criteria

- [ ] `/game` is a hub listing both modes; `/game/whos-that` is the silhouette game
- [ ] Old `/game?result=…` share links still render results (backward-compat)
- [ ] New shares and the "play again" back-link target `/game/whos-that`
- [ ] `pnpm i18n:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build` all exit 0
- [ ] No gameplay/store files modified (`git status`)
- [ ] `plans/README.md` status row for 031 updated

## STOP conditions

Stop and report (do not improvise) if:

- `gameShare.ts` does not construct the share path as a simple `/game…` string
  (e.g. it is built somewhere else, or uses an absolute origin) — the
  backward-compat reasoning needs revisiting.
- `grep -rn "/game\"" src` (and `'/game'`) finds deep links to `/game` that
  assume it renders the silhouette game (other than the share/back-link cases
  handled here).
- The existing `game/page.tsx` differs materially from the Current-state
  description (another plan changed it first).

## Maintenance notes

- The hub is intentionally static (a `MODES` array). Adding a third game =
  one array entry + one `gamesHub.modes.*` key set in six locales.
- Two share entry points now resolve (`/game` backward-compat + `/game/whos-that`).
  A future cleanup could 301-redirect the bare `/game?result=…` form to
  `/game/whos-that`, but only after analytics show the old links have aged out.
