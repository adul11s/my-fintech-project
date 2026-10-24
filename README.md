# My FinTech Project — Next.js Micro Frontend Demo

A production-shaped **Next.js multi-zone micro-frontend** playground that mirrors
the architecture of scale FinTech platforms: independently deployable zones composed
into one seamless experience.

```
              ┌──────────────────────────┐
              │  container (shell)  :3000 │
              │  header · nav · landing   │──┐ rewrites
              └────────────┬─────────────┘  │
        /accounts/*        │                │ /loans/*
               ┌───────────▼──┐        ┌────▼─────────┐
               │ accounts :3001│        │  loans :3002 │
               │ balances,     │        │  annuity loan│
               │ transactions  │        │  simulator   │
               └───────────────┘        └──────────────┘
                        both consume @fintech/ui
```

## Zones

| App | Path | Owns |
|-----|------|------|
| `apps/container` | `/` | shell, navigation, landing |
| `apps/accounts` | `/accounts/*` | balances, transaction history |
| `apps/loans` | `/loans/*` | annuity loan simulator |

`packages/ui` — shared design kit (`Card`, `Stat`, `formatIdr`, `formatMovement`, `monthlyInstallment`).

Massively used patterns here (mirroring real scale-W work):
- **Composition via `rewrites()`** — no federation loader, no client-side runtime glue.
- **`transpilePackages`** — one workspace package shared by all zones, single design language.
- **Deterministic mock data** — every zone demos without infrastructure.

## Run it

```bash
npm install
npm run dev:container   # http://localhost:3000
npm run dev:accounts    # http://localhost:3001  (also on /accounts of the shell)
npm run dev:loans       # http://localhost:3002  (also on /loans of the shell)
```

## Build prod (all zones, CI-friendly)
npm run build
```

## Deploying the composed shell (production)

Bind a domain to the container; each remote is deployed separately and the
container `rewrites()` compose it. When zones are served **behind** the
container, build them with their zone prefixes baked in:

```bash
ASSET_BASE=/accounts NEXT_PUBLIC_ZONE_BASE=/accounts npm run build:accounts
ASSET_BASE=/loans NEXT_PUBLIC_ZONE_BASE=/loans npm run build:loans
```

- `ASSET_BASE` — zone build assets resolve under `/accounts/_next/*`; the
  container proxies those paths back to the zone (see `apps/container/next.config.ts`).
- `NEXT_PUBLIC_ZONE_BASE` — in-zone links keep working under the composed prefix.

Point `REMOTE_ACCOUNTS_URL` / `REMOTE_LOANS_URL` (container env) at the hosts
of the deployed zones.


## Tech stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · npm workspaces
