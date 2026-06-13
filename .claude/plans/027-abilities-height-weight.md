# Plan 027: Show abilities, height, and weight on the Pokémon detail page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 56438cc..HEAD -- src/domain/entities/Pokemon.ts src/domain/ports/PokemonRepository.ts src/infrastructure/pokeapi/types.ts src/infrastructure/pokeapi/mappers.ts src/infrastructure/pokeapi/PokeApiRepository.ts "src/app/[locale]/pokemon/[id]/page.tsx" messages`
> On any mismatch with the "Current state" excerpts, STOP.

## Status: done

- **Priority**: P3 (direction)
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none. Conflicts with 028 (both touch `types.ts`,
  `mappers.ts`, the port, and the detail page) — run 027 and 028
  sequentially, never in parallel.
- **Category**: direction
- **Planned at**: commit `56438cc`, 2026-06-12

## Why this matters

The detail page shows stats, evolutions, species data, matchups, and a full
move learnset — but not abilities, height, or weight, the three most expected
Pokédex facts after base stats. Height and weight are already present in the
`/pokemon/{id}` response the app fetches (currently discarded by the mapper).
Ability names and short effect text need one batched, cached fetch per ability
(2–3 per Pokémon), exactly like the existing move-detail batching. Selected as
a direction feature by the maintainer in the 2026-06-12 advisory session.

## Current state

- `src/domain/entities/Pokemon.ts:64` — the entity to extend:

  ```ts
  export interface Pokemon extends PokemonSummary {
    readonly artwork: string;
    readonly shinyArtwork: string;
    readonly stats: PokemonStats;
    readonly evolutionChainId: number;
  }
  ```

