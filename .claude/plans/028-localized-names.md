# Plan 028: Localize Pokémon and move display names on the detail page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 56438cc..HEAD -- src/domain/entities/PokemonSpecies.ts src/domain/entities/Move.ts src/domain/ports/PokemonRepository.ts src/infrastructure/pokeapi/types.ts src/infrastructure/pokeapi/mappers.ts src/infrastructure/pokeapi/PokeApiRepository.ts src/application/usecases/getMoveLearnset.ts "src/app/[locale]/pokemon/[id]/page.tsx"`
> Plan 027 legitimately touches `types.ts`, `mappers.ts`, the port, and the
> detail page — additive ability/height/weight changes there are expected and
> NOT a STOP. Anything that changed `mapPokemonSpecies`, `mapMove`, or
> `findMoveLearnset` beyond the excerpts below IS a STOP.

## Status

- **Priority**: P3 (direction)
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none hard; run sequentially with 027 (shared files), either order
- **Category**: direction
- **Planned at**: commit `56438cc`, 2026-06-12

## Why this matters

The app ships six locales and already localizes flavor text and genus, but
every Pokémon name is the title-cased **English** slug, and move names are
hardcoded to English in the mapper. PokeAPI already returns localized names
in responses the app fetches today — the species `names` array is simply
discarded, and `mapMove` ignores its locale-capable `names` field. After this
plan, a German user on `/de/pokemon/6` sees "Glurak", and move names render
in French/German/Spanish/Italian where official translations exist. Page
metadata and OG titles localize too.

