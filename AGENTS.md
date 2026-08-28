<!-- BEGIN:nextjs-agent-rules -->

# AGENTS.md — LOGISTICS AI CONTROL TOWER

Act as a senior frontend engineer and frontend architect.

## Stack

- Next.js App Router
- React + strict TypeScript
- Tailwind CSS
- shadcn/ui + Radix primitives
- TanStack Query
- TanStack Table
- Zustand
- Axios
- Zod
- React Hook Form
- Three.js + React Three Fiber + Drei
- GSAP for meaningful spatial/camera motion
- Recharts when ordinary charts are appropriate
- date-fns
- Lucide
- Sonner

Do not add alternatives without a concrete reason.

## Universal feature contract

The detailed and mandatory nested ownership contract is defined in:

`/home/kaito/project/aurora-client/logistics_control_tower_nextjs_feature_architecture_pack_v3/rules.md`

Read and follow that file before creating or restructuring any feature.

The feature-first structure applies to EVERY feature and nested sub-feature, not only Shipment.

Any feature may own local:

- components/
- hooks/query/
- hooks/mutations/
- constants/
- types/
- utils/
- dto/
- schemas/
- stores/
- tabs/
- sections/
- workflows/
- drawers/
- dialogs/

when needed.

Use local-first ownership.
Promote to shared only after real reuse across independent features.

Every business `app/**/page.tsx` remains a thin route adapter importing the feature public entry.

## Architecture

Use feature-first architecture.

Route files remain thin.

`src/features/<feature>/index.tsx` is the public route-level feature entry when the feature represents a page/workspace.

A feature may contain only what it needs:

- components/
- hooks/query/
- hooks/mutations/
- constants/
- types/
- utils/
- dto/
- schemas/
- tabs/
- sections/
- drawers/
- dialogs/
- stores/ for local client state only

Large tabs/sub-features may repeat the same internal structure.

## Shared folders

Use shared folders only for genuine cross-feature concerns:

- `components/ui` shadcn primitives
- `components/layout` app layout
- `components/common` reused app components
- root `hooks` cross-feature hooks only
- root `types`, `dto`, `constants`, `utils`, `schemas` shared only
- `lib` infrastructure, including shadcn/Tailwind utilities
- `apis/services` backend HTTP services

## State

TanStack Query = server state.
Zustand = client/spatial interaction state.
Local React state = local UI interaction state.

Never mirror Query response caches into Zustand.

## API flow

Feature UI
→ feature query/mutation hook
→ `src/apis/services`
→ `src/lib/http`
→ backend

Never call Axios directly from components.

## Next.js

Default to Server Components.
Use `"use client"` only at the lowest practical interactive boundary.

## Styling

Tailwind CSS is mandatory.
Use semantic CSS variables/tokens.
Use shadcn as infrastructure, not as the final product identity.

## Quality

No `any` shortcuts.
No `@ts-ignore` shortcuts.
Do not claim checks passed without running them.

# V3 CANONICAL DATA LAYER

Use ONLY these canonical paths for server data:

```text
src/hooks/queries/<domain>/
src/hooks/mutations/<domain>/
src/api/services/
src/api/query-keys/
src/api/client/
```

Do not put TanStack Query hooks under `features/*`.

Do not use `src/apis/`.
Use `src/api/`.

Do not use singular `src/config/`.
Use `src/configs/`.

Features are primarily UI/workspace ownership boundaries.

# File important

/home/kaito/project/aurora-client/logistics_control_tower_nextjs_feature_architecture_pack_v3

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