- `src/infrastructure/pokeapi/types.ts` — `PokeApiPokemon` currently has
  `id, name, sprites, stats, types, species, moves?` — **no** `abilities`,
  `height`, `weight` fields (they exist in the real API response but are not
  typed, so they're dropped).

- `src/infrastructure/pokeapi/mappers.ts` — `mapPokemon(raw, evolutionChainId)`
  spreads `mapPokemonSummary(raw)` and adds artwork/stats/chainId.
  `LOCALE_TO_POKEAPI_LANG` (top of file) maps app locales to PokeAPI language
  codes. `mapMove` shows the existing localized-name lookup pattern:

  ```ts
  const enName = raw.names.find((n) => n.language.name === 'en')?.name;
  ```

- `src/infrastructure/pokeapi/PokeApiRepository.ts` — `findMoveLearnset`
  (line 212) shows the batch+cache pattern to copy: collect unique ids, then

  ```ts
  const moveDetails = await Promise.all(
    uniqueMoveIds.map((moveId) =>
      getOrFetch(this.moveCache, this.moveInFlight, moveId, () =>
        fetchJson<PokeApiMove>(`${BASE_URL}/move/${moveId}`),
  ```

  The class has per-resource `TtlCache` + in-flight maps (`moveCache`,
  `moveInFlight`, `chainCache`, …) — find their declarations at the top of
  the class and add ability equivalents in the same style.

- `src/domain/ports/PokemonRepository.ts` — the port interface; existing
  locale-aware method for reference:
  `findSpeciesData(id: number, locale: string): Promise<PokemonSpecies>`.

- `src/application/usecases/` — one-function use case files; exemplar
  `getSpeciesData.ts`:

  ```ts
  export async function getSpeciesData(
    repository: PokemonRepository,
    id: number,
    locale: string,
  ): Promise<PokemonSpecies> {
    return repository.findSpeciesData(id, locale);
  }
  ```

- `src/app/[locale]/pokemon/[id]/page.tsx` — Server Component; fetches via
  `Promise.all([getPokemonById, getSpeciesData, getMoveLearnset])` inside a
  try/catch with `unstable_rethrow`, JSX outside the try/catch. The 2-column
  grid contains `SpeciesInfoSection`, base stats, `EvolutionChainView`,
  `TypeMatchupTable`, `MoveLearnsetTable`.

- `src/presentation/components/organisms/SpeciesInfoSection.tsx` — the UI
  exemplar to copy for the new section: a `<section>` with this exact
  heading/card style, an `InfoItem` helper rendering `<dt>/<dd>`:

  ```tsx
  <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-stone-700 dark:bg-stone-900">
    <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400">
  ```

  Note its label-passing convention: the server page builds a `labels` object
  from `getTranslations('species')` and passes it as a prop — do the same.

- PokeAPI facts (the executor must not guess these):
  - `/pokemon/{id}` includes `height` (decimetres), `weight` (hectograms),
    and `abilities: Array<{ ability: { name, url }, is_hidden: boolean, slot: number }>`.
  - `/ability/{name}` includes `names: Array<{ name, language: { name } }>`
    and `flavor_text_entries: Array<{ flavor_text, language: { name }, version_group }>`
    (short human text; use the **last** entry for the requested language,
    falling back to English — same fallback style as `mapPokemonSpecies`).

- i18n: namespaces live in `messages/{en,es,fr,de,it,pt}.json`; CI enforces
  key parity (`pnpm i18n:check`).

- Tests: MSW intercepts HTTP in `src/__tests__/infrastructure/` (see
  `PokeApiRepository.test.ts` and `mappers.test.ts` for fixtures/handlers
  style); use cases tested against a mocked repository in
  `src/__tests__/application/` (see `getSpeciesData.test.ts`).

## Commands you will need

| Purpose   | Command              | Expected on success   |
| --------- | -------------------- | --------------------- |
| Install   | `pnpm install`       | exit 0                |
| Typecheck | `pnpm typecheck`     | exit 0                |
| Tests     | `pnpm test`          | all pass              |
| Coverage  | `pnpm test:coverage` | ≥80% domain/app/infra |
| Lint      | `pnpm lint`          | exit 0                |
| i18n      | `pnpm i18n:check`    | exit 0                |
| Build     | `pnpm build`         | exit 0                |

## Scope

**In scope**:

- `src/domain/entities/Pokemon.ts` — extend `Pokemon`, add helpers
- `src/domain/entities/Ability.ts` (create)
- `src/domain/ports/PokemonRepository.ts` — add `findAbilities`
- `src/infrastructure/pokeapi/types.ts` — extend `PokeApiPokemon`, add `PokeApiAbility`
- `src/infrastructure/pokeapi/mappers.ts` — extend `mapPokemon`, add `mapAbility`
- `src/infrastructure/pokeapi/PokeApiRepository.ts` — implement `findAbilities`
- `src/application/usecases/getAbilities.ts` (create)
- `src/app/[locale]/pokemon/[id]/page.tsx` — fetch + render
- `src/presentation/components/organisms/PokemonAboutSection.tsx` (create)
- `messages/*.json` (all six) — new `about` namespace
- Tests: `src/__tests__/domain/Pokemon.test.ts` (extend),
  `src/__tests__/infrastructure/mappers.test.ts` (extend),
  `src/__tests__/infrastructure/PokeApiRepository.test.ts` (extend),
  `src/__tests__/application/getAbilities.test.ts` (create)
- Any MSW handler/fixture files those tests rely on (extend fixtures with
  `abilities`/`height`/`weight` fields and an `/ability/:name` handler)

**Out of scope** (do NOT touch):

- `SpeciesInfoSection.tsx` — create a sibling section, don't extend it.
- `PokemonSummary` — list cards must NOT grow abilities/height/weight (the
  list endpoint doesn't provide them; adding them would force N extra fetches).
- The OG image route (`src/app/api/og/[id]/route.tsx`) — additive entity
  fields don't affect it; leave it alone.
- Localized **Pokémon display names** — that is plan 028.

## Git workflow

- Branch: `advisor/027-abilities-height-weight`
- Conventional commits, e.g. `feat: show abilities, height, and weight on detail page`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Domain — entity fields and `Ability`

In `src/domain/entities/Pokemon.ts`, extend the `Pokemon` interface
(additive only):

```ts
export interface PokemonAbilityRef {
  /** PokeAPI slug, e.g. 'lightning-rod' */
  readonly name: string;
  readonly isHidden: boolean;
}

export interface Pokemon extends PokemonSummary {
  // ...existing fields unchanged...
  /** Decimetres, as returned by PokeAPI. */
  readonly height: number;
  /** Hectograms, as returned by PokeAPI. */
  readonly weight: number;
  readonly abilities: readonly PokemonAbilityRef[];
}
```

Add two pure helpers next to the existing formatters:

```ts
/** Formats PokeAPI decimetres as metres, e.g. 4 → "0.4 m". */
export function formatHeight(decimetres: number): string;
/** Formats PokeAPI hectograms as kilograms, e.g. 60 → "6.0 kg". */
export function formatWeight(hectograms: number): string;
```

(`(value / 10).toFixed(1)` for both.)

Create `src/domain/entities/Ability.ts`:

```ts
export interface Ability {
  /** PokeAPI slug. */
  readonly name: string;
  /** Localized name (falls back to English, then formatted slug). */
  readonly displayName: string;
  /** Localized short effect text; empty string when unavailable. */
  readonly effect: string;
  readonly isHidden: boolean;
}
```

**Verify**: `pnpm typecheck` → FAILS (mappers don't produce the new fields
yet) — expected; proceed. Tests for the helpers go in
`src/__tests__/domain/Pokemon.test.ts` (cases: `formatHeight(4) === '0.4 m'`,
`formatHeight(17) === '1.7 m'`, `formatWeight(60) === '6.0 kg'`,
`formatWeight(9999) === '999.9 kg'`).

### Step 2: Infrastructure — types, mappers, repository

`types.ts` — extend `PokeApiPokemon` with:

```ts
height: number;
weight: number;
abilities: Array<{
  ability: PokeApiNamedResource;
  is_hidden: boolean;
  slot: number;
}>;
```

and add:

```ts
export interface PokeApiAbility {
  id: number;
  name: string;
  names: Array<{ name: string; language: PokeApiNamedResource }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: PokeApiNamedResource;
  }>;
}
```

`mappers.ts` — in `mapPokemon`, add
`height: raw.height, weight: raw.weight,` and
`abilities: raw.abilities.toSorted((a, b) => a.slot - b.slot).map((a) => ({ name: a.ability.name, isHidden: a.is_hidden }))`.
Add `mapAbility(raw: PokeApiAbility, isHidden: boolean, locale: string): Ability`
following `mapPokemonSpecies`'s language-fallback pattern
(`LOCALE_TO_POKEAPI_LANG[locale] ?? 'en'`; pick the locale entry, fall back to
the English entry, fall back to `formatPokemonName(raw.name)` / `''`).
Flavor text needs the same whitespace cleanup `mapPokemonSpecies` applies
(`\f`, `\n` → space, collapse doubles, trim) — extract that cleanup into a
small shared local function inside mappers.ts rather than duplicating it.

`PokeApiRepository.ts` — declare `abilityCache` / `abilityInFlight` exactly
like the move pair, then implement:

```ts
async findAbilities(
  refs: readonly { name: string; isHidden: boolean }[],
  locale: string,
): Promise<readonly Ability[]> {
  const raws = await Promise.all(
    refs.map((ref) =>
      getOrFetch(this.abilityCache, this.abilityInFlight, ref.name, () =>
        fetchJson<PokeApiAbility>(`${BASE_URL}/ability/${ref.name}`),
      ),
    ),
  );
  return raws.map((raw, i) => mapAbility(raw, refs[i].isHidden, locale));
}
```

(Caches store the **raw** response keyed by slug; locale is applied at map
time — same separation the move path uses.)

Port (`PokemonRepository.ts`) — add the method signature with a doc comment.
Check whether any test double implements the port interface
(`grep -rn "PokemonRepository" src/__tests__ | grep -i "mock\|fake\|stub"`)
and extend those doubles so typecheck passes.

**Verify**: `pnpm typecheck` → exit 0. `pnpm test` → existing infra tests
fail ONLY if their fixtures lack the new `PokeApiPokemon` fields — extend the
MSW fixtures with realistic `height`/`weight`/`abilities` values, then all pass.

### Step 3: Application + tests

Create `src/application/usecases/getAbilities.ts` mirroring
`getSpeciesData.ts`:

```ts
export async function getAbilities(
  repository: PokemonRepository,
  refs: readonly PokemonAbilityRef[],
  locale: string,
): Promise<readonly Ability[]> {
  if (refs.length === 0) return [];
  return repository.findAbilities(refs, locale);
}
```

Tests:

- `src/__tests__/application/getAbilities.test.ts` (model after
  `getSpeciesData.test.ts`): delegates to repository; returns `[]` without
  calling the repository when `refs` is empty.
- `src/__tests__/infrastructure/PokeApiRepository.test.ts`: add an
  `/ability/:name` MSW handler returning a fixture with `names` (en + de
  entries) and `flavor_text_entries`; assert `findAbilities` returns
  localized `displayName` for `de`, falls back to English for `pt`, and that
  two calls for the same slug hit the network once (the existing cache tests
  show how request counting is asserted).
- `src/__tests__/infrastructure/mappers.test.ts`: `mapPokemon` maps
  height/weight/abilities (sorted by slot, `is_hidden` preserved);
  `mapAbility` locale fallback chain.

**Verify**: `pnpm test` → all pass. `pnpm test:coverage` → thresholds hold.

### Step 4: Presentation — `PokemonAboutSection` + page wiring + i18n

Create `src/presentation/components/organisms/PokemonAboutSection.tsx` — a
**server-compatible** component (no `'use client'`; it has no state or
handlers):

```ts
interface Props {
  height: number;
  weight: number;
  abilities: readonly Ability[];
  labels: { section: string; height: string; weight: string; abilities: string; hidden: string };
}
```

Layout: copy `SpeciesInfoSection`'s `<section>`/heading classNames verbatim
(without `lg:col-span-2` — this card sits in one grid column); a `<dl>` of
`InfoItem`-style entries for height (value `formatHeight(height)`) and weight
(value `formatWeight(weight)`); then the abilities list — each ability's
`displayName` in the `dd` style, hidden abilities suffixed with a muted
`({labels.hidden})` chip, and the `effect` text in
`text-xs text-stone-400` under the name when non-empty.

Wire the page (`src/app/[locale]/pokemon/[id]/page.tsx`):

- Inside the existing try/catch, after the `Promise.all` resolves, add:
  `abilities = await getAbilities(repository, pokemon.abilities, locale);`
  (one extra sequential await; the per-ability fetches are batched and
  cached — do NOT try to fold it into the first `Promise.all`, `pokemon`
  isn't available yet).
- Add `getTranslations('about')` alongside the existing namespace fetches.
- Render `<PokemonAboutSection …/>` in the grid directly after
  `<SpeciesInfoSection …/>`.

New i18n namespace `about` in **all six** `messages/*.json`:

| Key         | en value    |
| ----------- | ----------- |
| `section`   | "About"     |
| `height`    | "Height"    |
| `weight`    | "Weight"    |
| `abilities` | "Abilities" |
| `hidden`    | "Hidden"    |

Translate naturally for es/fr/de/it/pt.

**Verify**: `pnpm i18n:check` → exit 0. `pnpm build` → exit 0. `pnpm dev` →
`http://localhost:3000/en/pokemon/25` shows About card with Height 0.4 m,
Weight 6.0 kg, abilities "Static" and "Lightning Rod (Hidden)";
`http://localhost:3000/de/pokemon/25` shows "Statik" / "Blitzfänger".

### Step 5: Full gate

**Verify**: `pnpm format && pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build`
→ all exit 0.

## Test plan

Summarized from steps: domain helper tests (4 cases), mapper tests
(height/weight/abilities/slot-sort/locale fallback), repository tests
(localization, English fallback, cache hit), use case tests (delegation,
empty short-circuit). Model infra tests on the existing MSW patterns in
`src/__tests__/infrastructure/`. All via `pnpm test`.

## Done criteria

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check`, `pnpm build` exit 0
- [ ] `pnpm test:coverage` exits 0 with thresholds intact; new tests present for entity helpers, mappers, `findAbilities`, `getAbilities`
- [ ] `/en/pokemon/25` renders About section with height, weight, and 2 abilities (one hidden)
- [ ] `grep -n "abilities" src/domain/entities/Pokemon.ts` shows the new field
- [ ] `PokemonSummary` unchanged (`git diff src/domain/entities/Pokemon.ts` shows no edits inside it)
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row for 027 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 028 already landed and changed `mapMove`/`mapPokemonSpecies` signatures
  in ways that conflict with the excerpts (coordinate: rebase, re-read, and
  only proceed if the changes are additive).
- The live `/ability/{name}` response shape differs from `PokeApiAbility`
  above (check one real response before coding if MSW fixtures feel
  ambiguous).
- Extending the port breaks more than 2 test doubles — the doubles may have
  drifted into copies; report instead of patching them all.
- The detail page's try/catch structure no longer matches (JSX must stay
  outside try/catch — an ESLint rule enforces this; don't fight it).

## Maintenance notes

- Plan 028 (localized names) touches the same mapper/port/page files — land
  sequentially and expect a trivial rebase.
- `findAbilities` caches raw responses per slug; if a per-locale ability
  cache is ever added, keep raw-response caching (locale applied at map time)
  — it's what keeps one network hit serving all six locales.
- Reviewer should scrutinize: ability flavor text uses the **latest** entry
  for the language (PokeAPI orders oldest→newest; `.at(-1)` like the species
  mapper), and the empty-`refs` short-circuit (some saved fixtures may lack
  an abilities array).
