<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aurora Client Engineering Rules

## Project scope and stack

- Next.js App Router, React and strict TypeScript.
- Tailwind CSS, shadcn/ui, Radix primitives and Lucide icons.
- TanStack Query for server state and Zustand only for client interaction or spatial state.
- Axios through the shared HTTP client, Zod for external-data validation, Vitest and React Testing Library for tests.
- MapLibre, Three.js, React Three Fiber, Drei, GSAP and Recharts are used only where the feature requires them.

## Canonical source structure

Use these locations as the default ownership map. Do not introduce alternative folders with the same responsibility.

```text
src/
├── app/                         # Next.js routes and route groups only
├── api/
│   ├── services/                # HTTP service objects, one file per domain
│   └── query-keys/              # TanStack Query key factories, one file per domain
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── common/                  # genuinely cross-feature UI
│   └── layout/                  # application shells and layout UI
├── configs/                     # environment, controller and navigation config
├── dto/<domain>/                # external API DTOs, parsers and validators
├── features/<feature>/          # product feature UI and feature-owned behavior
├── hooks/
│   ├── queries/<domain>/        # TanStack Query hooks
│   └── mutations/<domain>/      # TanStack mutation hooks
├── lib/                         # shared infrastructure and framework utilities
├── providers/                   # application providers
├── stores/                      # cross-feature client/spatial state only
├── types/                       # shared domain and transport types
├── utils/                       # shared pure utilities only when truly reused
└── constants/                   # shared constants only when truly reused
```

### API and data-layer rules

The canonical flow is:

```text
Feature UI
→ src/hooks/queries or src/hooks/mutations
→ src/api/services
→ src/lib/api
→ backend
```

- Components must not call Axios or `api` directly.
- Services use an object API, for example `notificationService.getNotifications`.
- Controller paths live in `src/configs/api.ts`; do not scatter endpoint strings through components.
- Query keys live in `src/api/query-keys/<domain>.keys.ts` and expose an `all` root key.
- DTOs for external responses live in `src/dto/<domain>/<domain>.dto.ts`.
- Validate untrusted API or Firebase payloads at the boundary with a DTO parser or a focused validator.
- Keep one shared HTTP client in `src/lib/api.ts`. Do not create another Axios client under `src/api/client` or inside a feature.
- Keep one canonical shared `ApiError` in `src/lib/api-error.ts`.
- Do not duplicate `ApiEnvelope`, pagination or notification response types in multiple folders.

## Feature and nested-feature ownership

Every business feature under `src/features` owns its product UI and the narrowest behavior required to compose that UI.
This is the universal structure for every feature and nested sub-feature, not only Notification or Route Tracking.
Create only the directories that the feature actually uses; the tree below is an ownership contract, not a requirement to create empty folders.

```text
src/features/<feature>/
├── components/                  # feature-wide UI components
├── constants/                   # feature-wide constants
├── dto/                         # feature-owned transport shapes, when needed
├── hooks/                       # local UI/composition hooks only
├── lib/                         # feature-specific infrastructure
├── mock/                        # UI-only fixtures, when needed
├── stores/                      # feature client/spatial state, when needed
├── types/                       # feature-only types
├── utils/                       # feature-only pure helpers
├── <sub-feature>/               # independent page/workflow area
└── index.tsx                    # meaningful feature/page composition
```

A nested sub-feature repeats the same structure only when it has its own responsibility:

```text
src/features/<feature>/<sub-feature>/
├── components/
├── constants/
├── dto/
├── dialogs/
├── drawers/
├── hooks/
├── lib/
├── mock/
├── sections/
├── stores/
├── tabs/
├── types/
├── utils/
├── workflows/
└── index.tsx
```

Create only the folders that are used. Keep a concern at the narrowest owner:

- Used by one component: keep it beside that component.
- Used by one sub-feature: keep it inside that sub-feature.
- Used by multiple sub-features of one feature: promote it to the feature root.
- Used by independent features: promote it to the appropriate shared root folder.
- Every new feature and independent nested workflow follows this same local-first contract.
- A nested sub-feature may repeat `components`, `constants`, `dto`, `hooks`, `lib`, `mock`, `stores`, `types`, and `utils`; add `dialogs`, `drawers`, `sections`, `tabs`, or `workflows` only when that responsibility is real.
- Feature, domain and form-contract types belong in the nearest owning `types/` directory. Component-only props may remain beside the component when they are not part of a reusable contract.
- Reusable pure form validation belongs in the nearest owning `utils/` directory. Do not create `schemas/` directories; external-data parsing and validation remains at the DTO boundary.
- Do not place feature-specific UI, state, helpers, DTOs, validators, or fixtures in shared folders merely because a shared folder exists.
- Do not create shared abstractions for hypothetical reuse.
- Do not import another business feature's UI to assemble a page.

### Notification feature example

Notification server data remains in the canonical root data layer, while notification UI behavior stays feature-owned:

```text
src/features/notifications/
├── components/                  # list, empty state, FCM permission UI
├── constants/
├── hooks/                       # FCM browser lifecycle hook
├── lib/                         # Firebase/browser/device helpers
├── mock/
├── notification-center/         # full notification page composition
├── notification-panel/          # sidebar/panel composition
├── popup/                       # foreground FCM popup workflow
│   ├── components/
│   ├── constants/
│   ├── lib/
│   ├── types/
│   └── index.tsx
├── types/
├── utils/
└── index.tsx

src/api/services/notifications.service.ts
src/api/query-keys/notifications.keys.ts
src/dto/notifications/notification.dto.ts
src/hooks/queries/notifications/
src/hooks/mutations/notifications/
```

Do not put Notification list data in Zustand. TanStack Query owns it; Zustand is only appropriate for cross-screen UI state such as a persistent drawer if that state is genuinely shared.

## Routes, rendering and state

- Every `src/app/**/page.tsx` is a thin route adapter.
- Route pages import the public feature entry and pass dynamic parameters through.
- `src/features/<feature>/index.tsx` must contain meaningful page/workflow composition or orchestration. It may also re-export public components, but a file that only contains a single passive re-export is not allowed.
- Use Server Components by default. Add `"use client"` only at the lowest interactive boundary.
- TanStack Query owns remote/server state.
- Zustand owns client interaction/spatial state.
- Local React state owns isolated component interaction.
- Do not mirror Query cache data into Zustand.

## UI and dependency rules

- Use shadcn/ui primitives as infrastructure and Tailwind for product styling.
- Shared shadcn/Tailwind helpers belong in `src/lib`, with one canonical `cn` implementation.
- Do not add another UI library when an existing shadcn primitive or current stack solves the requirement.
- Keep map renderers, fallbacks and operational layers behind the common map boundary; do not duplicate map lifecycle logic in pages.
- Keep mock data visibly marked as UI-only and never present it as backend-live or realtime data.

## Quality and cleanup

- No `any`, `@ts-ignore` or unsafe casts in production code.
- Keep functions focused and prefer guard clauses over deep nesting.
- Use descriptive names; do not use display labels as business identifiers.
- Add or update tests with behavior changes, especially API boundaries, FCM permission states and navigation.
- Before claiming completion, run typecheck, lint, relevant tests, full tests when practical and a production build.
- Do not commit secrets, Firebase Admin JSON, private keys or backend service keys. Public Firebase Web config and VAPID key may be supplied through `NEXT_PUBLIC_*` environment variables.
