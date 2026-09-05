# Admin Mail UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete UI-only Admin Mail console with six routes, coherent local mock interactions, direct-permission variants, and tenant-scoped data.

**Architecture:** `src/features/administration/mail` owns Admin Mail workflows and one asynchronous local repository shared by its overview, resources, quarantine, and audit screens. Thin `/admin/mail/*` routes import public page compositions from `src/features/administration`. The plan consumes the presentation-only `MailboxIdentity` created by the Staff Mail plan and otherwise shares no workflow state or feature domain types with Staff Mail.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, shadcn/Radix primitives, Lucide, existing auth/common components, Vitest, and React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-04-admin-mail-ui-design.md`

## Global Constraints

- Follow `AGENTS.md`, including nearest-owner `types/` and `utils/` placement; do not create `schemas/`.
- This is UI-only: do not add Mail DTOs, API services, query keys, TanStack Query hooks, backend endpoints, dependencies, or lockfile changes.
- Every fixture module starts with `// UI-only fixture until backend integration phase.`
- Domain inventory is read-only for Tenant Admin; do not render `+ Add Domain`.
- Never expose mailbox passwords, credential reset, or `mail:system:manage`.
- Every tenant fixture has exactly one default operational mailbox; every alias targets exactly one shared mailbox.
- Base role may select the Admin shell/default navigation but never authorizes an action. Use `hasPermission` and tenant resource scope independently.
- Reuse `StatusBadge`, common system states, shadcn primitives, and `src/components/common/mail/MailboxIdentity` after Staff Mail Task 2 lands.
- If implementing before Staff Mail Task 2, coordinate that single shared-component task rather than copying `MailboxIdentity` into Admin Mail.
- No commit is authorized by this plan; review checkpoints do not run `git commit` unless the user separately requests it.

---

### Task 1: Lock Admin Mail ownership and shared-component dependency

**Files:**

- Modify: `src/features/feature-architecture.test.ts`
- Modify: `src/features/administration/index.tsx`
- Create: `src/features/administration/mail/index.tsx`
- Create: `src/features/administration/mail/overview/index.tsx`
- Create: `src/features/administration/mail/domains/index.tsx`
- Create: `src/features/administration/mail/mailboxes/index.tsx`
- Create: `src/features/administration/mail/aliases/index.tsx`
- Create: `src/features/administration/mail/quarantine/index.tsx`
- Create: `src/features/administration/mail/audit/index.tsx`

**Interfaces:**

- Produces `AdminMailPage({ section }: { section: AdminMailSection })` and public wrappers `MailOverviewPage`, `MailDomainsPage`, `MailMailboxesPage`, `MailAliasesPage`, `MailQuarantinePage`, and `MailAuditPage`.
- `AdminMailSection` is defined in the root Admin Mail `types/` created by Task 2; Task 1 may initially use literal wrapper exports but must not duplicate the type.

- [ ] Add failing architecture assertions for each six nested `administration/mail/*/index.tsx` page compositions.
- [ ] Run `pnpm test src/features/feature-architecture.test.ts` and confirm failures identify only the new missing paths.
- [ ] Add minimal focused page compositions using `EmptyState`, and export wrappers from both Mail and Administration public entries.
- [ ] Confirm `MailboxIdentity` is available from `@/components/common`; if not, stop and coordinate Staff Mail Task 2 rather than duplicating it.
- [ ] Re-run the architecture test.
- [ ] Review checkpoint: verify route-level consumers will not import nested Admin Mail files.

### Task 2: Define Admin Mail contracts, fixture factories, and selectors

**Files:**

- Create: `src/features/administration/mail/types/index.ts`
- Create: `src/features/administration/mail/mock/factories.ts`
- Create: `src/features/administration/mail/mock/fixtures.ts`
- Create: `src/features/administration/mail/utils/admin-mail-selectors.ts`
- Create: `src/features/administration/mail/utils/admin-mail-selectors.test.ts`

**Interfaces:**

- Produces `AdminMailSection`, `MailDomain`, `SharedMailbox`, `MailAlias`, `QuarantineRecord`, `MailAuditRecord`, `AdminMailResourceScope`, and filter/status types.
- Produces typed `createDomainFixture`, `createMailboxFixture`, `createAliasFixture`, `createQuarantineFixture`, and `createAuditFixture` functions accepting partial overrides.
- Produces `selectScopedAdminMailData(seed, resourceScope)`, `deriveMailOverview(data)`, `filterQuarantine(records, filters)`, and `filterAudit(records, filters)`.

