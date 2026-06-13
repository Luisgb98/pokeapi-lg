# Implementation Plans

First audit: 2026-06-11 against commit `8ad2d6c` (plans 001–017, all DONE).
Second audit (deep): 2026-06-12 against commit `84b8672` (plans 018–024).
Third audit (direction/`next`): 2026-06-12 against commit `56438cc` (plans 025–030).
Execute in the order below unless dependencies say otherwise.
Each executor: read the plan fully before starting, honor its STOP conditions, and update your row when done.

**Plan file location**: plans 018+ live in `.claude/plans/NNN-slug.md`
(a repo hook restricts where new .md files may be created); this README
remains the single status index for all plans.

## Execution order & status

| Plan | Title                                                        | Priority | Effort | Depends on | Status |
| ---- | ------------------------------------------------------------ | -------- | ------ | ---------- | ------ |
| 001  | Extract shared cookieStorage utility                         | P1       | S      | —          | DONE   |
| 002  | Delete getPokemonForm pass-through use case                  | P1       | S      | —          | DONE   |
| 003  | Fix cookie name unescaped in regex                           | P1       | S      | 001        | DONE   |
| 004  | Test getGameChallenge seeded RNG and server action           | P1       | S      | —          | DONE   |
| 005  | Test typeColors and queryKeys utilities                      | P1       | S      | —          | DONE   |
| 006  | Fix getOrFetch race condition (duplicate concurrent fetches) | P1       | M      | 004        | DONE   |
| 007  | Resolve PokemonPageParams / PokemonListParams duplication    | P2       | S      | —          | DONE   |
| 008  | Memoize PokemonCard and fix per-card store subscription      | P2       | S      | —          | DONE   |
| 009  | Fix searchByNameWithEvolutions over-fetching species         | P2       | M      | —          | DONE   |
| 010  | Fix findById swallowing all errors                           | P2       | M      | —          | DONE   |
| 011  | Add tests for 4 Zustand stores                               | P2       | M      | —          | DONE   |
| 012  | Add tests for 4 custom hooks                                 | P2       | M      | —          | DONE   |
| 013  | Extend generateStaticParams beyond Gen 1                     | P3       | M      | —          | DONE   |
| 014  | Document and guard singleton repository cache boundary       | P3       | S      | —          | DONE   |
| 015  | [Direction] Game score sharing                               | P3       | M      | —          | DONE   |
| 016  | [Direction] Standalone type calculator page                  | P3       | S      | —          | DONE   |
| 017  | [Direction] Team export and share via URL                    | P3       | M      | —          | DONE   |
| 018  | Validate untrusted inputs at boundaries with zod             | P1       | M      | —          | DONE   |
| 019  | Enforce hexagonal layer boundaries with ESLint               | P1       | M      | —          | DONE   |
| 020  | Fix factual drift in CLAUDE.md and README.md                 | P2       | S      | —          | DONE   |
| 021  | Add i18n key-parity check to CI                              | P2       | S      | —          | DONE   |
| 022  | [Direction] Game streaks and score history                   | P3       | M      | 021 (soft) | DONE   |
| 023  | [Direction] Standalone /favorites collection page            | P3       | M      | 021 (soft) | DONE   |
| 024  | [Direction] Bulk-add favorites to team                       | P3       | S      | 021 (soft) | DONE   |
| 025  | Playwright E2E smoke suite (5 journeys + CI job)             | P2       | M      | —          | DONE   |
| 026  | [Direction] Offensive coverage analysis in team builder      | P3       | S      | —          | DONE   |
| 027  | [Direction] Abilities, height, weight on detail page         | P3       | M      | —          | DONE   |
| 028  | [Direction] Localized Pokémon and move names                 | P3       | M      | —          | DONE   |
| 029  | [Direction] Stat calculator tool at /tools/stat-calculator   | P3       | M      | —          | TODO   |
| 030  | [Direction] Type-matchup quiz as second daily game mode      | P3       | M–L    | 025 (soft) | TODO   |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) | REJECTED (with one-line rationale)

## Dependency notes

- 003 depends on 001: fix the regex escape in the shared utility extracted by 001, not in both store files separately.
- 006 depends on 004: test characterization of `getGameChallenge` first; those tests act as a canary if the cache change breaks the game flow.
- 001 and 002 have no dependencies and can run in parallel.
- 004 and 005 have no dependencies and can run in parallel.
- 007 through 014 are all independent of each other.
- 021 should land before 022/023/024 (each adds translation keys to all six locales; the parity check catches a forgotten file). Soft dependency — they can proceed with manual six-file verification.
- 018 and 024 both touch `teamBuilderStore.ts` (018: persist storage wrapper; 024: new `addMembers` action) — run sequentially in either order, not in parallel.
- 022 and 018 both reference the game code: 018 adds `parseGameShareParams` to `gameShare.ts` and explicitly leaves `gameStore` alone; 022 owns `gameStore`. No conflict, any order.
- 019 and 020 are fully independent of everything.
- 025 should land first in the third batch: it creates the regression guard the feature plans extend (each adds at most one E2E assertion/journey when 025 is DONE).
- 027 and 028 both touch `infrastructure/pokeapi/types.ts`, `mappers.ts`, the repository port, and the detail page — run sequentially in either order, never in parallel.
- 026 and 030 both add to `domain/entities/typeChart.ts` (additively) — either order, trivial rebase.
- 029 is fully independent of everything in the batch.

