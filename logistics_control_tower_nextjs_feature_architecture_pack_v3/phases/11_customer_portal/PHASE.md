# PHASE 11 — CUSTOMER PORTAL

## Objective

Implement customer-safe responsive compositions.

## Before work

Read `AGENTS.md`, relevant `/docs`, and inspect current repository state.

## Scope

Create `features/customer-portal` for Overview, My Shipments, Shipment Detail, Tracking, Documents, Quotes, Invoice, AI Assistant, Notifications. Reuse stable domain/shared primitives but do not merely import staff pages and hide controls.

## Architecture requirements

- keep `app/**/page.tsx` thin
- route page imports feature root `index.tsx`
- feature-only components/hooks/constants/types/utils stay local
- TanStack Query for server state
- Zustand only for client/spatial state
- HTTP through `apis/services` → `lib/http`
- Tailwind CSS + shadcn/ui
- do not invent backend contracts

## Quality gate

Run appropriate lint, typecheck, relevant tests, and build. Fix failures.

## Stop rule

Complete and review this phase, then STOP. Do not automatically start the next phase.

## Universal feature rule

For EVERY top-level or nested feature created in this phase:

- keep feature-only `components`, `hooks`, `constants`, `types`, `utils`, `dto`, `schemas`, `stores`, `tabs`, `sections`, `workflows`, `drawers`, and `dialogs` local;
- expose an intentional public feature entry;
- keep App Router pages thin;
- use API services via `src/apis/services`;
- promote to shared only after real reuse across independent features;
- apply the same rule recursively to complex sub-features.

## V3 canonical server-data rule

All TanStack Query hooks created in this phase must live at root:

```text
src/hooks/queries/<domain>/
src/hooks/mutations/<domain>/
```

All query-key factories:

```text
src/api/query-keys/
```

All backend endpoint services:

```text
src/api/services/
```

Do not create feature-local TanStack Query query/mutation hooks.
