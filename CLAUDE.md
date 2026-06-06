# PokeAPI Project — Architecture Rules

## Stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS 4** · **TanStack Query** · **Zustand** · **Vitest**
- Package manager: `pnpm`
- Path alias: `@/` → `src/`

---

## Folder Structure

```
src/
├── app/                  # Next.js App Router (MUST stay here — Next.js constraint)
│   ├── layout.tsx
│   ├── page.tsx
│   └── pokemon/[id]/page.tsx
├── domain/               # Entities, value objects, port interfaces — zero deps
├── application/          # Use cases, container — imports only domain
├── infrastructure/       # PokeAPI adapter — implements domain ports
└── presentation/         # React layer — components, hooks, store, queries, lib
    ├── components/
    │   ├── atoms/
    │   ├── molecules/
    │   ├── organisms/
    │   └── ui/           # shadcn/CVA primitives (Button, Card, etc.)
    ├── hooks/
    ├── lib/
    ├── queries/
    └── store/
```

---

## Hexagonal Architecture — Layer Import Rules

| Layer | May import | NEVER import |
|---|---|---|
| `domain/` | Nothing internal | Everything below |
| `application/` | `domain/` only | `infrastructure/`, `presentation/`, React |
| `infrastructure/` | `domain/`, `application/` | `presentation/` |
| `presentation/` | `domain/`, `application/` | `infrastructure/` directly |
| `app/` | `presentation/`, `application/` | `infrastructure/` directly |

**Critical:** `application/` must contain zero React imports. `queries/` and `store/` belong in `presentation/`, not `application/`.

---

## SSR — Server Components First

**Default: every page and layout is an async Server Component.**

```tsx
// app/page.tsx — prefetch pattern for pages with interactive client children
export default async function HomePage() {
  const queryClient = new QueryClient();
  const repository = getRepository();
  const { pokemon, total } = await getPokemonList(repository);
  queryClient.setQueryData([cacheKey], { success: true, data: pokemon, meta: { total } });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  );
}

// app/pokemon/[id]/page.tsx — pure Server Component with generateMetadata
export async function generateMetadata({ params }) { ... }

export default async function PokemonDetailPage({ params }) {
  let pokemon, evolutionChain;
  try {
    const repository = getRepository();
    ({ pokemon, evolutionChain } = await getPokemonById(repository, numericId));
  } catch (error) {
    if (error instanceof PokemonNotFoundError) notFound();
    throw error;
  }
  return <JSX />; // JSX OUTSIDE the try/catch — ESLint react-hooks/error-boundaries
}
```

Rules:
- Add `"use client"` only when the file uses state, effects, refs, browser APIs, or event handlers
- Never fetch in `useEffect` when data can be fetched server-side
- Use `generateMetadata` on all detail pages
- JSX must live **outside** try/catch blocks

---

## Tailwind CSS 4 — No `style=` Props

**`style=` props are banned. Only one exception: CSS variable bridges for genuinely runtime-computed values.**

### Allowed — CSS variable bridge pattern

```tsx
// Animation stagger — index is only known at runtime
style={{ '--delay': `${Math.min(index * 40, 600)}ms` } as React.CSSProperties}
className="animate-fade-in-up"  // globals.css reads var(--delay, 0ms)

// Bar width — percentage is runtime-computed
style={{ '--bar-w': animated ? `${pct}%` : '0%' } as React.CSSProperties}
className="w-[var(--bar-w)] transition-[width]"
```

### Banned — replace with Tailwind

```tsx
// WRONG
style={{ backgroundColor: '#F97316', color: '#7C2D12' }}
// CORRECT — use static class map
className={`${TYPE_CLASSES[type].badgeBg} ${TYPE_CLASSES[type].badgeText}`}

// WRONG
style={{ fontFamily: 'var(--font-syne)' }}
// CORRECT — @theme inline generates font-display utility automatically
className="font-display"

// WRONG
style={{ background: 'linear-gradient(135deg, #FFEDD5, #fafaf9)' }}
// CORRECT
className="bg-[linear-gradient(135deg,#FFEDD5_0%,#fafaf9_100%)]"

// WRONG
style={{ transitionDelay: '0.1s' }}
// CORRECT
className="delay-100"
```

### Font utilities

`globals.css` defines `--font-display: var(--font-syne)` inside `@theme inline`. This generates the `font-display` Tailwind utility class. Use `className="font-display"` everywhere — never `style={{ fontFamily }}`.

---

## Global CSS — Keep It Clean

`src/app/globals.css` contains **only**:

1. `@import 'tailwindcss'`
2. `@theme inline { ... }` — design tokens (colors, fonts, radius, shadows, durations)
3. Base resets (`*`, `html`, `body`)
4. `@keyframes` definitions
5. Animation utility classes referencing those keyframes (`.animate-fade-in-up`, `.animate-float`, etc.)
6. Scrollbar styles

**Never add to globals.css:**
- Component-specific class selectors (`.pokemon-card`, `.stat-bar`, `.badge-fire`, …)
- Hover/focus states for specific components
- Any selector that names a feature, component, or variant

### Component-specific styles → CVA variant on the `ui/` primitive

```tsx
// WRONG: .pokemon-card { box-shadow: ...; } in globals.css
// CORRECT: variant on Card in src/presentation/components/ui/card.tsx

const cardVariants = cva('rounded-2xl border bg-card', {
  variants: {
    variant: {
      default: 'shadow-sm',
      pokemon: [
        'cursor-pointer overflow-hidden border-stone-200 bg-white',
        'shadow-[var(--shadow-card)]',
        'transition-[transform,box-shadow,border-color] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)] hover:border-stone-300',
      ].join(' '),
    },
  },
});
```

---

## Type Color System

`src/presentation/lib/typeColors.ts` exports `TypeClasses` — **Tailwind class strings, not hex values**.

```ts
interface TypeClasses {
  badgeBg: string;     // 'bg-[#FFEDD5]'
  badgeText: string;   // 'text-[#7C2D12]'
  badgeBorder: string; // 'border-[#F97316]/20'
  accentBg: string;    // 'bg-[#F97316]'
  tintBg: string;      // 'bg-[#F97316]/[2%]'
  gradientBg: string;  // 'bg-[linear-gradient(135deg,#FFEDD5_0%,...)]'
}
export const TYPE_CLASSES: Record<PokemonType, TypeClasses>
export function getPrimaryTypeClasses(types: readonly PokemonType[]): TypeClasses
```

Never build color strings at runtime. Never export hex values from this file.

---

## Commands

```bash
pnpm dev        # development server
pnpm build      # production build — run after changes to verify
pnpm test       # Vitest
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
```

## Test Coverage

Minimum 80% across `domain/`, `infrastructure/`, `application/`. `presentation/` is excluded from coverage thresholds but critical hooks and utilities should have unit tests.
