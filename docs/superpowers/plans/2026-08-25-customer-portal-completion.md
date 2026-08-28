# Customer Portal Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder customer portal with all nine customer workspaces and seven responsive mobile states defined by Figma.

**Architecture:** Thin customer routes keep importing the feature public entry. The feature owns focused workspaces, typed fixtures, pure utils and a local Zustand store; only stable shared UI primitives are reused. `CustomerShell` provides a desktop sidebar and mobile bottom navigation.

**Tech Stack:** Next.js App Router, React 19, strict TypeScript, Tailwind CSS, shadcn/Radix primitives, Zustand, Lucide, Vitest and Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-25-customer-portal-completion-design.md`

## Global Constraints

- Follow `/home/kaito/project/aurora-client/AGENTS.md` and the V3 architecture pack.
- Use feature-local `mock/`, `types/`, `utils/`, `stores/`, `components/` and `workspaces/` ownership.
- Every fixture file contains `// UI-only fixture until backend integration phase.`
- Customer Portal never exposes internal operations, admin, commercial strategy, exact GPS device administration or other-customer data.
- Do not add API calls, fake endpoints or backend integrations.
- Do not commit or push; the workspace is not a Git repository.

---

### Task 1: Customer domain fixtures and pure selectors

**Files:**

- Create: `src/features/customer-portal/types/index.ts`
- Replace: `src/features/customer-portal/mock/index.ts`
- Create: `src/features/customer-portal/utils/customer-portal-utils.ts`
- Test: `src/features/customer-portal/utils/customer-portal-utils.test.ts`

**Interfaces:**

- Produces `CustomerShipment`, `CustomerDocument`, `CustomerQuote`, `CustomerInvoice`, `CustomerNotification`, `CustomerPreference` and map/milestone types.
- Produces `filterCustomerShipments(shipments, query, status)` and immutable transition helpers for quote confirmation, notification read state and preferences.

- [ ] Write failing tests with literal expected shipment IDs for search/status filtering and literal state outputs for quote/read/preference transitions.
- [ ] Run `pnpm test src/features/customer-portal/utils/customer-portal-utils.test.ts` and confirm failures are caused by missing types/functions.
- [ ] Implement the smallest typed fixtures and pure helpers that satisfy the tests.
- [ ] Re-run the targeted test and confirm it passes.
- [ ] Refactor duplicate status labels without changing behavior, then re-run the test.

### Task 2: Responsive customer shell

**Files:**

- Modify: `src/components/layout/customer-shell.tsx`
- Test: `src/components/layout/customer-shell.test.tsx`

**Interfaces:**

- Consumes `customerNavigation`.
- Produces desktop sidebar navigation, customer workspace header and mobile four-item bottom navigation around `children`.

- [ ] Write a failing shell test that renders real navigation and asserts Overview, My Shipments, Documents and Invoices plus visible child content.
- [ ] Run the targeted test and confirm the current horizontal desktop header violates the expected sidebar landmark structure.
- [ ] Implement the responsive shell with exact customer account copy and active-route state.
- [ ] Re-run the shell test and confirm it passes.

### Task 3: Overview and shipment list

**Files:**

- Create: `src/features/customer-portal/components/customer-page-heading.tsx`
- Create: `src/features/customer-portal/components/customer-shipment-card.tsx`
- Create: `src/features/customer-portal/workspaces/overview/overview-workspace.tsx`
- Create: `src/features/customer-portal/workspaces/shipments/shipments-workspace.tsx`
- Test: `src/features/customer-portal/workspaces/customer-primary-workspaces.test.tsx`

**Interfaces:**

- Overview consumes KPI/activity/attention fixtures.
- Shipments consumes `filterCustomerShipments` and navigates to `/portal/shipments/<id>`.

