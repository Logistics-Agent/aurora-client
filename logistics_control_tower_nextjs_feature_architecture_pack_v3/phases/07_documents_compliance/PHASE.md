# PHASE 07 — DOCUMENTS/OCR/COMPLIANCE

## Objective

Implement document and regulatory workflows.

## Before work

Read `AGENTS.md`, relevant `/docs`, and inspect current repository state.

## Scope

Create `features/documents`, `features/compliance`, and contextual Shipment tabs. Implement Document Center, Upload, OCR Processing, OCR Review, Compliance Center, Compliance Review. Human review is explicit. No unnecessary 3D.

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
