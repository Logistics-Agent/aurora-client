# Logistics AI Control Tower

Next.js App Router foundation for the enterprise logistics operating system.

## Stack

- Next.js, React, strict TypeScript, Tailwind CSS v4
- shadcn/ui with Radix primitives and Lucide icons
- TanStack Query/Table, Axios, Zustand, Zod, React Hook Form
- MapLibre GL JS, Three.js, React Three Fiber, Drei, GSAP, Recharts
- Vitest, React Testing Library, jsdom

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Architecture

Routes in `src/app` stay thin. Product UI belongs in `src/features`; shared UI belongs in `src/components`. Server data flows through root `src/hooks/queries` or `src/hooks/mutations`, `src/api/services`, and `src/api/client`. TanStack Query owns server state; Zustand is reserved for client/spatial state.

The complete product architecture and phased execution guide are documented in [`docs/`](./docs/) and [`phases/`](./phases/).

Real 3D map providers, public environment variables, fallback behavior, and the simulated-telemetry boundary are documented in [`docs/ui-implementation/real-3d-map.md`](./docs/ui-implementation/real-3d-map.md).
