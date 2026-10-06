# Cat Nap Fund

Shared savings PWA for two people (Emergency Fund + Move-Out Fund).

## Stack
Vite + React + TypeScript, Tailwind 3, Vitest + React Testing Library, Supabase (Postgres, Auth magic link, Realtime), vite-plugin-pwa, deployed to Vercel as a static SPA.

## Validate
`npm run validate` = `tsc --noEmit && eslint . && vitest run && vite build`. Must exit 0 before every commit.

## Architecture
- All persistence goes through `SavingsRepository` (`src/data/repository.ts`).
  - `InMemoryRepository`: tests, and dev when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are unset.
  - `SupabaseRepository`: production; row mapping in `mappers.ts`; realtime via `subscribe`.
- Money is integer cents everywhere; format with `formatCents` (Intl USD).
- Pure business logic lives in `src/lib/` (savings.ts, money.ts, dates.ts) with unit tests.
- `src/store.tsx` loads data, reloads on repo events, exposes `useSavings()`.
- `src/Root.tsx` handles auth gating (magic link, not-invited screen); `App` takes an injectable repo (used by tests).
- DB: `supabase/migrations/001_init.sql`; RLS allows only emails in `allowed_users`.

## Design theme
Cozy cat nap: sleeping-cat photo cutout (`public/cat.png`, made by `scripts/cutout.mjs`) beside a filling jar, floating z's, paw prints, sleepy microcopy. Catppuccin palette as CSS variables in `src/index.css` (Latte light, Mocha dark via system setting, which also shows moon/stars) mapped to Tailwind tokens (base, mantle, surface, ink, muted, accent, pink, green, red). Flat, clean cards with a 1px border and a barely visible shadow. Nunito font with system fallback. Never use em dashes in copy or docs. Respect `prefers-reduced-motion`; keep WCAG AA contrast, labeled inputs, visible focus.
