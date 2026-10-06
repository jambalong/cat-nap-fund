# Cat Nap Fund 🐾

A cozy, mobile-first PWA where two partners share and track two savings goals: an **Emergency Fund** and a **Move-Out Fund**. Data lives in Supabase and syncs live between phones and browsers.

## What it does

- Two goal cards with an animated jar that fills as you save, plus a sleeping cat mascot (floating "z z z", wiggle and sparkle at 25/50/75/100% milestones; respects `prefers-reduced-motion`).
- Add, edit and delete deposits and withdrawals (amount, who, note, date); history newest first.
- Per-person contribution split; names are configurable in Settings.
- Editable target and optional target date → "Save $X/month to get there on time."
- Emergency helper: enter monthly expenses → "covers N months."
- Move-out checklist: editable cost line items; one tap sets the goal target to the total.
- Magic-link sign-in limited to two invited emails (RLS-enforced), realtime sync, installable PWA with offline shell, "evening mode" dark theme with a moon and stars.

All money is stored as integer cents.

## Local development

```bash
npm install
npm run dev        # no env vars → in-memory data, no login
npm run validate   # tsc + eslint + vitest + vite build (must exit 0)
```

To develop against Supabase, copy `.env.example` to `.env.local` and fill in both values.

## SETUP (for the humans)

### 1. Create a Supabase project
1. Go to <https://supabase.com> and create a free project.
2. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

### 2. Run the migration
Open **SQL Editor**, paste the contents of `supabase/migrations/001_init.sql`, and run it. This creates the tables, seeds the two goals, enables Row Level Security, and turns on realtime.

### 3. Insert the two allowed emails
In the SQL Editor (use lowercase):

```sql
insert into allowed_users (email) values ('you@example.com'), ('partner@example.com');
```

Anyone else gets a friendly "not invited" message, and RLS blocks all data access for them.

### 4. Set auth redirect URLs
In **Authentication → URL Configuration**, set **Site URL** to your Vercel URL (e.g. `https://cat-nap-fund.vercel.app`) and add it, plus `http://localhost:5173`, under **Redirect URLs**. Email auth (magic link) is enabled by default.

### 5. Deploy to Vercel
1. Push this repo to GitHub and import it at <https://vercel.com/new> (framework preset: Vite).
2. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy. `vercel.json` rewrites all routes to the SPA.

### 6. Install on your phone
- **iOS (Safari):** open the site → Share → **Add to Home Screen**.
- **Android (Chrome):** open the site → menu (⋮) → **Install app** / **Add to Home screen**.

Sign in once with the magic link on each device (open the link in the browser you'll install from).
