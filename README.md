# Pokédex

**Live app → [https://pokeapi-lg.vercel.app](https://pokeapi-lg.vercel.app)**

A full-featured Pokédex built with Next.js 16, TypeScript, and Tailwind CSS 4. Covers all 1,025 Pokémon across every generation with real-time search, advanced filters, detailed stats, team analysis, side-by-side comparisons, and a daily trivia game — all server-rendered and available in 6 languages.

---

## Features

### Pokédex — Browse & Discover

- Browse all **1,025 Pokémon** with infinite scroll
- **Real-time search** with debouncing — matches names _and_ evolution lines (searching "Charmander" also surfaces Charmeleon and Charizard)
- **Multi-select type filter** with Any/All match modes — e.g. "show me Pokémon that are both Water AND Flying"
- **Multi-select generation filter** to narrow by era
- **Favorites system** — heart any Pokémon, filter to show favorites only; persisted via Zustand + localStorage (guest) or synced to your account (signed in)
- **User accounts** — sign in with GitHub OAuth to save your teams and favorites to the cloud; data syncs across all your devices

### Pokémon Detail Page

- Full base stats with **animated stat bars** and a **radar chart** visualization
- **Type matchups** table — shows ×4, ×2, ½, ¼, and ×0 damage multipliers for the Pokémon's type combination
- **Evolution chain** with sprites and trigger conditions
- **Species data** — Pokédex flavor text, category, egg groups, catch rate, gender ratio, base happiness (localized per language)
- **Move learnset** table — filterable by learn method (Level Up, TM/HM, Egg, Tutor); columns for type, category, power, accuracy, and PP
- **Alternate forms** — switch between regional variants, megas, and Gigantamax forms
- **Shiny toggle** — preview the shiny sprite for any form
- **Dynamic Open Graph image** generation for rich social link previews

### Team Builder

- Build a team of up to **6 Pokémon**
- **Drag-and-drop reordering** — fully keyboard-accessible via @dnd-kit
- **Type coverage analysis** — see which types your team is weak to, resists, or is immune to, with member counts per type
- **Full 18×18 type chart** — interactive attack vs. defense effectiveness grid
- Click any team slot to open the Pokémon's detail page without losing your team
- Team state persisted in a **cookie** (survives page reloads and server-side hydration)
- Team sharing via URL (`/team?team=1,4,7,...`)

### Compare

- Select **2 or 3 Pokémon** to compare side by side
- **Radar chart overlay** for visual stat comparison between selections
- **Stat bars** with colour-coded per-slot highlighting and BST totals
- State synced to the **URL via search params** — links are shareable

### Type Effectiveness Calculator

- Standalone tool at `/tools/type-calculator` — pick any one or two types
- Groups attacking types by damage multiplier (×4, ×2, ×1, ½, ¼, ×0)

### Who's That Pokémon? (Daily Game)

- Silhouette-guessing game with a **30-second countdown timer**
- **10 rounds** per daily challenge with score tracking
- Correct, wrong, and timeout feedback after each round
- **Daily rotation** — puzzle resets at midnight; progress persisted via Zustand (localStorage)
- Result sharing via Web Share API / clipboard with a shareable URL

### Navigation & UX

- **Responsive** layout — mobile navigation drawer + desktop navigation bar
- **6 languages**: English, Spanish, French, German, Italian, Portuguese
- Language switcher in the nav; locale-aware URLs (`/en`, `/es`, `/fr`, `/de`, `/it`, `/pt`)
- Skeleton loaders and React Suspense boundaries for every async route
- Custom `not-found` and `error` boundary pages for all routes

---

## Architecture

The project follows **Hexagonal Architecture** (Ports & Adapters), enforced at the folder level. This keeps business logic completely decoupled from the framework.

```
src/
├── domain/           # Pure entities and port interfaces — zero external dependencies
│   ├── entities/     # Pokemon, EvolutionChain, Move, PokemonSpecies, typeChart
│   └── ports/        # PokemonRepository interface (the hexagonal boundary)
│
├── application/      # Use cases — depends only on domain, no React
│   ├── usecases/     # getPokemonList, getPokemonById, getMoveLearnset, getGameChallenge…
│   ├── actions/      # Next.js Server Actions (pokemon, game)
│   └── container.ts  # Dependency injection — wires infrastructure to application
│
├── infrastructure/   # External adapter — implements domain ports
│   └── pokeapi/      # PokeApiRepository, HTTP mappers, in-memory cache
│
└── presentation/     # React layer — Server Components, Client Components, stores
    ├── components/   # atoms / molecules / organisms / ui (CVA primitives)
    ├── hooks/        # useDebounce, useInfiniteScroll, useHydration
    ├── queries/      # TanStack Query hooks (client-side cache)
    ├── store/        # Zustand stores (filters, favorites, team, compare, game)
    └── lib/          # typeColors, generationLabels, queryKeys, utils
```

### Layer import rules

| Layer             | May import                | Never imports                             |
| ----------------- | ------------------------- | ----------------------------------------- |
| `domain/`         | Nothing internal          | Everything below                          |
| `application/`    | `domain/` only            | `infrastructure/`, `presentation/`, React |
| `infrastructure/` | `domain/`, `application/` | `presentation/`                           |
| `presentation/`   | `domain/`, `application/` | `infrastructure/` directly                |

The `PokemonRepository` interface in `domain/ports/` could be backed by a database, GraphQL, or any other data source without touching a single use case or component.

### Server-first rendering

Every page is an **async Server Component** by default. Pages fetch data on the server and inject it into the TanStack Query cache via `HydrationBoundary` before the client hydrates — users get fully rendered HTML with real data before any JavaScript executes.

```tsx
// Pattern used across all data pages
const queryClient = new QueryClient();
const data = await useCase(repository);
queryClient.setQueryData([cacheKey], data);
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <ClientComponent />
  </HydrationBoundary>
);
```

---

## Tech Stack

| Concern       | Choice                        | Why                                                         |
| ------------- | ----------------------------- | ----------------------------------------------------------- |
| Framework     | Next.js 16 (App Router)       | Server Components, streaming, file-based routing            |
| Language      | TypeScript                    | End-to-end type safety                                      |
| Styling       | Tailwind CSS 4                | Design tokens as CSS custom properties, no runtime overhead |
| Server state  | TanStack Query v5             | Client cache, background refetch, Suspense integration      |
| Client state  | Zustand v5 + `persist`        | Lightweight, cookie/localStorage persistence                |
| i18n          | next-intl                     | 6 locales, locale-aware routing                             |
| Drag & drop   | @dnd-kit/core + sortable      | Accessible, pointer + touch + keyboard support              |
| Database      | PostgreSQL (Neon)             | Serverless HTTP driver, no connection-pool overhead         |
| ORM           | Drizzle ORM + drizzle-kit     | TypeScript-first, thin, SQL migrations committed to repo    |
| Auth          | Auth.js v4 (next-auth)        | GitHub OAuth, database sessions, Drizzle adapter            |
| Validation    | Zod                           | Runtime schema validation inferred as TypeScript types      |
| UI primitives | CVA + Radix UI                | Accessible headless components with typed variant API       |
| Testing       | Vitest + MSW                  | Fast unit tests with real HTTP mocking (no fixture drift)   |
| Deployment    | Vercel                        | Edge-optimized Next.js hosting                              |
| Data source   | [PokéAPI](https://pokeapi.co) | Free, public REST API covering all generations              |

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- A PostgreSQL database (Neon free tier works; any `postgres://` URL is fine)
- A GitHub OAuth App (for sign-in — optional if you only need the Pokédex features)

### Install and run

```bash
pnpm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

| Variable             | Where to get it                                                                |
| -------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`       | Neon dashboard → Connection string                                             |
| `AUTH_SECRET`        | `npx auth secret`                                                              |
| `AUTH_GITHUB_ID`     | GitHub → Settings → Developer settings → OAuth Apps                            |
| `AUTH_GITHUB_SECRET` | Same OAuth App; callback URL: `http://localhost:3000/api/auth/callback/github` |
| `AUTH_URL`           | `http://localhost:3000` (dev) or your production domain                        |

Apply database migrations:

```bash
pnpm db:migrate
```

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the app auto-redirects to your browser's preferred locale.

### Production build

```bash
pnpm build
pnpm start
```

---

## Scripts

```bash
pnpm dev            # development server with hot reload
pnpm build          # production build
pnpm start          # serve the production build
pnpm test           # run Vitest unit + integration tests
pnpm test:coverage  # generate coverage report
pnpm lint           # ESLint
pnpm typecheck      # TypeScript check (no emit)
pnpm format         # Prettier
pnpm ci             # format + lint + typecheck + test:coverage + build (full CI gate)
pnpm db:generate    # generate a new Drizzle migration from schema changes
pnpm db:migrate     # apply pending migrations to the database
pnpm db:studio      # open Drizzle Studio (visual database browser)
```

---

## Testing

Tests live in `src/__tests__/` and mirror the source tree:

```
__tests__/
├── domain/           # Entity logic, type chart calculations, team coverage
├── application/      # Use case tests against a mocked repository
├── infrastructure/   # PokeApiRepository, cache, and mappers (MSW intercepts HTTP)
└── presentation/     # Zustand store behaviour
```

**MSW (Mock Service Worker)** intercepts all PokéAPI HTTP calls — tests run fully offline with realistic response shapes and no brittle hardcoded fixtures.

**Coverage target:** 80% minimum across `domain/`, `infrastructure/`, and `application/`.

---

## Internationalisation

Six locales are bundled:

| Code | Language   |
| ---- | ---------- |
| `en` | English    |
| `es` | Spanish    |
| `fr` | French     |
| `de` | German     |
| `it` | Italian    |
| `pt` | Portuguese |

All UI copy lives in `messages/<locale>.json`. The locale is embedded in every URL (`/en/pokemon/25`, `/es/pokemon/25`). `next-intl` middleware handles automatic detection and redirect from the root `/` path.

Pokédex flavor text (species entries) is fetched from PokéAPI in the active locale when available, falling back to English.

---

## Design Decisions

**Hexagonal Architecture** was chosen so the domain model and all business rules stay pure TypeScript with no framework coupling. Adding a new data source (e.g. a database cache layer) only requires a new `infrastructure/` adapter — zero changes to use cases or UI.

**Server Components first** eliminates client-side data waterfalls on the initial load. Every page ships as rendered HTML, which means fast paint, good SEO, and no loading spinners on first visit.

**`style=` props are banned** across the codebase. Runtime colour values use a Tailwind class map (`src/presentation/lib/typeColors.ts`) keyed by Pokémon type — no hex strings in components, no inline styles leaking outside the design system.

**Cookie persistence for team and compare state** was chosen over localStorage so that the Zustand store can hydrate on the server side without a flash of empty content on page load. The `teamBuilderStore` and `compareStore` use a custom `cookieStorage` adapter plugged into Zustand's `persist` middleware via `createJSONStorage`. The adapter reads and writes `document.cookie` with `SameSite=Lax; path=/; max-age=365d`, and guards every access with `typeof document === 'undefined'` so it is safely skipped during SSR. Because cookies are sent with every request, Next.js Server Components can read the stored team before the page renders — no hydration mismatch, no empty flash.

The `gameStore` uses **localStorage** persistence instead (`persist` name `'pokemon-game-v2'`, `skipHydration: true`). Game state is client-only and never rendered server-side, so localStorage avoids inflating cookie headers with data the server doesn't need.

The `favoritesStore` uses the default `localStorage` persistence instead. Favorites are UI-only and never rendered server-side, so the brief client-only hydration gap is acceptable and localStorage avoids inflating cookie headers with data the server doesn't need.

---

## Key Files Reference

| File                                              | Purpose                                        |
| ------------------------------------------------- | ---------------------------------------------- |
| `src/domain/entities/Pokemon.ts`                  | Core entity, type union, sprite URL helpers    |
| `src/domain/entities/typeChart.ts`                | Complete Gen 6+ 18×18 type effectiveness chart |
| `src/domain/ports/PokemonRepository.ts`           | Repository interface — the hexagonal boundary  |
| `src/infrastructure/pokeapi/PokeApiRepository.ts` | PokéAPI HTTP adapter                           |
| `src/infrastructure/pokeapi/cache.ts`             | In-memory request cache to reduce API calls    |
| `src/application/container.ts`                    | Dependency injection wiring                    |
| `src/presentation/store/teamBuilderStore.ts`      | Team state with cookie persistence             |
| `src/presentation/store/gameStore.ts`             | Daily game state with localStorage persistence |
| `src/presentation/lib/typeColors.ts`              | Pokémon type → Tailwind class map              |
| `src/app/[locale]/team/page.tsx`                  | Team Builder page                              |
| `src/app/[locale]/compare/page.tsx`               | Compare page                                   |
| `src/app/[locale]/game/page.tsx`                  | Who's That Pokémon? page                       |
| `src/app/api/og/[id]/route.tsx`                   | Dynamic Open Graph image endpoint              |
| `messages/en.json`                                | English translation strings                    |
