# Plan 023: Add a standalone /favorites collection page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 84b8672..HEAD -- src/presentation/store/favoritesStore.ts src/presentation/components/organisms/TopNav.tsx src/presentation/components/molecules/PokemonCard.tsx src/presentation/queries messages "src/app/[locale]"`
> On any mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P3 (direction)
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 021 (soft — i18n parity check catches a forgotten locale)
- **Category**: direction
- **Planned at**: commit `84b8672`, 2026-06-12
- **Done at**: 2026-06-12 — all gates green, `/[locale]/favorites` in build output

## Why this matters

Favorites exist (heart button, localStorage persistence, a favorites-only
filter inside the main grid, a badge count in the nav) but have no home of
their own — unlike teams (`/team`) and comparisons (`/compare`), there is no
page a user can visit to see their collection. This was selected as a
direction feature by the maintainer in the 2026-06-12 advisory session. The
page is pure presentation work: no new repository methods, no new server
actions — favorites IDs live client-side, and `fetchPokemonById` (existing
server action) + TanStack Query fetch the rest.

## Current state

- `src/presentation/store/favoritesStore.ts` — `{ ids: number[]; toggle(id);
isFavorite(id); count() }`, persisted to localStorage under
  `'pokemon-favorites'`. **Client-only data**: the server cannot read it
  (localStorage, not cookies), so the page body must be a Client Component
  that waits for hydration. Use the existing `useHydration` hook
  (`src/presentation/hooks/useHydration.ts`) exactly as `TopNav.tsx:15-16`
  and `PokemonCard.tsx` do.

- `src/presentation/components/molecules/PokemonCard.tsx` — props:

  ```ts
  type PokemonCardProps = {
    pokemon: PokemonSummary; // { id, name, displayName, types, sprite }
    index?: number;
    onClick?: () => void;
    animate?: boolean;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
  };
  ```

- Existing query hooks: `src/presentation/queries/pokemonQueries.ts` exports
  `usePokemonById(id)` (single id). For N favorite ids use TanStack's
  `useQueries` with the same `queryKey`/`queryFn`/staleTime pattern:

  ```ts
  // pattern to follow, from pokemonQueries.ts:
  useQuery({
    queryKey: pokemonDetailQueryKey(id ?? 0),
    queryFn: () => fetchPokemonById(id!),
    enabled: id !== null && id > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  ```

  `pokemonDetailQueryKey` comes from `@/presentation/lib/queryKeys`;
  `fetchPokemonById` from `@/application/actions/pokemon` (returns the full
  `Pokemon` entity — check `src/domain/entities/Pokemon.ts`: if `Pokemon` is
  not structurally assignable to `PokemonSummary`, map explicitly to
  `{ id, name, displayName, types, sprite }`).

- `src/presentation/components/organisms/TopNav.tsx` — tabs array (lines
  18–28); the Pokédex tab currently carries the favorites badge:

  ```ts
  const tabs = [
    {
      href: '/' as const,
      label: t('pokedex'),
      icon: LayoutGrid,
      badge: hydrated && favCount > 0 ? favCount : null,
    },
    { href: '/team' as const, label: t('teamBuilder'), icon: Users, badge: null },
    { href: '/compare' as const, label: t('compare'), icon: Scale, badge: null },
    { href: '/game' as const, label: t('game'), icon: Gamepad2, badge: null },
  ];
  ```

- Routing: `src/i18n/routing.ts` is a plain `defineRouting({ locales, defaultLocale })`
  with **no `pathnames` map** — adding a page directory is sufficient; no
  routing config change needed. The `'/team' as const` hrefs are plain
  strings, so `'/favorites' as const` works identically.

- Page exemplar: `src/app/[locale]/game/page.tsx` — server component with
  `generateMetadata` via `getTranslations({ locale, namespace })`, header
  block with `font-display` h1 + subtitle, content in a centered container.
  Match its structure and Tailwind classes.

