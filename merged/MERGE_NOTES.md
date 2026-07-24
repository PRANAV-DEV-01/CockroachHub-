# Merge notes: CockroachHub + SafeCircle

This time both zips contained real, working source (unlike the earlier
uploads, where CockroachHub's zip was only PDF exports of its docs). Here's
exactly what was done.

## CockroachHub — untouched

Every file under `backend/`, `docker-compose.yml`, and `frontend/public/`
(the original ones) is byte-identical to your upload. Verified with `diff`.

Only 4 files inside `frontend/src` were touched, and only additively:

- `App.tsx` — added one lazy import + one `<Route path="/safecircle">`
- `components/layout/Navbar.tsx` — added one nav link + one icon import +
  one preload entry
- `i18n/en.json` / `i18n/hi.json` — added one `nav.safecircle` translation
  key each

Nothing existing was removed, renamed, or reordered — every other line in
those 4 files is identical to your original. Every other file in
`frontend/src` (all pages, all admin pages, all hooks, all components) is
untouched.

## SafeCircle — added as its own section

Your Safe-Circle.zip is a large Replit workspace export; the one real app
inside it (past ~1000s of pnpm cache files and Replit's own tooling, none
of which is app code) is a Delhi Metro station-status checker. That's what
"SafeCircle" refers to per your description. It now lives at:

```
frontend/src/safecircle/
  SafeCirclePage.tsx        — the original app's App.tsx, renamed + rewired
  types.ts                  — the original lib/types.ts, unchanged
  safecircle.css            — scoped design tokens (see below)
  hooks/useMetroData.ts     — the original use-metro-data.ts, unchanged logic
  components/StationComponents.tsx  — the original station-components.tsx, unchanged
```

Its two data files were copied and namespaced (not renamed destructively —
the originals in Safe-Circle.zip are untouched, these are copies):

```
frontend/public/safecircle-stations.json
frontend/public/safecircle-disruptions.json
```

Route: `/safecircle` — reachable from the main nav bar ("SafeCircle" with a
train icon) alongside every other CockroachHub page.

### Why it needed a small styling shim (and nothing else changed)

CockroachHub uses its own Tailwind theme (`ph-*` orange/black tokens).
SafeCircle's original app was built against a different, shadcn/ui-style
token set (`bg-background`, `bg-card`, `bg-primary`, etc.) that simply
didn't exist in this project's Tailwind config — without adding it, the
page would render completely unstyled.

Fix: those tokens are now defined in `tailwind.config.js` (extend.colors)
and given real values only inside `.safecircle-scope` (see
`safecircle.css`) — the exact same dark-violet palette the original
standalone app used. Outside that wrapper div, these token classes resolve
to nothing, so **CockroachHub's own theme, every existing page, and every
existing style rule is unaffected** — confirmed no existing CockroachHub
component used any of these class names before this change.

The SafeCircle page keeps its own header, search, station cards, and
network overview pixel-for-pixel from the original — only its brand text
changed from "MetroRoute Delhi" to "SafeCircle · Metro Route Delhi" (per
your description of what this feature is), and it gained one small
"← CockroachHub" back-link.

### New dependencies

The original Metro app used `framer-motion` and `date-fns`, which
CockroachHub's `frontend/package.json` didn't have. Both were added to
`dependencies`. Nothing was removed or version-bumped.

`package-lock.json` is now stale relative to the new deps — run
`npm install` (not `npm ci`) once to regenerate it.

## What wasn't touched at all

- `backend/` (FastAPI + PostgreSQL) — completely untouched, still needs
  `docker compose up -d` + `uv run uvicorn ...` per the original README
- Admin panel, live feed, SOS broadcast, etc. — all original CockroachHub
  backend-dependent features are exactly as they were
- Every other CockroachHub page and its content

## Running it

Same as the original README:

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Start backend (port 8000)
cd backend
uv sync
uv run uvicorn app.main:app --reload

# 3. Start frontend (port 5173, proxies /api to :8000)
cd frontend
npm install
npm run dev
```

`/safecircle` works with zero backend involvement — it's a fully static
page fetching its two JSON files directly.
