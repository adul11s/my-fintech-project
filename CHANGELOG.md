# Changelog

## [1.0.0] — 2026-10-28

First tagged release of the QUPI frontend pilot: a **Next.js App Router multi-zone micro-frontend**.

### Architecture
- One container shell composing independent **wallet** and **credit** zones through `rewrites()` — each zone is its own app, deployed and versioned separately.
- `packages/api-client` is the single typed contract between the zones and the backend; no zone talks to the network directly.
- Shared design kit across zones so the suite behaves and feels like one product.

### Product surface
- Top-up, transfer, QRIS payment, tags, and paylater flows.
- Sandbox banner that makes the non-production status obvious to anyone opening it.

### Quality
- CI (`Frontend`) runs lint, typecheck, tests and build.
- Known gaps are documented in the README instead of being hidden — including what is mocked.

### Notes
This is a portfolio pilot, not a live financial product. The backend lives in `qupi-backend`.
