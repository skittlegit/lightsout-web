# LightsOut — F1 Season Hub

Formula 1 web app: season calendar, championship standings and points
progression, race results, driver and team pages, driver head-to-heads, and
Monte Carlo race forecasts.

Built with **Next.js 16 (App Router, Turbopack)** and **Tailwind CSS v4**
(CSS-first config, no `tailwind.config`). One theme modelled on Formula 1's own
palette: F1-red navigation, carbon-black feature panels, a warm off-white page,
and white cards with the top-right corner border. Archivo (wide) for headings,
Titillium Web for text. Design tokens live in `app/globals.css`.

## Data sources

| Source | Used for |
| --- | --- |
| [lightsout-api](https://lightsout-api.onrender.com) (FastAPI backend) | Calendar, standings, race predictions |
| [Jolpica F1](https://api.jolpi.ca) (Ergast-compatible, no key) | Per-race results, qualifying, driver/constructor/circuit identity |

All fetching happens in server components (`lib/api.ts`, `lib/jolpica.ts`)
with ISR revalidation. Calendar and standings fall back to live Jolpica, then
the verified snapshot in `lib/data/base-data.json`. Calendar flags are recalculated
from today's UTC date. Forecast failures show the actual next race with an
unavailable state. They never substitute demo predictions.
Forecast requests bypass Vercel's data cache and use Render's prediction cache,
so newly deployed models and manual forecast refreshes are visible immediately.

Race start times come from `race_time` (UTC) and render in the visitor's own
timezone. The forecast shows the Open-Meteo weather the model used, a win /
podium / points odds board, and the full position matrix.

`npm run refresh:data` updates the offline snapshot from Render. The weekly
`refresh-base-data` workflow also commits a refreshed snapshot on Tuesdays.

## Getting started

```bash
cp .env.local.example .env.local   # then adjust values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Defaults to `https://lightsout-api.onrender.com/api`. The `/api` suffix is added when absent; the previous Railway address is migrated to Render. |
| `NEXT_PUBLIC_SEASON` | Season year, e.g. `2026`. |

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Structure

```text
app/
  page.tsx               # home — next race, forecast snapshot, last race, standings, coming up
  calendar/              # full season, grouped by month, winners + local start times
  standings/             # drivers + teams tables, points progression chart
  drivers/               # driver grid (team-colour cards)
  forecast/              # full forecast: odds board, conditions, position matrix
  races/[round]/         # race detail: results, qualifying, recap, forecast
  drivers/[code]/        # driver profile + season form
  constructors/          # team grid; [slug]/ team profile, lineup, race log
  compare/               # driver head-to-head (?a=VER&b=NOR)
  api/                   # JSON proxies of the backend (calendar, standings, predictions)
  components/            # server + client components
lib/
  api.ts                 # lightsout-api data layer (ISR + mock fallback)
  jolpica.ts             # Jolpica/Ergast wrapper
  compare.ts, recap.ts   # pure derivation helpers
  season.ts              # points progression + per-round podiums
  nav.ts                 # top-level sections (nav + footer)
  format.ts, slug.ts     # display + identifier mapping
  ics.ts                 # add-to-calendar (.ics) generation
```

## Conventions

- This repo runs a Next.js version newer than most training data — read
  `node_modules/next/dist/docs/` before changing framework-facing code
  (see `AGENTS.md`).
- Caching uses the pre-Cache-Components model: `fetch` with
  `next.revalidate` plus route-segment `revalidate` exports.
