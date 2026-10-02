# LightsOut — F1 Season Hub

Editorial-style Formula 1 web app: season calendar, championship standings,
race results, driver head-to-heads, and Monte Carlo race forecasts.

Built with **Next.js 16 (App Router, Turbopack)**, **Tailwind CSS v4**
(CSS-first config, no `tailwind.config`), **Framer Motion**, and **Lenis**
smooth scrolling. Light/dark theme with a class-based toggle.

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
  page.tsx               # homepage — hero, calendar, standings, forecast
  races/[round]/         # race detail: results, qualifying, recap, forecast
  drivers/[code]/        # driver profile + season form
  constructors/[slug]/   # constructor profile, lineup, race log
  compare/               # driver head-to-head (?a=VER&b=NOR)
  api/                   # JSON proxies of the backend (calendar, standings, predictions)
  components/            # server + client components
lib/
  api.ts                 # lightsout-api data layer (ISR + mock fallback)
  jolpica.ts             # Jolpica/Ergast wrapper
  compare.ts, recap.ts   # pure derivation helpers
  format.ts, slug.ts     # display + identifier mapping
  ics.ts                 # add-to-calendar (.ics) generation
```

## Conventions

- This repo runs a Next.js version newer than most training data — read
  `node_modules/next/dist/docs/` before changing framework-facing code
  (see `AGENTS.md`).
- Caching uses the pre-Cache-Components model: `fetch` with
  `next.revalidate` plus route-segment `revalidate` exports.
