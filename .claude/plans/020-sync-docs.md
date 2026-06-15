# Plan 020: Fix factual drift in CLAUDE.md and README.md

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 84b8672..HEAD -- README.md CLAUDE.md src/presentation/store/gameStore.ts`
> If README.md or CLAUDE.md changed since this plan was written, re-verify
> each claim below against the live files before editing.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `84b8672`, 2026-06-12

## Why this matters

CLAUDE.md is the instruction file agents load on every session, and README.md
is the public face of the repo. Both contain claims that are now false. Wrong
docs are worse than missing docs: an agent reading CLAUDE.md plans for
Next.js 15 routing without `[locale]`, and a reader of the README believes
there is Playwright E2E coverage (there is none) and that the game timer is
5 seconds (it is 30). Each fix below was verified against the code at commit
`84b8672` — this plan is a checklist of verified corrections, not a rewrite.

## Current state — verified wrong claims

In **CLAUDE.md**:

1. Line 5: `**Next.js 15** (App Router)` — `package.json` has `"next": "16.2.9"`.
2. "Folder Structure" section shows routes without the locale segment:

   ```
   ├── app/                  # Next.js App Router (MUST stay here — Next.js constraint)
   │   ├── layout.tsx
   │   ├── page.tsx
   │   └── pokemon/[id]/page.tsx
   ```

   Actual routes live under `src/app/[locale]/` (next-intl):
   `[locale]/page.tsx`, `[locale]/pokemon/[id]/`, `[locale]/compare/`,
   `[locale]/game/`, `[locale]/team/`, `[locale]/tools/type-calculator/`,
   plus `app/api/og/[id]/`.

In **README.md**:

3. Line 48: `Silhouette-guessing game with a **5-second countdown timer**` —
   `TIMER_SECONDS = 30` in `src/presentation/store/gameStore.ts:6`.
4. Line 51: `progress persisted via Zustand (cookies)` — `gameStore` persists
   to **localStorage** (persist name `'pokemon-game-v2'`, no cookieStorage).
5. Line 132: `| E2E | Playwright | Critical user flow coverage |` — there is
   no playwright config and no E2E test in the repo. (`@playwright/test` sits
   unused in devDependencies.)
6. Line 142: `Node.js 20+` — CI (`.github/workflows/ci.yml`) pins Node 22 in
   every job.
7. Line 224 (Design decisions section): "The `teamBuilderStore` and
   `gameStore` use a custom `cookieStorage` adapter" — only `teamBuilderStore`
   and `compareStore` use cookieStorage; `gameStore` uses localStorage with
   `skipHydration: true`.
8. Line 241: `src/presentation/store/gameStore.ts | Daily game state with cookie persistence` — same error.
9. The Features section has no entry for the **Type Effectiveness Calculator**
   (`src/app/[locale]/tools/type-calculator/page.tsx`, complete shipped
   feature), and the Team Builder / Game sections don't mention **sharing via
   URL** (`buildTeamUrl` in `src/presentation/lib/teamShare.ts`,
   `buildShareUrl` in `src/presentation/lib/gameShare.ts`, Web Share API in
   `GameShareButton.tsx`).

Verified NOT wrong (do not "fix"): README's architecture diagram (lines
~62–87) shows only the `src/` layers, no route paths — it is accurate;
README line 5 already says Next.js 16; the compare-page "URL via search
params" claim is correct (`/compare?a=&b=&c=`).

## Commands you will need

| Purpose      | Command             | Expected on success |
| ------------ | ------------------- | ------------------- |
| Format check | `pnpm format:check` | exit 0              |
| Sanity grep  | see Done criteria   | per-item            |

## Scope

**In scope**: `README.md`, `CLAUDE.md`.

**Out of scope** (do NOT touch): any file under `src/`; `package.json`;
removing `@playwright/test` from devDependencies (an E2E suite is a separately
tracked decision — see plans/README.md "deferred" notes; the README just must
stop claiming coverage that doesn't exist).

## Git workflow

- Branch: `advisor/020-sync-docs`
- Commit: `docs: fix stale claims in README and CLAUDE.md`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: CLAUDE.md

- Change `**Next.js 15**` → `**Next.js 16**` (line 5).
- Update the Folder Structure block to reflect reality:

  ```
  ├── app/                  # Next.js App Router (MUST stay here — Next.js constraint)
  │   ├── [locale]/         # next-intl locale segment wraps all pages
  │   │   ├── layout.tsx
  │   │   ├── page.tsx
  │   │   ├── pokemon/[id]/page.tsx
  │   │   ├── compare/  game/  team/
  │   │   └── tools/type-calculator/
  │   └── api/og/[id]/      # OG image route handler
  ```

  (Match the existing ASCII style of the file; the exact box-drawing layout
  may differ as long as `[locale]` and `api/og` appear.)

- While in the SSR example block: if it references `app/page.tsx` or
  `app/pokemon/[id]/page.tsx` paths in comments, prefix them with `[locale]/`.
  Do not change the code patterns themselves.

**Verify**: `grep -n "Next.js 15" CLAUDE.md` → no matches;
`grep -n "locale" CLAUDE.md` → at least one match in the folder structure.

### Step 2: README.md corrections

- Line 48: `5-second` → `30-second`.
- Line 51: `progress persisted via Zustand (cookies)` → `progress persisted via Zustand (localStorage)`.
- Line 132: delete the E2E/Playwright row from the tech table.
- Line 142: `Node.js 20+` → `Node.js 22+` (matches CI).
- Line ~224: reword so cookie persistence is attributed to `teamBuilderStore`
  and `compareStore`, and state that `gameStore` uses localStorage (it is
  client-only with `skipHydration`, so server hydration isn't needed for it).
  Keep the paragraph's rationale intact — only the store names are wrong.
- Line ~241: `Daily game state with cookie persistence` → `Daily game state with localStorage persistence`.

**Verify**: `grep -n "5-second\|Node.js 20\|Playwright" README.md` → no matches.

### Step 3: README.md additions

- Add a feature subsection after "Who's That Pokémon?":

  ```markdown
  ### Type Effectiveness Calculator

  - Standalone tool at `/tools/type-calculator` — pick any one or two types
  - Groups attacking types by damage multiplier (×4, ×2, ×1, ½, ¼, ×0)
  ```

- In the Team Builder section, add a bullet: team sharing via URL
  (`/team?team=1,4,7,...`). In the game section, add a bullet: result sharing
  via Web Share API / clipboard with a shareable URL.

  (Adjust wording freely; the facts to convey are fixed.)

**Verify**: `grep -n "Type Effectiveness Calculator" README.md` → 1 match;
`pnpm format:check` → exit 0 (run `pnpm format` on the two files if Prettier
complains).

## Test plan

No code changes — the greps in each step are the verification. Run
`pnpm format:check` at the end since CI gates on it.

## Done criteria

ALL must hold:

- [ ] `grep -c "Next.js 15" CLAUDE.md` → 0
- [ ] `grep -c "5-second" README.md` → 0
- [ ] `grep -c "Node.js 20" README.md` → 0
- [ ] `grep -ci "playwright" README.md` → 0
- [ ] `grep -c "Type Effectiveness Calculator" README.md` → 1
- [ ] `grep -n "gameStore" README.md` lines no longer mention cookies
- [ ] `pnpm format:check` exits 0
- [ ] Only README.md and CLAUDE.md modified (`git status`), plus `plans/README.md` row update

## STOP conditions

- A "verified wrong claim" above turns out to be already fixed (file drifted):
  skip that item, note it in your report, continue with the rest.
- You find yourself wanting to restructure sections or rewrite prose beyond
  the listed corrections — that's out of scope; report the temptation instead.

## Maintenance notes

- If an E2E suite is ever added (deferred decision), restore the tech-table
  row then — and only then.
- Plan 022 changes game persistence details; if it lands first and alters
  storage, re-verify items 4/7/8 against the live store before editing.
- Reviewer: diff should be small and purely textual; any `src/` change is a
  red flag.
