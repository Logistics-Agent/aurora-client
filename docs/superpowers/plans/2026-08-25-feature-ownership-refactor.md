# Feature Ownership Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce layered feature/sub-feature ownership and replace multi-route workspace monoliths with meaningful page composition indexes.

**Architecture:** Top-level features retain only concerns reused by sibling sub-features. Every route-owned screen receives its own nested sub-feature whose `index.tsx` composes the page; route adapters continue importing the top-level public feature entry. Existing mock interactions and visual behavior are preserved.

**Tech Stack:** Next.js App Router, React 19, strict TypeScript, Tailwind CSS, Zustand where already used, Vitest and Testing Library.

**Spec:** `/home/kaito/project/aurora-client/rules.md`

## Global Constraints

- Follow `/home/kaito/project/aurora-client/AGENTS.md`, `rules.md` and the V3 architecture pack.
- Preserve all current routes, UI states and local fixture interactions.
- Do not add APIs, backend data hooks or dependencies.
- Keep `app/**/page.tsx` files thin.
- Do not commit, reset or discard unrelated work.

---

### Task 1: Structural contract and regression test

**Files:**

- Create: `rules.md`
- Modify: `AGENTS.md`
- Create: `src/features/feature-architecture.test.ts`

**Interfaces:**

- Produces a static architecture test that rejects known multi-route workspace monoliths and verifies required nested page composition indexes.

- [ ] Write the architecture test with the expected nested index paths.
- [ ] Run it and verify RED against the existing monolith structure.
- [ ] Keep the test red until each expected feature slice is migrated.

### Task 2: Shipment slices

**Files:**

- Replace: `src/features/shipment/index.tsx`
- Create: `src/features/shipment/components/shipment-table.tsx`
- Create: `src/features/shipment/shipments/index.tsx`
- Create: `src/features/shipment/shipment-detail/index.tsx`
- Create: `src/features/shipment/create-shipment/index.tsx`
- Create: `src/features/shipment/import-shipments/index.tsx`
- Delete: `src/features/shipment/components/shipment-workspace.tsx`

**Interfaces:**

- Produces `ShipmentsPage`, `ShipmentDetailPage`, `CreateShipmentPage` and `ImportShipmentsPage` from meaningful nested indexes.
- Preserves search/selection, shipment tabs/map, six-step creation and import validation.

- [ ] Add nested indexes and move each existing interaction to its owner.
- [ ] Make the top-level index compose the public route page functions.
- [ ] Run shipment-focused and architecture tests.

### Task 3: Administration and commercial slices

**Files:**

- Replace: `src/features/administration/index.tsx`
- Create nested indexes for `users`, `roles`, `tenant-settings`, `audit-log`, `ai-operations`, `ai-execution-detail`.
- Replace: `src/features/commercial/index.tsx`
- Create nested indexes for `cost-estimate`, `negotiations`, `negotiation-detail`, `billing`, `invoice-detail`.
- Delete the two multi-route workspace files.

**Interfaces:**

- Dynamic IDs flow into detail composition instead of being discarded.
- Existing role/user, offer and confirmation interactions remain local and functional.

- [ ] Split administration screens and run architecture/type tests.
- [ ] Split commercial screens and run architecture/type tests.

### Task 4: Documents and compliance slices

**Files:**

- Replace the documents and compliance top-level indexes.
- Create `document-center`, `upload-document`, `ocr-review`, `compliance-center` and `compliance-detail` nested indexes.
- Place shared interactive review UI in each feature root only where two sibling screens reuse it.
- Delete the two multi-route workspace files.

**Interfaces:**

- Document and finding identifiers flow into detail compositions.
- Approval and resolution transitions remain fixture-only.

- [ ] Split document routes and verify approval interactions.
- [ ] Split compliance routes and verify resolution interactions.

### Task 5: Email and notification slices

**Files:**

- Replace the email-agent and notification top-level indexes.
- Create `inbox`, `email-detail` and `notification-center` nested composition indexes.
- Delete the old workspace wrappers.

**Interfaces:**

- Email detail consumes `emailId` instead of discarding it.
- Local approval/read behavior is preserved.

- [ ] Split email routes and notification composition.
- [ ] Run architecture and behavior tests.

### Task 6: Final architecture and runtime QA

### Task 6: Remaining feature compositions

**Files:**

- Split Auth into `login`, `forgot-password` and `select-tenant` nested indexes with a shared root frame.
- Move Route Tracking page composition into `route-planning`, `live-map` and `shipment-tracking` indexes.
- Move Customer Portal page composition into nine nested sub-feature indexes.
- Move single-screen Command Center and AI Assistant composition into their root indexes.

**Interfaces:**

- Every route-owned screen has a meaningful page composition index.
- No `*-workspace.tsx` remains as the sole owner of page composition.

- [ ] Extend the structural test and verify RED for remaining workspace paths.
- [ ] Migrate Auth and single-screen feature compositions.
- [ ] Migrate Route Tracking and Customer Portal compositions.
- [ ] Run structural, behavior and type tests.

### Task 7: Final architecture and runtime QA

**Files:**

- Modify: `docs/ui-implementation/phase-status.md`

**Interfaces:**

- Produces documented evidence for architecture, format, tests, lint, typecheck and production build.

- [ ] Remove all obsolete workspace references and confirm no cross-feature UI imports.
- [ ] Format the project.
- [ ] Run full tests, lint, typecheck and `next build --webpack`.
- [ ] Record exact validation results without claiming unavailable browser checks.