- [ ] Write failing tests proving factories return deterministic IDs/defaults and never share mutable nested arrays.
- [ ] Add failing selector tests for tenant isolation, overview counts derived from source records, quarantine filters, and audit filters.
- [ ] Add a failing invariant test proving each tenant has exactly one `isDefault` mailbox and each alias has one scalar `targetMailboxId`.
- [ ] Run `pnpm test src/features/administration/mail/utils/admin-mail-selectors.test.ts` and confirm missing symbol failures.
- [ ] Implement root domain types, feature-local factories, representative fixtures, and pure selectors.
- [ ] Re-run the targeted test and inspect fixtures for forbidden domain-create/password fields.
- [ ] Review checkpoint: confirm reusable contracts are in `types/` and factories remain feature-local.

### Task 3: Implement local form contracts and validation

**Files:**

- Create: `src/features/administration/mail/mailboxes/types/index.ts`
- Create: `src/features/administration/mail/mailboxes/utils/validate-mailbox-form.ts`
- Create: `src/features/administration/mail/mailboxes/utils/validate-mailbox-form.test.ts`
- Create: `src/features/administration/mail/aliases/types/index.ts`
- Create: `src/features/administration/mail/aliases/utils/validate-alias-form.ts`
- Create: `src/features/administration/mail/aliases/utils/validate-alias-form.test.ts`

**Interfaces:**

- `MailboxFormValues` lives in `mailboxes/types` with `domainId` and `localPart`.
- `AliasFormValues` lives in `aliases/types` with `domainId`, `localPart`, and scalar `targetMailboxId`.
- `validateMailboxForm(values, assignedDomains, existingMailboxes)` and `validateAliasForm(values, assignedDomains, existingMailboxes, existingAliases)` return field-keyed error objects without side effects.

- [ ] Write failing tests for blank fields, invalid local parts, unassigned domains, duplicate full addresses, missing target mailbox, cross-domain target mismatch, and a valid result.
- [ ] Run both targeted validation tests and confirm missing implementation failures.
- [ ] Implement validation in the nearest `utils/`; do not put named form types in utility files.
- [ ] Re-run both tests and confirm aliases cannot contain an array of targets.
- [ ] Review checkpoint: verify no `schemas/` directory or `*Schema` form contract was introduced.

### Task 4: Build the Admin Mail mock repository and orchestration hook

**Files:**

- Create: `src/features/administration/mail/mock/admin-mail-repository.ts`
- Create: `src/features/administration/mail/mock/admin-mail-repository.test.ts`
- Create: `src/features/administration/mail/hooks/use-admin-mail.ts`
- Create: `src/features/administration/mail/hooks/use-admin-mail.test.tsx`
- Create: `src/features/administration/mail/components/admin-mail-access-state.tsx`

**Interfaces:**

- Produces `createAdminMailMockRepository(seed)` with async `readSnapshot`, `createMailbox`, `createAlias`, `deleteAlias`, `releaseQuarantine`, and `purgeQuarantine` methods.
- Each successful mutation updates the snapshot and appends a `MailAuditRecord`; all overview metrics are recalculated by selectors.
- Produces `useAdminMail({ user, resourceScope, repository })` returning scoped snapshot, pending/error state, derived permissions, and mutation commands.

- [ ] Write failing repository tests for mailbox quota updates, default-mailbox preservation, scalar alias target, alias deletion without mailbox deletion, release, purge, and audit append.
- [ ] Implement deterministic promise-based methods with explicit failure scenario controls and no random delays.
- [ ] Write failing hook tests proving a mutation updates overview, detail collection, and audit view from one snapshot.
- [ ] Implement the hook with React state; do not add Zustand for server-like fixture collections.
- [ ] Add access-state tests for loading, unauthenticated, forbidden, and permitted variants without role-derived action grants.
- [ ] Run repository, hook, and access-state tests.
- [ ] Review checkpoint: confirm one repository instance owns all cross-screen fixture mutations.

### Task 5: Add capability-aware Admin Mail navigation and Overview

**Files:**