## Selection note (2026-06-12 run)

The maintainer selected all three direction findings (022/023/024). The
fix-plan selection question went unanswered, so the advisor default applied:
the recommended maintenance plans (018, 019, 020, 021) were written.
**Deliberately not planned**: an E2E smoke suite — `@playwright/test` sits
unused in devDependencies with no config or tests; either build a minimal
Playwright suite for the team-share/game/detail flows or drop the dependency.
Open maintainer decision; ask for a plan if wanted.

## Selection note (2026-06-12 direction run, plans 025–030)

`/improve next` direction audit at `56438cc` (branch
`advisor/024-bulk-add-favorites-to-team`, which already carries the
implementations of 019–024 — their status rows above were corrected from TODO
to DONE during this run's reconcile). The maintainer selected **all six**
findings. The previously open E2E decision is resolved: build it (plan 025).

Direction findings considered but NOT planned this run (do not re-audit
without new evidence):

- **Encounter locations ("where to catch")**: real PokeAPI endpoint
  (`/pokemon/{id}/encounters`) but version-fragmented data with poor coverage
  for newer generations — weak payoff.
- **Damage calculator**: needs moves + natures + items modeling (L effort);
  the stat calculator (029) is the cheaper first step toward it.
- **Pokédex sort-by-BST/name**: `PokemonSummary` carries no stats; sorting by
  BST would require fetching full detail for all 1,025 or a precomputed
  dataset, which fights the API-driven architecture.
- **Localized names in the grid / evolution chain / game**: requires a
  species fetch per row; explicitly scoped out of plan 028.

## Findings considered and rejected

- ARCH-02 (presentation imports application): by design — CLAUDE.md explicitly permits `presentation/` to import `application/`.
- CORRECTNESS-04 (useInfiniteScroll dep array): technically correct; fragile pattern only, not a real bug.
- CORRECTNESS-06/08/09 (timeout stale closure, initOrRestore logic, theme toggle): confirmed safe after reading the code.
- PERF-04 (move learnset waterfall): real but moves are batch-fetched with per-move caching; impact is speculative without profiling.
- PERF-05 (SVG memoization): micro-optimization; not worth a plan.
- PERF-06 (type filter concurrency): PokeAPI is forgiving at current scale.

### 2026-06-12 deep audit — rejected (do not re-audit)

False positives caught in vetting:

- "Lockfile/manifest drift (next 16.2.7 vs 16.2.9)": false — node_modules and pnpm-lock both resolve 16.2.9; subagent misread `pnpm list`.
- "@testing-library/react and jsdom unused/missing": false — four hook test files import RTL; jsdom is installed and used.
- "computeDefensiveMatchups unused / detail page lacks defensive matchups": false — `TypeMatchupTable` consumes it and is rendered at `pokemon/[id]/page.tsx:141`.
- "typeChart.ts exceeds the 800-line max": false — the file is 441 lines.

Rejected on merit:

- Set-intersection micro-optimizations in `PokeApiRepository` type filters (reported 4× by perf agent): N ≤ 1025; not measurable.
- "Unbounded" singleton TtlCache growth: bounded by the finite PokeAPI dataset plus TTL expiry; not a leak.
- Team-param split DoS via giant URLs: server header-size limits cap URL length; `parseTeamParam` already validates and slices.
- `console.error` in error.tsx boundaries: Next.js's own template pattern; adding an error tracker is a product decision, not a defect.
- generateStaticParams build cost (6 locales × 1025): deliberate decision from plan 013; revalidate + dynamicParams already configured.
- Client-side query hooks for learnset/species data: server-side fetching in the detail page is the _correct_ pattern per CLAUDE.md (YAGNI).
- getGameChallenge total-count fetch race: request coalescing already fixed in plan 006; remainder speculative.
- dnd-kit version-pinning risk, CI per-job installs, missing .editorconfig / .env.example, pre-commit hooks: marginal or standard practice; not worth plans.
- PostCSS < 8.5.10 advisory (moderate, transitive via next): build-time tooling, no untrusted CSS input in this app; resolves with the next Next.js bump — monitor, don't patch.
- Share URLs embed `window.location.origin` (env-specific links): by design.
