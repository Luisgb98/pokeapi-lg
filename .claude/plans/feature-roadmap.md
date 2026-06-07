# Feature Roadmap — Interview-Ready Additions

## Build Order (bang for buck)

| #   | Feature                                 | Branch                     | Status  |
| --- | --------------------------------------- | -------------------------- | ------- |
| 1   | Species / Flavor Text                   | `feat/species-flavor-text` | done    |
| 2   | Stats Radar Chart                       | `feat-stats-radar-chart`   | done    |
| 3   | Dynamic OG Images                       | —                          | pending |
| 4   | Favorites / Bookmarks (Zustand persist) | —                          | pending |
| 5   | Pokémon Comparison page                 | —                          | pending |
| 6   | Move Learnset Table                     | —                          | pending |
| 7   | Shiny / Form Switcher                   | —                          | pending |
| 8   | "Who's that Pokémon?" Mini-Game         | —                          | pending |

---

## Feature Specs

### 1. Species / Flavor Text — `GET /pokemon-species/{id}`

- **What:** Section on the detail page showing in-game Pokédex entry, genus, egg groups, gender ratio, capture rate, base happiness.
- **Why impressive:** Parallel SSR `Promise.all` for `pokemon` + `species`; locale-aware flavor text tied to next-intl; extends existing architecture cleanly.
- **PokeAPI:** `/pokemon-species/{id}`
- **Complexity:** Medium (1.5 days)

### 2. Stats Radar Chart (Hexagon)

- **What:** Hexagonal radar chart for the 6 base stats, animated on load. Overlay two radars on the comparison page.
- **Why impressive:** Correct UX choice for 6-dimensional balanced data; client component boundary handled correctly; visually striking.
- **Technology:** `recharts` RadarChart or hand-rolled SVG.
- **Complexity:** Low–Medium (0.5–1 day)

### 3. Dynamic OG Images — `GET /api/og/[id]`

- **What:** Route Handler using `next/og` (`ImageResponse`) generating a PNG card per Pokémon (artwork, name, types, BST). Each detail page gets a `<meta og:image>`.
- **Why impressive:** Next.js-exclusive API; zero client JS; interviewers see it on every link preview.
- **Technology:** `next/og`, `generateMetadata`.
- **Complexity:** Low–Medium (1 day)

### 4. Favorites / Bookmarks

- **What:** Heart button on PokémonCard and detail page. Persisted via Zustand `persist` + `localStorage`. `?filter=favorites` URL param in Pokédex. Badge count in nav.
- **Why impressive:** SSR hydration guard (`useHydration`) — teaches the localStorage/SSR mismatch story.
- **Technology:** Zustand `persist` middleware, `useHydration` hook.
- **Complexity:** Low (0.5–1 day)

### 5. Pokémon Comparison — `/compare?a=25&b=4&c=7`

- **What:** `/compare` page, 2–3 Pokémon side by side: overlaid radar chart, type matchup diff, BST comparison. Selections live in URL.
- **Why impressive:** URL-as-state pattern; SSR prefetch from URL params; shareable link.
- **Technology:** `useSearchParams`, `useRouter`, parallel server-side fetches.
- **Complexity:** Medium (2 days)

### 6. Move Learnset Table

- **What:** Tab on detail page listing all learnable moves: type, category, power, accuracy, PP, learn method. Filterable by method, sortable columns.
- **Why impressive:** Batched `Promise.all` for 50–80 move calls; infra cache working at scale; server-side data ownership.
- **Technology:** New `Move` entity, batched infra method, `@tanstack/react-table` or custom.
- **Complexity:** High (2–3 days)

### 7. Shiny / Form Switcher

- **What:** Toggle on detail page for shiny sprite + dropdown for alternate forms (Mega, Alolan, Galarian, Hisuian) from `/pokemon-species/{id}` varieties.
- **Why impressive:** Sparse optional data handled gracefully; optimistic UI without full-page skeleton.
- **Technology:** Client `useQuery` refetch on form change.
- **Complexity:** Medium (1.5 days)

### 8. "Who's that Pokémon?" Mini-Game — `/game`

- **What:** Silhouetted sprite, guess from 4 choices or type the name. Timer. Score. Daily challenge via Server Action seeded random.
- **Why impressive:** Gamification; Server Action for deterministic seed; `useReducer` state machine; `framer-motion` reveal.
- **Technology:** Server Actions, `useReducer`, `framer-motion`.
- **Complexity:** Medium (1.5–2 days)

---

## Why Next.js Matrix

| Feature       | Next.js advantage                                                    |
| ------------- | -------------------------------------------------------------------- |
| OG Images     | `ImageResponse` is a Next.js/Vercel edge primitive                   |
| Flavor Text   | `async` Server Components + parallel `Promise.all` — zero waterfall  |
| Comparison    | URL params → SSR prefetch on first load, then client navigation      |
| Move Learnset | Server-side batching + infra cache — resolved in one render          |
| Daily Game    | Server Actions for deterministic seed — can't be spoofed client-side |
| Favorites     | SSR hydration guard — shows Next.js-specific pitfall mastery         |