- [ ] Write failing tests for four KPI values, attention review navigation, shipment search reducing visible rows, selection and the enabled “View shipment” link.
- [ ] Run the targeted test and observe failures against the placeholder implementation.
- [ ] Implement Figma-equivalent desktop table and mobile cards with local query/status/selection state.
- [ ] Re-run targeted tests and confirm all pass.

### Task 4: Shipment detail and customer-safe tracking

**Files:**

- Create: `src/features/customer-portal/workspaces/shipment-detail/shipment-detail-workspace.tsx`
- Create: `src/features/customer-portal/workspaces/tracking/tracking-workspace.tsx`
- Test: `src/features/customer-portal/workspaces/customer-shipment-context.test.tsx`

**Interfaces:**

- Detail consumes the selected customer shipment, timeline and document fixtures.
- Tracking consumes customer-safe route markers and milestone fixtures; it never renders exact coordinates or internal GPS controls.

- [ ] Write failing tests for timeline/details/documents, tracking navigation, GPS stale copy, last update, milestone advisory and absence of internal-control labels.
- [ ] Run the tests and confirm failures match missing workspaces.
- [ ] Implement detail and tracking with responsive composition and customer-safe map context.
- [ ] Re-run the tests and confirm pass.

### Task 5: Documents, quotes and invoices

**Files:**

- Create: `src/features/customer-portal/workspaces/documents/documents-workspace.tsx`
- Create: `src/features/customer-portal/workspaces/quotes/quotes-workspace.tsx`
- Create: `src/features/customer-portal/workspaces/invoices/invoices-workspace.tsx`
- Test: `src/features/customer-portal/workspaces/customer-commercial-documents.test.tsx`

**Interfaces:**

- Documents expose local search/selection/open state.
- Quotes use `confirmCustomerQuote`; invoices expose local selection/detail only.

- [ ] Write failing tests for document filtering/open state, quote confirmation and invoice selection/details.
- [ ] Run targeted tests and confirm behavior is missing.
- [ ] Implement the three focused workspaces using typed customer fixtures.
- [ ] Re-run targeted tests and confirm pass.

### Task 6: AI assistant and notifications

**Files:**

- Create: `src/features/customer-portal/stores/use-customer-portal-store.ts`
- Create: `src/features/customer-portal/workspaces/assistant/assistant-workspace.tsx`
- Create: `src/features/customer-portal/workspaces/notifications/notifications-workspace.tsx`
- Test: `src/features/customer-portal/workspaces/customer-communication.test.tsx`

**Interfaces:**

- Store owns local question, notification and preference interaction state only.
- Assistant renders complete explainability fields; notifications use immutable transition helpers.

- [ ] Write failing tests for asking a question, complete AI explainability, no-data-change disclosure, marking a notification read and toggling email preference.
- [ ] Run targeted tests and confirm expected failures.
- [ ] Implement the store and both workspaces.
- [ ] Re-run targeted tests and confirm pass.

### Task 7: Public dispatcher, removal of placeholder and final QA

**Files:**

- Replace: `src/features/customer-portal/index.tsx`
- Delete: `src/features/customer-portal/components/customer-workspace.tsx`
- Modify: `docs/ui-implementation/phase-status.md`

**Interfaces:**

- `CustomerPortalPage({ kind })` remains the stable public route-level interface.
- Each kind maps directly to one focused workspace.

- [ ] Write/update a failing integration test that renders every `CustomerKind` and observes its unique heading/content.
- [ ] Replace the monolithic conditional dispatcher with focused workspace imports.
- [ ] Run all customer portal tests.
- [ ] Run `npx prettier@3.6.2 --write` on changed files and `npx prettier@3.6.2 --check . --ignore-unknown`.
- [ ] Run `pnpm test`, `pnpm lint`, `pnpm typecheck` and `pnpm exec next build --webpack`.
- [ ] Inspect route ownership and prohibited cross-feature imports with `rg`.
- [ ] Update Phase 11 status with exact Figma nodes and validation evidence; do not claim browser visual validation unless it actually runs.
