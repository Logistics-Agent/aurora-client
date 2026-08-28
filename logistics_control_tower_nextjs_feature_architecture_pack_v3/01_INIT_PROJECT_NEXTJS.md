# INIT PROJECT — NEXT.JS FIRST

## Objective

Initialize the frontend foundation only. Do not implement business screens in this run.

## 0 — Inspect before changing

If a frontend already exists, inspect package/config/src and integrate safely. Do not destroy valid work.

## 1 — Initialize Next.js

Use current stable `create-next-app` with:

- pnpm
- App Router
- TypeScript
- ESLint
- Tailwind CSS
- `src/` directory
- alias `@/*` → `./src/*`

Do not pin an outdated Next.js version.

## 2 — Tailwind CSS

Tailwind is mandatory.
Use the setup generated/recommended by the current Next.js/Tailwind versions.
Do not create an old Tailwind v3 config by habit when the installed version uses the current PostCSS + `@import "tailwindcss"` model.

## 3 — Initialize shadcn/ui

Use the current shadcn CLI after Next.js exists.
Configure:

- TypeScript
- CSS variables
- Lucide icons
- `src/components/ui`
- aliases under `@/*`

Install baseline components only:
button, input, textarea, select, checkbox, radio-group, switch, tabs, badge, tooltip, popover, dropdown-menu, avatar, breadcrumb, table, dialog, sheet, sonner, skeleton, progress, separator, scroll-area, command, calendar, alert, alert-dialog.

## 4 — Install dependencies

Server/data:

- `@tanstack/react-query`
- `@tanstack/react-query-devtools`
- `@tanstack/react-table`
- `axios`

Client state:

- `zustand`

Forms/validation:

- `zod`
- `react-hook-form`
- `@hookform/resolvers`

3D:

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `gsap`

Utilities:

- `recharts`
- `date-fns`
- `lucide-react`
- `sonner`

Do not install duplicates already brought by shadcn.

## 5 — Testing foundation

Configure Vitest + React Testing Library + jsdom.
Playwright may be deferred to Phase 14 if E2E is not needed immediately.

Scripts:

- dev
- build
- start
- lint
- typecheck
- test

## 6 — Initial folder skeleton

```text
src/
├── app/
├── apis/services/
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
├── config/
├── constants/
├── dto/
├── features/
├── hooks/
│   ├── query/
│   └── mutations/
├── lib/
│   ├── http/
│   ├── query/
│   └── validation/
├── providers/
├── schemas/
├── stores/
├── types/
└── utils/
```

```text
public/
├── images/
├── icons/
├── models/
└── textures/
```

Do not generate every future feature folder in this phase.

## 7 — Baseline infrastructure

Create/refine:

- `lib/http/axios-client.ts`
- `lib/http/api-error.ts`
- `lib/query/query-client.ts`
- `lib/query/query-keys.ts`
- `providers/query-provider.tsx`
- `providers/app-provider.tsx`
- `config/env.ts`
- `constants/routes.ts`
- canonical shared `cn()` utility
- `types/api.types.ts`

## 8 — Environment

Create `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_NAME=Logistics AI Control Tower
```

Do not expose secrets through public env vars.

## 9 — Approved light tokens

Configure semantic variables for:

- background `#F6F9FC`
- surface `#FFFFFF`
- secondary `#F9FBFD`
- border `#DCE5EE`
- text `#102033`
- secondary text `#6F8092`
- blue `#2F74FF`
- cyan `#53B8FF`
- success `#1DB978`
- warning `#F5A623`
- high risk `#E97818`
- critical `#F04444`
- AI `#6D5CE7`
- AI surface `#F1F0FF`
- map water `#DCEFFF`
- map land `#F8FBFD`

Light theme only for now.

## 10 — Remove starter content

Remove default Next.js tutorial/marketing content.
Do not start app screen implementation.

## 11 — README

Document stack, commands, architecture folders, state strategy, API flow, and link to `/docs`.

## 12 — Quality gate

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Fix failures.

STOP after project foundation passes.

## Universal feature rule for later phases

The initialized `src/features/` directory is not Shipment-specific.

Every product feature created later follows the same feature-local ownership model:

- `index.tsx`
- `components/`
- `hooks/query/`
- `hooks/mutations/`
- `constants/`
- `types/`
- `utils/`
- `dto/`
- `schemas/`
- optional `stores/`, `tabs/`, `sections/`, `workflows/`, `drawers/`, `dialogs/`

Do not create all of these during initialization.
This is the architecture contract for later phases.

# V3 ARCHITECTURE OVERRIDE — CENTRALIZED ROOT HOOKS + API

This section overrides older folder examples in this prompt.

Use these canonical root folders:

```text
src/
├── api/
│   ├── client/
│   ├── services/
│   └── query-keys/
├── hooks/
│   ├── queries/
│   ├── mutations/
│   └── ui/
├── stores/
├── configs/
├── constants/
├── dto/
├── types/
├── utils/
├── features/
├── components/
├── lib/
├── providers/
└── schemas/
```

Do NOT create:

```text
src/apis/
src/config/
src/hooks/query/
```

Canonical names are:

```text
src/api/
src/configs/
src/hooks/queries/
src/hooks/mutations/
```

Every server read hook:

```text
src/hooks/queries/<domain>/use-...-query.ts
```

Every server write hook:

```text
src/hooks/mutations/<domain>/use-...-mutation.ts
```

Every query key factory:

```text
src/api/query-keys/<domain>.query-keys.ts
```

Every HTTP endpoint service:

```text
src/api/services/<domain>.service.ts
```

Example:

```text
hooks/queries/shipment/use-shipment-query.ts
hooks/mutations/shipment/use-create-shipment-mutation.ts
api/query-keys/shipment.query-keys.ts
api/services/shipment.service.ts
```

Feature folders remain UI/composition-focused and do not own TanStack Query server hooks.