**Honest scope note**: official Pokémon species names only differ from
English in fr/de (PokeAPI's es/it/pt entries mostly mirror English) — that's
correct behavior, not a bug. Move names have real translations in es/it/fr/de.

## Current state

- `src/infrastructure/pokeapi/types.ts` — `PokeApiSpecies` has
  `flavor_text_entries`, `genera`, `varieties`, etc. but **no `names` field**
  (the API returns one; it's untyped and unused). `PokeApiMove` already has:

  ```ts
  names: Array<{
    language: PokeApiNamedResource;
    name: string;
  }>;
  ```

- `src/infrastructure/pokeapi/mappers.ts:89-100` — `mapMove` hardcodes English:

  ```ts
  export function mapMove(raw: PokeApiMove): Move {
    const enName = raw.names.find((n) => n.language.name === 'en')?.name;
    return {
      id: raw.id,
      name: raw.name,
      displayName: enName ?? formatPokemonName(raw.name),
      ...
  ```

  `mapPokemonSpecies(raw, locale)` (same file) shows the locale pattern:
  `const lang = LOCALE_TO_POKEAPI_LANG[locale] ?? 'en';` then find-by-lang
  with English fallback (see its `genusEntry` lookup).

- `src/domain/entities/PokemonSpecies.ts` — `PokemonSpecies` interface:
  `genus, flavorText, eggGroups, genderRate, captureRate, baseHappiness, varieties`.
  No localized name field.

- `src/domain/ports/PokemonRepository.ts:52` — learnset method has no locale:

  ```ts
  findMoveLearnset(id: number): Promise<readonly LearnedMove[]>;
  ```

- `src/infrastructure/pokeapi/PokeApiRepository.ts:212` — `findMoveLearnset(id)`
  batch-fetches raw `PokeApiMove`s through `moveCache` (raw responses cached,
  keyed by move id), then maps each with `mapMove(...)`. Because the cache
  stores **raw** responses, adding a locale parameter at map time costs no
  extra network.

- `src/application/usecases/getMoveLearnset.ts` — thin delegation:

  ```ts
  export async function getMoveLearnset(
    repository: PokemonRepository,
    id: number,
  ): Promise<readonly LearnedMove[]> {
    return repository.findMoveLearnset(id);
  }
  ```

- `src/app/[locale]/pokemon/[id]/page.tsx` — calls
  `getMoveLearnset(repository, numericId)` inside `Promise.all`;
  `generateMetadata` and the OG/twitter blocks use `pokemon.displayName`;
  `PokemonDetailHeader` receives `pokemon` and renders the heading from it.
  `getSpeciesData(repository, numericId, locale)` is already locale-aware.

- Tests: `src/__tests__/infrastructure/mappers.test.ts` (mapper fixtures),
  `src/__tests__/application/getMoveLearnset.test.ts` (mocked repository),
  `src/__tests__/infrastructure/PokeApiRepository.test.ts` (MSW).

## Commands you will need

| Purpose   | Command              | Expected on success |
| --------- | -------------------- | ------------------- |
| Install   | `pnpm install`       | exit 0              |
| Typecheck | `pnpm typecheck`     | exit 0              |
| Tests     | `pnpm test`          | all pass            |
| Coverage  | `pnpm test:coverage` | thresholds hold     |
| Lint      | `pnpm lint`          | exit 0              |
| Build     | `pnpm build`         | exit 0              |

## Scope

**In scope**:

- `src/domain/entities/PokemonSpecies.ts` — add `localizedName`
- `src/domain/ports/PokemonRepository.ts` — `findMoveLearnset(id, locale)`
- `src/infrastructure/pokeapi/types.ts` — add `names` to `PokeApiSpecies`
- `src/infrastructure/pokeapi/mappers.ts` — `mapPokemonSpecies` maps the name;
  `mapMove(raw, locale)` localizes
- `src/infrastructure/pokeapi/PokeApiRepository.ts` — thread locale through
  `findMoveLearnset`
- `src/application/usecases/getMoveLearnset.ts` — add locale param
- `src/app/[locale]/pokemon/[id]/page.tsx` — pass locale; use
  `species.localizedName` for the header and metadata
- `src/presentation/components/organisms/PokemonDetailHeader.tsx` — accept an
  optional display-name override (see Step 4)
- Tests: extend `mappers.test.ts`, `getMoveLearnset.test.ts`,
  `PokeApiRepository.test.ts` (+ fixtures), plus any port test doubles that
  must gain the new parameter

**Out of scope** (do NOT touch):

- Pokédex grid / `PokemonSummary` names — the list endpoint has no localized
  names; localizing the grid would need a species fetch per row. Deliberate.
- Evolution chain node names (`mapEvolutionNode`) — same reason.
- Game, compare, team builder display names — they use `PokemonSummary`.
- `messages/*.json` — no new UI strings are needed.
- The OG image route handler itself (`src/app/api/og/[id]/route.tsx`) — only
  the `<meta>` titles in `generateMetadata` change.

## Git workflow

- Branch: `advisor/028-localized-names`
- Conventional commits, e.g. `feat: localize Pokémon and move names on detail page`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Species localized name

`types.ts` — add to `PokeApiSpecies`:

```ts
names: Array<{
  name: string;
  language: PokeApiNamedResource;
}>;
```

`PokemonSpecies.ts` — add to the interface:

```ts
/** Species name in the requested locale; falls back to English, then the formatted slug. */
readonly localizedName: string;
```

`mappers.ts` — in `mapPokemonSpecies`, using the existing `lang` variable:

```ts
const localizedName =
  raw.names.find((n) => n.language.name === lang)?.name ??
  raw.names.find((n) => n.language.name === 'en')?.name ??
  formatPokemonName(raw.name);
```

Extend every species fixture used by `mappers.test.ts` /
`PokeApiRepository.test.ts` with a `names` array containing at least `en` and
`de` entries (e.g. Charizard: `en: "Charizard"`, `de: "Glurak"`) — the field
is required because the real API always returns it.

Tests (in `mappers.test.ts`): locale hit (`de` → "Glurak"), locale miss falls
back to English (`pt` → "Charizard").

**Verify**: `pnpm test` → pass; `pnpm typecheck` → exit 0.

### Step 2: Move names by locale

`mappers.ts` — change `mapMove` signature to
`mapMove(raw: PokeApiMove, locale: string): Move` and replace the hardcoded
`'en'` lookup with the same three-step fallback as Step 1 (locale → en →
`formatPokemonName(raw.name)`), deriving `lang` via `LOCALE_TO_POKEAPI_LANG`.

Update all `mapMove` callers (find them: `grep -rn "mapMove" src/`).

**Verify**: `pnpm typecheck` → only remaining errors are at
`findMoveLearnset`'s call sites (fixed next step), or exit 0 if you do Steps
2–3 together.

### Step 3: Thread locale through the learnset path

- Port: `findMoveLearnset(id: number, locale: string): Promise<readonly LearnedMove[]>`
  (update the doc comment).
- `PokeApiRepository.findMoveLearnset` — accept `locale`, pass to `mapMove`.
  The raw-response caching (`moveCache`) is untouched — locale applies at map
  time only. Do NOT add locale to any cache key.
- `getMoveLearnset.ts` — add `locale: string` param, delegate.
- Detail page — `getMoveLearnset(repository, numericId, locale)`.
- Update any port test doubles (`grep -rn "findMoveLearnset" src/__tests__`).

Tests: in `PokeApiRepository.test.ts`, assert a learnset fetched with `de`
returns the German move `displayName` from the fixture and that fetching the
same Pokémon with `en` afterwards returns English names **without** extra
`/move/` requests (proves locale is not baked into the cache).

**Verify**: `pnpm test` → all pass; `pnpm typecheck` → exit 0.

### Step 4: Use the localized species name in the page

In `src/app/[locale]/pokemon/[id]/page.tsx`:

- `generateMetadata` currently fetches only `getPokemonById`. Add
  `getSpeciesData(repository, numericId, locale)` there (the species response
  is cached server-side; the page body fetches the same data) and use
  `species.localizedName` for `title`, the `description` interpolation, and
  the OG/twitter titles, falling back to `pokemon.displayName` when
  `localizedName` is empty.
- In the page body, pass the localized name to the header.

`PokemonDetailHeader.tsx` — add an optional prop
`displayNameOverride?: string`; render `displayNameOverride ?? pokemon.displayName`
in the heading. Keep the rest untouched (read the file first; if the heading
is rendered from something other than `pokemon.displayName`, adapt minimally
and note it in the commit message).

**Verify**: `pnpm build` → exit 0. `pnpm dev`:

- `http://localhost:3000/de/pokemon/6` heading shows "Glurak"; the browser
  tab title contains "Glurak".
- `http://localhost:3000/en/pokemon/6` still shows "Charizard".
- `http://localhost:3000/fr/pokemon/6` moves table shows French move names
  (e.g. "Lance-Flammes" for Flamethrower).

### Step 5: Full gate

**Verify**: `pnpm format && pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build`
→ all exit 0.

## Test plan

- `mappers.test.ts`: species `localizedName` (locale hit, en fallback);
  `mapMove` locale hit + fallback.
- `PokeApiRepository.test.ts`: learnset localization + cache-not-keyed-by-locale
  assertion (Step 3).
- `getMoveLearnset.test.ts`: locale parameter is forwarded to the repository.
- All via `pnpm test`; coverage thresholds must hold (`pnpm test:coverage`).

## Done criteria

- [ ] In `mapMove`, `'en'` appears only as a fallback after the locale lookup
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test:coverage`, `pnpm build` all exit 0
- [ ] `/de/pokemon/6` renders "Glurak" in heading and `<title>`; `/fr/pokemon/6` learnset shows French move names
- [ ] No locale appears in any cache key (`grep -n "locale" src/infrastructure/pokeapi/PokeApiRepository.ts` — present only as a function parameter passed to mappers)
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row for 028 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `mapMove` or `mapPokemonSpecies` no longer match the excerpts (beyond
  additive changes from plan 027).
- `PokemonDetailHeader` derives its heading from something other than the
  `pokemon` prop in a way that makes the override prop ambiguous.
- `grep -rn "getMoveLearnset\|findMoveLearnset" src/presentation` returns
  hits — the plan assumed the learnset is server-fetched only; a client
  query hook calling it changes the design. Report instead of improvising.

## Maintenance notes

- The grid/evolution-chain/game names remain English by design (no per-row
  species fetches). If localizing them ever matters, the right approach is a
  precomputed static name map per locale, not N API calls — record that
  decision here.
- Reviewer should scrutinize: cache keys (locale must NOT leak in — raw
  responses are locale-neutral) and the metadata fallback chain.
- If plan 027 landed first, `mapMove`'s neighbors changed — expect a clean
  rebase; both plans only add code in those files.
