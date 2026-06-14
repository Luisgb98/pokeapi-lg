# Plan 029: Add a stat calculator tool at /tools/stat-calculator

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 56438cc..HEAD -- "src/app/[locale]/tools" src/presentation/components/organisms/TypeCalculator.tsx src/domain messages`
> On any mismatch with the "Current state" excerpts, STOP. (Plans 026–028 add
> domain/message content — additive changes there are expected, not a STOP.)

## Status

- **Priority**: P3 (direction)
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `56438cc`, 2026-06-12

## Why this matters

The `/tools` section has exactly one tool (the type calculator). A
level/nature/IV/EV stat calculator is the natural second: it's pure domain
math over base stats the app already has (no new API surface), it mirrors the
existing tool's page structure exactly, and it makes the base-stats data on
the detail page actionable for competitively minded users. Selected as a
direction feature by the maintainer in the 2026-06-12 advisory session.

## Current state

- `src/app/[locale]/tools/type-calculator/page.tsx` — the page exemplar to
  copy verbatim in structure (async Server Component, `generateMetadata` from
  a namespace, header + centered column, renders one client organism):

  ```tsx
  export default async function TypeCalculatorPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'typeCalculator' });
    return (
      <div className="min-h-dvh">
        <header className="mx-auto max-w-2xl px-4 pb-4 pt-8">
          <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
            {t('heading')}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('subtitle')}</p>
        </header>
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
          <TypeCalculator />
        </div>
      </div>
    );
  }
  ```

- `src/presentation/components/organisms/TypeCalculator.tsx` — client
  organism exemplar for the interactive part (read it before writing the new
  organism; reuse its card/section styling idioms).

- `src/domain/entities/Pokemon.ts` — `PokemonStats`
  (`hp, attack, defense, specialAttack, specialDefense, speed`), `Pokemon`
  carries `stats`. `src/application/usecases/getPokemonById.ts` +
  `getRepository()` from `src/application/container.ts` fetch a full Pokémon
  (see `src/app/[locale]/pokemon/[id]/page.tsx` for the try/catch +
  `PokemonNotFoundError` handling pattern; JSX stays outside try/catch).

- `src/domain/data/typeChart.ts` exists — `src/domain/data/` is the
  established home for static domain data tables; put the natures table there.

- `src/domain/usecases/calculateTypeEffectiveness.ts` exists — the domain
  usecases directory is the home for pure calculation functions.

- UI primitives: `src/presentation/components/ui/select.tsx` (Radix-based
  select) — use it for the nature picker. CVA `Card` variants exist in
  `ui/card.tsx`.

- The team page query-param pattern (`src/app/[locale]/team/page.tsx` reads
  `searchParams`, fetches server-side, passes props) is the pattern for the
  `?id=` param here.

- i18n: 6 locale files; parity enforced by `pnpm i18n:check`. Existing
  namespace exemplar `typeCalculator` has `heading`/`subtitle` keys.

- Stat formulas (Gen 3+; the executor must use these exact formulas):
  - HP: `floor((2*base + iv + floor(ev/4)) * level / 100) + level + 10`
  - Other stats: `floor((floor((2*base + iv + floor(ev/4)) * level / 100) + 5) * natureMultiplier)`
  - `natureMultiplier` ∈ {0.9, 1.0, 1.1}. 25 natures; 5 are neutral
    (hardy, docile, serious, bashful, quirky); each non-neutral nature raises
    one of {attack, defense, specialAttack, specialDefense, speed} by 1.1 and
    lowers another by 0.9. HP is never affected by nature.
  - Canonical table (raised/lowered): lonely +atk−def, brave +atk−spe,
    adamant +atk−spa, naughty +atk−spd; bold +def−atk, relaxed +def−spe,
    impish +def−spa, lax +def−spd; timid +spe−atk, hasty +spe−def,
    jolly +spe−spa, naive +spe−spd; modest +spa−atk, mild +spa−def,
    quiet +spa−spe, rash +spa−spd; calm +spd−atk, gentle +spd−def,
    sassy +spd−spe, careful +spd−spa.
  - Bounds: level 1–100, IV 0–31, EV 0–252 per stat, 510 EV total.

- Worked verification values (use as test vectors):
  - HP: base 100, IV 31, EV 252, level 100 → `floor((200+31+63)*100/100)+100+10 = 404`
  - Stat: base 100, IV 31, EV 252, level 100, neutral → `294+5 = 299`
  - Same with +10% nature → `floor(299*1.1) = 328`
  - Same with −10% nature → `floor(299*0.9) = 269`
  - Level 50, base 100, IV 31, EV 0, neutral → `floor((200+31)*50/100)+5 = 120`
  - HP at level 1: base 45, IV 0, EV 0 → `floor(90*1/100)+1+10 = 11`

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

- `src/domain/data/natures.ts`
- `src/domain/usecases/calculateStats.ts`
- `src/__tests__/domain/natures.test.ts`
- `src/__tests__/domain/calculateStats.test.ts`
- `src/app/[locale]/tools/stat-calculator/page.tsx`
- `src/presentation/components/organisms/StatCalculator.tsx`
- `messages/*.json` (all six, modify) — new `statCalculator` namespace

**Out of scope** (do NOT touch):

- `PokemonPickerModal.tsx` — it is hard-coupled to the team builder
  (`{ open, onClose }` only, writes to the team store); do not reuse or
  generalize it. Pokémon selection here is via the `?id=` URL param.
- Nav (`TopNav.tsx`) — the type calculator has no nav tab either; adding
  tools navigation is a separate product decision.
- The detail page, type calculator, or any existing domain file except as
  read-only exemplars.

## Git workflow

- Branch: `advisor/029-stat-calculator`
- Conventional commits, e.g. `feat: add stat calculator tool page`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Domain — natures table + tests (tests first)

`src/domain/data/natures.ts`:

```ts
import type { PokemonStats } from '../entities/Pokemon';

export type NatureStat = Exclude<keyof PokemonStats, 'hp'>;

export interface Nature {
  readonly name: string; // slug, e.g. 'adamant'
  readonly increased: NatureStat | null;
  readonly decreased: NatureStat | null;
}

export const NATURES: readonly Nature[] = [
  /* all 25, per the table above */
];
export function getNature(name: string): Nature | undefined;
```

Tests (`natures.test.ts`): exactly 25 natures; exactly 5 neutral (both
fields null); every non-neutral nature has `increased !== decreased`; each
of the 5 stats appears exactly 4 times as `increased` and 4 times as
`decreased`; `getNature('adamant')` → `+attack −specialAttack`.

**Verify**: `pnpm vitest run src/__tests__/domain/natures.test.ts` → pass.

### Step 2: Domain — stat formulas + tests (tests first)

`src/domain/usecases/calculateStats.ts`:

```ts
import type { PokemonStats } from '../entities/Pokemon';
import type { Nature } from '../data/natures';

