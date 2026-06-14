# Plan 024: Bulk-add favorites to the team builder

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 84b8672..HEAD -- src/presentation/store/teamBuilderStore.ts src/presentation/components/organisms/TeamBuilder.tsx src/presentation/store/favoritesStore.ts messages`
> On any mismatch with the "Current state" excerpts, STOP. Note: plan 018
> touches `teamBuilderStore.ts` (persist storage only) — that diff alone is
> expected and not a STOP; anything touching `addMember`/actions is.

## Status

- **Priority**: P3 (direction)
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 021 (soft — i18n parity check); pairs with 023 but does NOT depend on it
- **Category**: direction
- **Planned at**: commit `84b8672`, 2026-06-12
- **Done at**: 2026-06-12 — branch `advisor/024-bulk-add-favorites-to-team`

## Why this matters

The team builder has share/export (URL out) but no import bridges: a user who
has hearted a dozen Pokémon must still open the picker modal and add team
members one by one. Favorites are the obvious source — the data is already on
the client, `addMember` already enforces the max-6/no-duplicate invariants,
and `fetchPokemonById` already exists as a server action. One button closes
the loop. Selected as a direction feature by the maintainer in the 2026-06-12
advisory session.

## Current state

- `src/presentation/store/teamBuilderStore.ts`:

  ```ts
  export const TEAM_MAX_SIZE = 6;
  export interface TeamMember {
    readonly id: number;
    readonly name: string;
    readonly displayName: string;
    readonly types: readonly PokemonType[];
    readonly sprite: string;
  }
  // ...
  addMember: (member: TeamMember) => {
    const { team } = get();
    if (team.length >= TEAM_MAX_SIZE) return;
    if (team.some((m) => m.id === member.id)) return;
    set({ team: [...team, member] });
  },
  ```

- `src/presentation/components/organisms/TeamBuilder.tsx` — client component;
  already destructures `{ team, removeMember, reorderTeam, clear, addMember }`
  from the store, already has a `sharedMembers` effect that loads a shared
  team. It owns the picker modal (`pickerOpen` state) and computes
  `isFull = team.length >= TEAM_MAX_SIZE`. The `Pokemon` → `TeamMember`
  mapping pattern lives in `src/app/[locale]/team/page.tsx:36-48`:

  ```ts
  sharedMembers.push({
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    types: p.types,
    sprite: p.sprite,
  });
  ```

  Use the same mapping client-side.

- `src/presentation/store/favoritesStore.ts` — `{ ids: number[] }`,
  localStorage-persisted; read via `useFavoritesStore((s) => s.ids)`; gate UI
  on `useHydration()` (see `TopNav.tsx:15-16` for the idiom).

- `fetchPokemonById(id)` server action: `src/application/actions/pokemon.ts:7-11`,
  returns `Promise<Pokemon>`; throws if not found (wraps `getPokemonById`).
  For the async-transition idiom, see `WhosThatPokemon.tsx:21` —
  `useTransition` + `startTransition(async () => ...)`.

- Store tests: `src/__tests__/presentation/store/teamBuilderStore.test.ts`
  (follow its structure for the new action's tests).

- i18n namespace `teamBuilder` exists in all six `messages/*.json`.

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

- `src/presentation/store/teamBuilderStore.ts` (add `addMembers` action)
- `src/presentation/components/organisms/TeamBuilder.tsx` (button + fetch logic)
- `messages/*.json` × 6 (one new key)
- `src/__tests__/presentation/store/teamBuilderStore.test.ts` (tests)

**Out of scope** (do NOT touch):

- `favoritesStore.ts`, `PokemonPickerModal.tsx`, drag-and-drop code.
- No changes to `addMember` itself — `addMembers` composes its rules, it
  doesn't replace them.
- No "replace team" semantics: the button FILLS empty slots, it never clears
  existing members (users who want a fresh start use the existing clear
  button first).

## Git workflow

- Branch: `advisor/024-bulk-add-favorites-to-team`
- Commit: `feat: add favorites-to-team bulk import button`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: `addMembers` store action

In `teamBuilderStore.ts`, add to the interface and implementation:

```ts
/** Adds members in order, skipping duplicates, stopping at TEAM_MAX_SIZE. */
addMembers: (members: TeamMember[]) => void;
// implementation:
addMembers: (members: TeamMember[]) => {
  const { team } = get();
  const next = [...team];
  for (const member of members) {
    if (next.length >= TEAM_MAX_SIZE) break;
    if (next.some((m) => m.id === member.id)) continue;
    next.push(member);
  }
  if (next.length !== team.length) set({ team: next });
},
```

(Single `set` call — one persist write, one render.)

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: "Add favorites" button in TeamBuilder

In `TeamBuilder.tsx`:

- Read favorites: `const favoriteIds = useFavoritesStore((s) => s.ids);` and
  `const hydrated = useHydration();` (import both; check current imports
  first — neither is imported in this file today).
- Add `const [isImporting, startImporting] = useTransition();` (import
  `useTransition` from react).
- Compute eligibility: favorites not already on the team, capped by free
  slots:

  ```ts
  const freeSlots = TEAM_MAX_SIZE - team.length;
  const importableIds = favoriteIds
    .filter((id) => !team.some((m) => m.id === id))
    .slice(0, freeSlots);
  ```

- Handler:

  ```ts
  const handleAddFavorites = () => {
    startImporting(async () => {
      const results = await Promise.allSettled(importableIds.map((id) => fetchPokemonById(id)));
      const members = results
        .filter((r): r is PromiseFulfilledResult<Pokemon> => r.status === 'fulfilled')
        .map(({ value: p }) => ({
          id: p.id,
          name: p.name,
          displayName: p.displayName,
          types: p.types,
          sprite: p.sprite,
        }));
      addMembers(members);
    });
  };
  ```

  Import `fetchPokemonById` from `@/application/actions/pokemon` and the
  `Pokemon` type from `@/domain/entities/Pokemon`. Failed fetches are
  silently skipped (same policy as the shared-team loader in
  `team/page.tsx`).

- Render the button next to the existing picker-opening control (find the
  button that sets `pickerOpen` to true and place this beside it, matching
  its styling classes). Disabled when
  `!hydrated || isImporting || isFull || importableIds.length === 0`. Label:
  `t('addFavorites')`. While `isImporting`, rely on the standard
  `disabled:opacity-50` treatment (match the Next-Round button idiom in
  `WhosThatPokemon.tsx`).

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 3: Translation key

Add `teamBuilder.addFavorites` to all six locale files:
en "Add favorites", es "Añadir favoritos", fr "Ajouter les favoris",
de "Favoriten hinzufügen", it "Aggiungi preferiti", pt "Adicionar favoritos".

**Verify**: `pnpm i18n:check` → exit 0 (or manual six-file comparison).

### Step 4: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

## Test plan

Extend `src/__tests__/presentation/store/teamBuilderStore.test.ts` with
`addMembers` cases (build `TeamMember` fixtures like the existing tests do):

1. Adds multiple members to an empty team in order.
2. Skips members whose id is already on the team.
3. Stops at `TEAM_MAX_SIZE` (pass 8 members to a team of 0 → length 6).
4. Mixed: team of 4 + list containing 1 duplicate and 3 new → length 6,
   duplicate not present twice.
5. No-op call (all duplicates) leaves the team content unchanged.

Manual check via `pnpm dev`: heart 3 Pokémon → `/en/team` → "Add favorites" →
3 slots fill; press again → button disabled (nothing importable).

Verification: `pnpm test` → all pass including ≥5 new tests.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` exit 0
- [ ] `grep -n "addMembers" src/presentation/store/teamBuilderStore.ts` → interface + implementation
- [ ] `grep -n "addFavorites" src/presentation/components/organisms/TeamBuilder.tsx` → button present
- [ ] All six locale files contain `teamBuilder.addFavorites` (`pnpm i18n:check` green if available)
- [ ] ≥5 new store tests pass
- [ ] Manual check performed and reported
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `TeamBuilder.tsx` no longer matches the excerpt (e.g. picker control moved
  or store destructuring changed beyond plan 018's storage line).
- `fetchPokemonById` signature changed or now returns null instead of
  throwing.
- The button placement requires restructuring TeamBuilder's layout beyond
  inserting one sibling element.

## Maintenance notes

- If plan 023 (favorites page) landed, a future enhancement can link from the
  favorites page to `/team` — deliberately not done here to keep the plans
  independent.
- `addMembers` is also the natural API for any future "import team from
  file/URL" features — keep its skip-duplicates/stop-at-max contract stable.
- Reviewer: scrutinize that the button never clears existing members and that
  the disabled logic covers the pre-hydration window (otherwise the button
  flashes enabled with 0 favorites).
