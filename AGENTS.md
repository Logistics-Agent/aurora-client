<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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

### Ownership rules for hooks and feature files

The two `hooks` levels have different responsibilities and must not be mixed:

- `src/hooks/queries/<domain>/` contains TanStack Query hooks for server reads. These hooks call a domain service, define query lifecycle options, and own cache invalidation or query keys. They do not contain form state, dialog state, selected-row state, input handlers, or page composition.
- `src/hooks/mutations/<domain>/` contains TanStack mutation hooks for server writes. These hooks call a domain service and update or invalidate the relevant cache. They do not own local UI state or render product behavior.
- `src/features/<feature>/hooks/` contains feature-local UI and composition hooks that are shared by two or more sub-features of that feature. Examples include a shared review workflow, feature-level selection state, or a browser lifecycle that belongs only to that feature.
- `src/features/<feature>/<sub-feature>/hooks/` contains hooks used only by that sub-feature. Form state, step transitions, dialog state, draft values, local filtering, and event handlers belong here when they are not shared elsewhere.
- A hook used by only one component stays beside that component. Do not create a feature hook for a single trivial callback or to avoid keeping a small piece of local state near its owner.

The same ownership rule applies to every feature directory:

- Root `components/`, `constants/`, `types/`, `utils/`, `lib/`, `mock/`, and `stores/` are for code shared by multiple sub-features of the same feature.
- Use the singular directory name `lib/`; do not introduce a parallel `libs/` directory. Keep feature-specific infrastructure in the feature or sub-feature `lib/`, and keep genuinely reusable infrastructure in `src/lib/`.
- A sub-feature owns its own `components/`, `constants/`, `types/`, `utils/`, `lib/`, `mock/`, and `stores/` when that code serves only that workflow. Add `dialogs/`, `drawers/`, `sections/`, `tabs/`, or `workflows/` only when the sub-feature actually has that responsibility.
- A file must move to the feature root only after it is genuinely consumed by multiple sub-features. A file must move to a shared `src/` folder only after it is genuinely consumed by independent business features.
- Do not leave ingestion, promotion, search, review, upload, or other independent workflows together in one root `components/` or `hooks/` folder merely because they use the same domain API.
- Do not create empty placeholder directories. The required structure describes ownership; only create a directory when it contains a real owner.

### Sub-feature boundaries and imports

Treat each sub-feature as an independently understandable page or workflow:

```text
src/features/<feature>/<sub-feature>/
├── components/       # UI owned by this workflow
├── constants/         # labels, defaults, and options owned by this workflow
├── hooks/             # local UI/composition state owned by this workflow
├── types/             # workflow-only contracts
├── utils/             # workflow-only pure helpers and validation
└── index.tsx          # public workflow composition
```

- A sub-feature may import shared primitives from its feature root and server hooks from `src/hooks/queries` or `src/hooks/mutations`.
- A sub-feature must not import another sub-feature's internal file. If both need the code, promote it to the feature root; if unrelated features need it, promote it to the appropriate shared root.
- The feature root `index.tsx` may compose sub-feature public `index.tsx` entries. It should not reach into another sub-feature's private components, hooks, constants, or utils.
- A sub-feature `index.tsx` is the public boundary for that workflow. Route adapters and feature composition should import that entry instead of deep-linking to internal files.
- Root feature components may compose more than one sub-feature only when they are explicitly shared workflow primitives. Otherwise, keep page composition inside the owning sub-feature.
- Do not use barrel exports to hide an invalid ownership boundary. Export a file only when its public owner is clear.

Use this decision order before adding a file:

1. List every current consumer of the behavior.
2. Put it beside the component when there is one consumer.
3. Put it in the sub-feature when every consumer belongs to one workflow.
4. Promote it to the feature root when at least two sub-features consume it.
5. Promote it to a shared `src/` location only when independent features consume it.

For example, a corpus feature with independent ingestion, promotion, and search workflows should be organized like this:

```text
src/features/corpus/
├── regulatory-ingestion/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   └── index.tsx
├── knowledge-promotion/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   └── index.tsx
├── regulatory-search/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   └── index.tsx
└── index.tsx
```

The API service, query keys, DTO parser, and server hooks for those workflows still stay in their canonical domain locations. Only the UI and local composition behavior is owned by the sub-features.

### Types, validation, mocks, and tests by owner

- External response shapes and boundary parsers belong in `src/dto/<domain>/`. Do not copy those DTOs into a feature subdirectory.
- Feature-only state, form, and component contracts belong in the nearest owning `types/` directory. Keep a type beside a component only when it is not reused.
- Pure validation or formatting used by one workflow belongs in that workflow's `utils/`; reusable external payload validation belongs in the DTO parser.
- Mocks belong beside the feature or sub-feature that owns the UI using them, must be visibly UI-only, and must never be used as a fallback for a live API response.
- Tests should follow the code owner: API/service and DTO tests stay with their domain data layer, shared feature composition tests stay at the feature root, and workflow-specific UI or hook tests stay in the sub-feature directory.
- When moving a file, move its tests and mocks with it, update imports, and run the feature's tests before committing. Do not leave compatibility copies in the old folder.

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

<!-- END:nextjs-agent-rules -->
