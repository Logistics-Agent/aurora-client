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

The current route groups, page purposes, permission targets and frontend authorization gaps are documented in [`docs/PAGES_AND_AUTHORIZATION.md`](./docs/PAGES_AND_AUTHORIZATION.md). Map-specific behavior is documented in [`docs/MAP_PAGES.md`](./docs/MAP_PAGES.md).

Real 3D map providers, public environment variables, fallback behavior, and the simulated-telemetry boundary are documented in [`docs/ui-implementation/real-3d-map.md`](./docs/ui-implementation/real-3d-map.md).

## Browser notifications

The FCM popup is enabled only when the authenticated user has the
notifications:access permission. The browser talks to the API Gateway/BFF
with its session cookie; it never calls the Notification service directly and
never receives the Firebase Admin credential.

1. Copy .env.example to .env.local.
2. Set NEXT_PUBLIC_API_BASE_URL to the local API Gateway URL, normally
   https://localhost:7100.
3. From Firebase Console, Project settings, Your apps, Web app, copy the
   public Firebase Web configuration into the NEXT_PUBLIC_FIREBASE_* fields.
4. Copy the Web Push certificate VAPID public key into
   NEXT_PUBLIC_FIREBASE_VAPID_KEY.
5. Set NEXT_PUBLIC_FIREBASE_ENABLED=true, restart pnpm dev, sign in through
   the real auth route, then open /notifications and explicitly enable
   browser notifications.

The Firebase Admin service-account JSON belongs only to the backend
Notification service under its ignored secrets/firebase/ directory. Do not
put that JSON, a private key, or any backend service API key in this project or
in a NEXT_PUBLIC_* variable.