- i18n `favorites` namespace already has: `add`, `remove`, `filterLabel`,
  `empty` ("No favorites yet"), `emptyHint` ("Tap the heart on any Pokémon
  card to save it here") — **reuse `empty`/`emptyHint` for the empty state.**
  Missing: a page heading/subtitle key and a nav label (see Step 4).

- CLAUDE.md rules that apply: Server Component by default, `"use client"`
  only where state/effects exist; no `style=` props (except the CSS-var
  bridge already used by PokemonCard); JSX outside try/catch; type colors via
  `TYPE_CLASSES` only.

## Commands you will need

| Purpose | Command           | Expected on success         |
| ------- | ----------------- | --------------------------- |
| Types   | `pnpm typecheck`  | exit 0                      |
| Tests   | `pnpm test`       | all pass                    |
| Lint    | `pnpm lint`       | exit 0                      |
| i18n    | `pnpm i18n:check` | exit 0 (if plan 021 landed) |
| Build   | `pnpm build`      | exit 0                      |
| Dev run | `pnpm dev`        | page at `/en/favorites`     |

## Scope

**In scope** (create/modify only these):

- `src/app/[locale]/favorites/page.tsx` (create — server shell)
- `src/presentation/components/organisms/FavoritesGrid.tsx` (create — client)
- `src/presentation/components/organisms/TopNav.tsx` (add tab, move badge)
- `messages/*.json` × 6 (new keys)
- Optional: `src/app/[locale]/favorites/error.tsx` (copy the pattern from
  `src/app/[locale]/team/error.tsx`)

**Out of scope** (do NOT touch):

- `favoritesStore.ts` — no store changes needed.
- `PokemonGrid.tsx` and its `showFavoritesOnly` filter — keep the in-grid
  filter working as is; this page complements it.
- Bulk actions (clear-all, select-for-team) — plan 024 covers the
  team bridge; don't build buttons here.

## Git workflow

- Branch: `advisor/023-favorites-page`
- Commit: `feat: add standalone favorites collection page`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: FavoritesGrid client organism

Create `src/presentation/components/organisms/FavoritesGrid.tsx`:

- `'use client'`.
- Read `ids` from `useFavoritesStore`, `toggle` for un-favoriting; gate on
  `useHydration()` — before hydration render a skeleton grid (copy the
  pulse-skeleton idiom from `WhosThatPokemon.tsx`'s loading block or
  `PokemonGrid`'s skeletons).
- Fetch with `useQueries` (from `@tanstack/react-query`):

  ```ts
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: pokemonDetailQueryKey(id),
      queryFn: () => fetchPokemonById(id),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });
  ```

- Render states: empty ids → centered empty state using `t('empty')` +
  `t('emptyHint')` from the `favorites` namespace; loading → skeletons;
  loaded → responsive grid of `PokemonCard` (match `PokemonGrid`'s grid
  classes), passing `isFavorite` (true), `onToggleFavorite={toggle}`, and the
  summary-shaped pokemon. Individual failed queries: skip the card (render
  nothing for it) — favorites with transient fetch errors shouldn't break the
  page.
- Un-favoriting on this page removes the card (ids shrink reactively) —
  that's the desired behavior, no confirmation needed.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Server page shell

Create `src/app/[locale]/favorites/page.tsx` modeled on
`src/app/[locale]/game/page.tsx`: `generateMetadata` using the new
`favorites.heading` key; header with h1 (`font-display ...` — copy the game
page's classes) + subtitle; `<FavoritesGrid />` in a `max-w-7xl` container
(match the home/team pages' container, not the game page's `max-w-sm`).

**Verify**: `pnpm typecheck && pnpm lint` → exit 0; `pnpm dev` then open
`http://localhost:3000/en/favorites` → page renders (empty state if no
favorites in your browser).

### Step 3: Nav tab

In `TopNav.tsx`, add a favorites tab and move the badge from the Pokédex tab
to it:

```ts
{ href: '/' as const, label: t('pokedex'), icon: LayoutGrid, badge: null },
// ...existing tabs...
{ href: '/favorites' as const, label: t('favorites'), icon: Heart,
  badge: hydrated && favCount > 0 ? favCount : null },
```

Import `Heart` from `lucide-react`. Both the desktop tablist and the mobile
nav render from the same `tabs` array — verify the mobile bar still fits 5
tabs at 320 px width (labels may truncate; if the mobile bar overflows, keep
the favorites tab but shorten labels via the existing responsive classes —
if that fails, STOP and report).

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 4: Translations

Add to **all six** `messages/*.json`:

- `nav.favorites`: en "Favorites", es "Favoritos", fr "Favoris",
  de "Favoriten", it "Preferiti", pt "Favoritos".
- `favorites.heading`: en "Your Favorites", es "Tus favoritos",
  fr "Vos favoris", de "Deine Favoriten", it "I tuoi preferiti",
  pt "Seus favoritos".
- `favorites.subtitle`: en "Every Pokémon you've hearted, in one place."
  (translate analogously: es "Todos los Pokémon que has marcado, en un solo
  lugar.", fr "Tous les Pokémon que vous avez aimés, au même endroit.",
  de "Alle Pokémon mit Herz, an einem Ort.", it "Tutti i Pokémon che hai
  salvato, in un unico posto.", pt "Todos os Pokémon que você favoritou, em
  um só lugar.")

**Verify**: `pnpm i18n:check` → exit 0 (or manual six-file comparison).

### Step 5: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all
exit 0. The build output must list `/[locale]/favorites` as a route.

## Test plan

- The repo's policy excludes `presentation/` from coverage thresholds, and
  there are currently no component tests — do not introduce a component-test
  harness in this plan.
- Required: manual verification via `pnpm dev` —
  1. `/en/favorites` with no favorites → empty state with hint text.
  2. Heart two Pokémon on the home grid → nav badge shows 2 → favorites page
     shows both cards.
  3. Un-heart one on the favorites page → card disappears, badge decrements.
- `pnpm test` must stay green (no existing tests touch these files).

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` exit 0
- [ ] Build route list includes `/[locale]/favorites`
- [ ] `pnpm i18n:check` passes (if available); otherwise all six locale files contain `nav.favorites`, `favorites.heading`, `favorites.subtitle`
- [ ] `grep -n "'/favorites'" src/presentation/components/organisms/TopNav.tsx` → 1 match
- [ ] Manual checks 1–3 from the Test plan performed and reported
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `Pokemon` is not assignable to `PokemonSummary` AND the field mapping is
  ambiguous (e.g. `sprite` missing on `Pokemon`) — report the actual entity
  shape instead of guessing.
- The mobile nav cannot accommodate a 5th tab without layout breakage.
- You find yourself wanting to add server-side prefetching of favorites — you
  can't (localStorage is client-only); the hydration-gated client fetch IS the
  design.

## Maintenance notes

- Plan 024 (bulk-add favorites → team) will likely link from this page later;
  it deliberately does not depend on this plan.
- If favorites ever move to cookie persistence (to enable SSR), this page can
  become a server component with HydrationBoundary like `/team` — revisit
  then.
- Reviewer: scrutinize hydration gating (no hydration-mismatch warnings in
  the dev console) and that the badge moved off the Pokédex tab.