export const IV_MAX = 31;
export const EV_MAX = 252;
export const EV_TOTAL_MAX = 510;
export const LEVEL_MIN = 1;
export const LEVEL_MAX = 100;

export function calculateHp(base: number, iv: number, ev: number, level: number): number;
export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  multiplier: 0.9 | 1 | 1.1,
): number;
/** Applies the formulas to all six stats for the given nature. */
export function calculateAllStats(
  base: PokemonStats,
  ivs: PokemonStats,
  evs: PokemonStats,
  level: number,
  nature: Nature,
): PokemonStats;
```

Implement the exact formulas from Current state. `calculateAllStats` derives
each stat's multiplier from the nature (1.1 if `nature.increased` matches,
0.9 if `nature.decreased` matches, else 1; hp always 1).

Tests (`calculateStats.test.ts`): all six worked vectors from Current state,
plus `calculateAllStats` with adamant nature on base
`{hp:100, attack:100, ...}` IV 31 / EV 252 / level 100 → attack 328,
specialAttack 269, hp 404.

**Verify**: `pnpm vitest run src/__tests__/domain/calculateStats.test.ts` →
pass. `pnpm test:coverage` → thresholds hold (new domain files fully covered).

### Step 3: Page + organism

`src/app/[locale]/tools/stat-calculator/page.tsx` — copy the type-calculator
page structure. Differences:

- `interface Props { params: Promise<{ locale: string }>; searchParams: Promise<{ id?: string }> }`
- Parse `id` (default `25`; on `NaN` or `< 1`, fall back to `25` — this is a
  tool, not a content page; do not 404).
- Fetch via `getPokemonById(repository, id)` in try/catch; on
  `PokemonNotFoundError` fall back to id 25 (second fetch); JSX outside
  try/catch.
- Namespace: `statCalculator`. Pass `pokemon` (name + stats), translated
  labels, and the current id to the organism.

`src/presentation/components/organisms/StatCalculator.tsx` — `'use client'`.
Props: `{ pokemon: { id: number; displayName: string; stats: PokemonStats }; labels: <object of translated strings> }`.
State: `level` (number input + range slider, 1–100, default 50), `nature`
(the `ui/select.tsx` Radix select listing all 25 natures, default `hardy`),
per-stat `iv` (0–31, default 31) and `ev` (0–252, default 0) numeric inputs.
Derived (no useEffect — compute during render):
`calculateAllStats(pokemon.stats, ivs, evs, level, nature)` and the EV total.
Render a six-row table: stat label | base | IV input | EV input | computed
value; highlight the nature-raised stat value with an accent and the lowered
one muted (reuse the color conventions in `StatList.tsx` if any; otherwise
`text-emerald-600` / `text-red-500`). When the EV total exceeds 510, show a
warning line (`labels.evWarning`) and `aria-invalid` on the inputs — do not
clamp the total silently. Clamp individual inputs to their min/max on change.
Pokémon switching: a small form at the top — numeric input + submit button
that navigates to `?id=<value>` — check how other client components navigate
with locale awareness (`grep -rn "useRouter" src/presentation | head`) and
use the same import.

New i18n namespace `statCalculator` in **all six** `messages/*.json`
(translate values naturally):

| Key         | en value                                             |
| ----------- | ---------------------------------------------------- |
| `heading`   | "Stat Calculator"                                    |
| `subtitle`  | "Compute real stats from level, nature, IVs and EVs" |
| `level`     | "Level"                                              |
| `nature`    | "Nature"                                             |
| `base`      | "Base"                                               |
| `iv`        | "IV"                                                 |
| `ev`        | "EV"                                                 |
| `result`    | "Stat"                                               |
| `evTotal`   | "EV total: {used} / {max}"                           |
| `evWarning` | "EV total exceeds the legal maximum of 510"          |
| `pokemonId` | "Pokédex number"                                     |
| `load`      | "Load"                                               |

Stat display names (HP/Attack/…): check whether a stat-label translation
already exists (`grep -rn "specialAttack" messages/en.json`); if yes reuse
that namespace instead of duplicating keys; if no, add `statHp`, `statAttack`,
`statDefense`, `statSpecialAttack`, `statSpecialDefense`, `statSpeed` to
`statCalculator`.

**Verify**: `pnpm i18n:check` → exit 0; `pnpm build` → exit 0; `pnpm dev` →
`http://localhost:3000/en/tools/stat-calculator` renders defaults (Pikachu,
level 50); `?id=445` loads Garchomp; setting level 100, IV 31, EV 252,
nature adamant on Garchomp shows Attack 394
(base 130: `floor((260+31+63)*100/100)=354`, `+5=359`, `×1.1=394`).

### Step 4: Full gate

**Verify**: `pnpm format && pnpm format:check && pnpm lint && pnpm i18n:check && pnpm typecheck && pnpm test:coverage && pnpm build`
→ all exit 0.

## Test plan

- `src/__tests__/domain/natures.test.ts` — structural invariants of the
  table (counts, symmetry, lookup).
- `src/__tests__/domain/calculateStats.test.ts` — the six worked vectors +
  `calculateAllStats` nature application.
- No organism unit test required (presentation excluded from thresholds);
  Step 3's manual checks cover the UI. If plan 025's E2E suite exists, add
  one journey: load `/en/tools/stat-calculator`, expect the heading and a
  computed value cell.

## Done criteria

- [ ] `pnpm vitest run src/__tests__/domain/natures.test.ts src/__tests__/domain/calculateStats.test.ts` → all pass
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check`, `pnpm test:coverage`, `pnpm build` all exit 0
- [ ] `/en/tools/stat-calculator` renders and computes; `?id=445` + adamant/31/252/level 100 → Attack 394
- [ ] No `useEffect` used for derived stat computation (`grep -n "useEffect" src/presentation/components/organisms/StatCalculator.tsx` → no derived-state usage)
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row for 029 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `ui/select.tsx` doesn't expose a usable controlled select API (read it
  first; if the type calculator or compare picker uses it, copy that usage).
- Locale-aware client navigation has no existing pattern to copy
  (`useRouter` grep comes up empty) — report rather than inventing one.
- `getPokemonById` cannot be called from a tools page without violating the
  ESLint layer boundaries (it shouldn't — app/ may import application/ —
  but if the linter disagrees, STOP).

## Maintenance notes

- The natures table and formulas are Gen 3+ stable; no API coupling, no
  maintenance expected.
- If a Pokémon search/picker is ever generalized out of the team builder,
  replace the numeric `?id=` form with it — the URL contract (`?id=`) should
  stay.
- Reviewer should scrutinize: `floor` placement in the stat formula (two
  nested floors — the outer one applies after the nature multiplier), EV
  warning not silently clamping, and that the 25-nature table matches the
  canonical mapping (the tests enforce structure but not each pairing —
  spot-check adamant, modest, jolly).