- Modify: `src/configs/navigation.config.ts`
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/layout/app-sidebar.test.tsx`
- Create: `src/features/administration/mail/overview/components/mail-metric-card.tsx`
- Create: `src/features/administration/mail/overview/components/recent-mail-activity.tsx`
- Create: `src/features/administration/mail/overview/overview.test.tsx`
- Modify: `src/features/administration/mail/overview/index.tsx`

**Interfaces:**

- Navigation exposes a `MAIL ADMINISTRATION` group with Overview, Domains, Shared Mailboxes, Aliases, Quarantine, and Mail Audit destinations.
- Navigation filtering consumes direct permission values; it does not inspect labels or infer action access from role.
- Overview consumes only `deriveMailOverview(snapshot)` and recent scoped records.

- [ ] Write failing sidebar tests for the Admin Mail group, active nested route, permission-hidden items, and unchanged Staff navigation.
- [ ] Extend navigation rendering only as far as needed for labelled groups and direct capability filters; preserve the compact/expanded sidebar behavior.
- [ ] Write failing Overview tests for domain/mailbox/alias/quarantine counts, mock-data disclosure, recent threats, recent audit records, and detail links.
- [ ] Implement responsive metric cards and two recent-data sections using fixture-derived values.
- [ ] Run sidebar and Overview tests.
- [ ] Review checkpoint: confirm Overview contains no independent hard-coded counts or invented operational percentages.

### Task 6: Implement read-only Domains and interactive Mailboxes

**Files:**

- Create: `src/features/administration/mail/domains/components/domains-table.tsx`
- Create: `src/features/administration/mail/domains/drawers/dns-instructions-drawer.tsx`
- Create: `src/features/administration/mail/domains/domains.test.tsx`
- Modify: `src/features/administration/mail/domains/index.tsx`
- Create: `src/features/administration/mail/mailboxes/components/mailboxes-table.tsx`
- Create: `src/features/administration/mail/mailboxes/drawers/create-mailbox-drawer.tsx`
- Create: `src/features/administration/mail/mailboxes/mailboxes.test.tsx`
- Modify: `src/features/administration/mail/mailboxes/index.tsx`

**Interfaces:**

- Domains render assigned status, routing status, DKIM selector, mailbox usage, retention, and DNS instructions; no create-domain callback exists.
- `CreateMailboxDrawer` consumes assigned domains, `MailboxFormValues`, validation errors, pending state, and `onSubmit(values)`.
- Mailbox rows use shared `MailboxIdentity` for address/default presentation.

- [ ] Write failing Domains tests for assigned-domain rows, quota progress, DNS drawer copy controls, loading/empty/error states, and absence of `Add Domain`.
- [ ] Write failing Mailboxes tests for DEFAULT identity, permission-controlled create action, validation errors, preview address, successful creation, quota refresh, and no password/reset action.
- [ ] Run both targeted page tests.
- [ ] Implement the focused table/drawer UI with common states and shadcn primitives.
- [ ] Ensure DNS data is display-only local text and clipboard feedback is announced through an accessible status region.
- [ ] Re-run both tests.
- [ ] Review checkpoint: search these folders for `password`, `reset credentials`, and `Add Domain`; expected result is no UI control.

### Task 7: Implement single-target Aliases

**Files:**

- Create: `src/features/administration/mail/aliases/components/aliases-table.tsx`
- Create: `src/features/administration/mail/aliases/drawers/create-alias-drawer.tsx`
- Create: `src/features/administration/mail/aliases/dialogs/delete-alias-dialog.tsx`
- Create: `src/features/administration/mail/aliases/aliases.test.tsx`
- Modify: `src/features/administration/mail/aliases/index.tsx`

**Interfaces:**

- Alias rows expose one `targetMailboxId` resolved to one `MailboxIdentity`.
- Create drawer uses one target mailbox select, never a multi-select/tag input.
- Delete dialog emits the selected alias ID only after explicit confirmation.

- [ ] Write failing tests for alias address, one target mailbox, permission-controlled create/delete, local validation, successful creation, destructive confirmation, and target mailbox survival after deletion.
- [ ] Run `pnpm test src/features/administration/mail/aliases/aliases.test.tsx`.
- [ ] Implement table, drawer, and dialog with types from `aliases/types` and validation from `aliases/utils`.
- [ ] Preserve entered values after a mock failure and disable duplicate submit while pending.
- [ ] Re-run the page, validation, repository, and Overview tests to prove cross-view consistency.
- [ ] Review checkpoint: search for `targetMailboxIds`, `targets[]`, tag input, or multi-select semantics and remove them.

### Task 8: Implement secure Quarantine oversight

**Files:**

- Create: `src/features/administration/mail/quarantine/components/quarantine-table.tsx`
- Create: `src/features/administration/mail/quarantine/components/safe-message-preview.tsx`
- Create: `src/features/administration/mail/quarantine/drawers/threat-detail-drawer.tsx`
- Create: `src/features/administration/mail/quarantine/dialogs/purge-message-dialog.tsx`
- Create: `src/features/administration/mail/quarantine/quarantine.test.tsx`
- Modify: `src/features/administration/mail/quarantine/index.tsx`

**Interfaces:**

- Quarantine filters cover status and text search over sender, recipient, subject, and message ID.
- `SafeMessagePreview` accepts plain `bodyText: string`; it has no HTML prop and renders no active links/external resources.
- Release and purge callbacks remain independently gated by `mail:quarantine:release` and `mail:quarantine:delete`.

- [ ] Write failing tests for filters, score/authentication details, safe body text, release permission, purge permission, confirmation, pending/error states, and post-action status.
- [ ] Add security assertions that fixture markup is displayed as text, no external image exists, and no clickable fixture URL is created.
- [ ] Run `pnpm test src/features/administration/mail/quarantine/quarantine.test.tsx`.
- [ ] Implement table, threat drawer, safe preview, and destructive purge dialog.
- [ ] Keep records visible until purge succeeds; keep the drawer state and error context after failure.
- [ ] Re-run Quarantine, repository, Overview, and Audit-related selector tests.
- [ ] Review checkpoint: verify no `dangerouslySetInnerHTML`, iframe script allowance, or external asset request path exists.

### Task 9: Implement Mail Audit and six thin routes

**Files:**

- Create: `src/features/administration/mail/audit/components/audit-table.tsx`
- Create: `src/features/administration/mail/audit/dialogs/audit-detail-dialog.tsx`
- Create: `src/features/administration/mail/audit/audit.test.tsx`
- Modify: `src/features/administration/mail/audit/index.tsx`
- Create: `src/app/(staff)/admin/mail/overview/page.tsx`
- Create: `src/app/(staff)/admin/mail/domains/page.tsx`
- Create: `src/app/(staff)/admin/mail/mailboxes/page.tsx`
- Create: `src/app/(staff)/admin/mail/aliases/page.tsx`
- Create: `src/app/(staff)/admin/mail/quarantine/page.tsx`
- Create: `src/app/(staff)/admin/mail/audit/page.tsx`
- Create: `src/app/(staff)/admin/mail/admin-mail-routes.test.tsx`

**Interfaces:**

- Audit filters by resource type and date range, renders immutable local event records, and opens structured details read-only.
- Each route imports one public wrapper from `@/features/administration`; nested feature imports are forbidden.

- [ ] Write failing Audit tests for resource/date filters, permission denial, mutation-generated records, structured detail viewing, and absence of edit/delete controls.
- [ ] Implement Audit with generic `AppDataTable` only if its API supports accessible row actions; otherwise keep the focused table local rather than broadening the shared component speculatively.
- [ ] Write failing route tests that render all six public page wrappers.
- [ ] Add six thin route adapters with no fixture import or page-specific logic.
- [ ] Run Audit, route, architecture, navigation, and all Admin Mail tests.
- [ ] Review checkpoint: confirm `/admin/audit` remains the existing general audit page and `/admin/mail/audit` is scoped to mock Mail records.

### Task 10: Final Admin Mail verification

**Files:**

- Modify only if evidence requires it: files changed by Tasks 1–9.

- [ ] Run `pnpm test src/features/administration/mail "src/app/(staff)/admin/mail" src/components/layout/app-sidebar.test.tsx src/features/feature-architecture.test.ts`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Run `rg -n "Add Domain|reset.password|credential|mail:system:manage|targetMailboxIds|dangerouslySetInnerHTML" src/features/administration/mail` and resolve prohibited UI or data shapes.
- [ ] Run `rg -n "role\s*={2,3}|role\s*!={1,2}" src/features/administration/mail src/components/layout` and verify any role check selects only shell/persona, never an action.
- [ ] Run `rg -n "UI-only fixture" src/features/administration/mail/mock` and confirm every fixture module is labelled.
- [ ] Inspect `git diff --check` and the full diff; report unrelated pre-existing failures separately.
- [ ] Do not claim browser visual verification unless all six routes were actually exercised in a real browser.

## Execution Order and Handoff

Staff Mail Task 2 owns the only new cross-feature component, `MailboxIdentity`. After that task is available, the Admin implementer can execute Tasks 1–10 without touching Staff Mail workflows or fixtures. Admin types, validators, factories, repository, hook, and tests remain entirely within `src/features/administration/mail`.
