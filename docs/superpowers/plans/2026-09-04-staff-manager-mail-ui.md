# Staff and Manager Mail UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Email Agent prototype with a fully interactive, UI-only Staff/Manager shared-mailbox workspace backed by coherent local mock data.

**Architecture:** `/mail` and `/mail/[threadId]` are thin routes over `src/features/mail`. Staff and Manager render the same three-pane workspace; `hasPermission` controls tabs/actions and fixture resource scope controls visible records. A feature-local asynchronous mock repository and orchestration hook simulate real reads, mutations, conflicts, and delivery failures without creating production API files.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, shadcn/Radix primitives, Lucide, existing auth helpers, Vitest, and React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-04-staff-manager-mail-ui-design.md`

## Global Constraints

- Follow `AGENTS.md`, especially local-first ownership, thin route adapters, and permission rules.
- This is UI-only: do not add Mail DTOs, API services, query keys, TanStack Query hooks, backend endpoints, dependencies, or lockfile changes.
- Every fixture module starts with `// UI-only fixture until backend integration phase.`
- `user.role` may select persona shell/default navigation but must never authorize a Mail tab or action.
- Use `hasPermission(user, permission)` for direct permissions and a separate mailbox/thread resource scope for visible data.
- Staff and Manager use the same `MailWorkspace`; do not create role-specific duplicate screens.
- Feature/domain/form types live in the nearest `types/`; reusable pure validation/filtering lives in the nearest `utils/`; do not create `schemas/`.
- Reuse existing `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, and shadcn primitives.
- The legacy `src/features/email-agent` and both `/email-agent` routes are deleted only after `/mail` passes its route and navigation tests.
- Do not commit, delete, or rename files during execution unless the user explicitly authorizes that action. The user has authorized deletion of the legacy Email Agent files for this plan; commits still require separate authorization.

---

### Task 1: Lock the Mail ownership and route architecture

**Files:**

- Modify: `src/features/feature-architecture.test.ts`
- Create: `src/features/mail/index.tsx`
- Create: `src/features/mail/inbox/index.tsx`
- Create: `src/features/mail/thread/index.tsx`

**Interfaces:**

- Produces `MailPage({ initialThreadId?: string }: MailPageProps): React.JSX.Element` from `src/features/mail/index.tsx`.
- Produces focused `MailInbox` and `MailThreadPanel` compositions; neither route imports internal sub-feature files directly.

- [ ] Add failing architecture assertions for `mail/inbox/index.tsx` and `mail/thread/index.tsx`.
- [ ] Run `pnpm test src/features/feature-architecture.test.ts` and confirm the failure names the missing Mail ownership paths.
- [ ] Add minimal page compositions exporting `MailPage`, `MailInbox`, and `MailThreadPanel`, using existing `EmptyState` as temporary render content.
- [ ] Re-run the architecture test and confirm the new Mail ownership checks pass.
- [ ] Review checkpoint: inspect the diff; do not commit unless explicitly requested.

### Task 2: Add shared mailbox identity presentation

**Files:**

- Create: `src/components/common/mail/types/index.ts`
- Create: `src/components/common/mail/mailbox-identity.tsx`
- Create: `src/components/common/mail/mailbox-identity.test.tsx`
- Create: `src/components/common/mail/index.ts`
- Modify: `src/components/common/index.ts`

**Interfaces:**

- Produces `MailboxIdentityProps` in the nearest `types/` with `address: string`, `label?: string`, `isDefault?: boolean`, and `status?: "active" | "suspended"`.
- Produces `MailboxIdentity(props: MailboxIdentityProps)` as a presentation-only component with no Staff/Admin domain imports and no permission checks.

- [ ] Write a failing component test asserting address, optional label, DEFAULT badge, status text, and accessible grouping.
- [ ] Run `pnpm test src/components/common/mail/mailbox-identity.test.tsx` and confirm failure because the component is absent.
- [ ] Implement the primitive with existing `StatusBadge` and semantic text; omit absent optional fields instead of rendering empty labels.
- [ ] Export through both Mail common and common root barrels.
- [ ] Re-run the targeted test and `pnpm test src/features/feature-architecture.test.ts`.
- [ ] Review checkpoint: confirm the component accepts only primitive display props and imports no feature code.

### Task 3: Define Staff Mail contracts, fixtures, and pure selectors

**Files:**

- Create: `src/features/mail/types/index.ts`
- Create: `src/features/mail/mock/factories.ts`
- Create: `src/features/mail/mock/fixtures.ts`
- Create: `src/features/mail/utils/thread-selectors.ts`
- Create: `src/features/mail/utils/thread-selectors.test.ts`

**Interfaces:**

- Produces `MailQueueScope = "unassigned" | "mine" | "all" | "drafts"`.
- Produces `MailThreadStatus = "unassigned" | "in_progress" | "waiting_customer" | "resolved"` and `MailPriority = "low" | "normal" | "high" | "urgent"`.
- Produces `MailThread`, `MailMessage`, `MailAttachment`, `AssignmentEvent`, `AiDraftSuggestion`, `MailResourceScope`, `MailListFilters`, and `MailPersonaFixture`.
- Produces typed `createMailThreadFixture(overrides)`, `createMailMessageFixture(overrides)`, and `createMailPersonaFixture(overrides)` builders for deterministic scenarios and tests.
- Produces `selectVisibleThreads(threads, filters, userId, resourceScope)` and `selectVisibleMailboxes(mailboxes, resourceScope)` without mutating inputs.

- [ ] Write failing selector tests with literal thread IDs proving mailbox scope, `mine`, `unassigned`, `all`, drafts, status, priority, and case-insensitive search behavior.
- [ ] Include a test proving `all` returns no records when `mail:thread:read_all` is absent at the caller boundary.
- [ ] Run `pnpm test src/features/mail/utils/thread-selectors.test.ts` and confirm missing-contract failures.
- [ ] Implement types, feature-local fixture factories, deterministic fixtures for STAFF, restricted MANAGER, and fully capable MANAGER personas, and the smallest pure selectors.
- [ ] Include threads for success, `THREAD_ALREADY_ASSIGNED`, cross-staff forbidden reply, and outbound delivery failure scenarios.
- [ ] Re-run the targeted test and confirm no fixture is labeled live or realtime.
- [ ] Review checkpoint: confirm form/domain contracts are in `types/`, not fixture or utility files.

### Task 4: Build the asynchronous mock repository and workspace hook

**Files:**

- Create: `src/features/mail/mock/mail-repository.ts`
- Create: `src/features/mail/mock/mail-repository.test.ts`
- Create: `src/features/mail/hooks/use-mail-workspace.ts`
- Create: `src/features/mail/hooks/use-mail-workspace.test.tsx`

**Interfaces:**

- Produces `createMailMockRepository(seed): MailMockRepository` with async `listThreads`, `getThread`, `claimThread`, `reassignThread`, `unassignThread`, `setPriority`, `markResolved`, `saveDraft`, and `sendMessage` methods.
- `claimThread(threadId, expectedVersion, userId)` rejects with `{ status: 409, code: "THREAD_ALREADY_ASSIGNED" }` when ownership/version changed.
- Produces `useMailWorkspace({ user, resourceScope, initialThreadId, repository })`, returning filters, selected thread, loading/error state, permission-derived flags, and mutation commands.

- [ ] Write failing repository tests for immutable transitions, version increments, mandatory reassignment reason, assignment-history append, retained draft after send failure, and successful outbound author attribution.
- [ ] Run `pnpm test src/features/mail/mock/mail-repository.test.ts` and confirm missing repository failures.
- [ ] Implement deterministic async methods with a zero-delay promise boundary; expose explicit scenario toggles rather than random failure.
- [ ] Write failing hook tests proving filter changes refresh visible results and all mutations keep queue/list/detail views consistent.
- [ ] Implement the hook with React state and effects at the lowest client boundary; do not add Zustand or mirror data into a second store.
- [ ] Run both targeted test files and confirm passing behavior.
- [ ] Review checkpoint: confirm repository operations are the only fixture mutation boundary.

### Task 5: Implement queue navigation and thread list

**Files:**

- Create: `src/features/mail/inbox/types/index.ts`
- Create: `src/features/mail/inbox/components/queue-navigation.tsx`
- Create: `src/features/mail/inbox/components/thread-filters.tsx`
- Create: `src/features/mail/inbox/components/thread-card.tsx`
- Create: `src/features/mail/inbox/components/thread-list.tsx`
- Create: `src/features/mail/inbox/inbox.test.tsx`
- Modify: `src/features/mail/inbox/index.tsx`

**Interfaces:**

- `QueueNavigation` consumes queue counts, active queue, `onQueueChange`, and `showAllThreads`; it never accepts a role.
- `ThreadFilters` consumes `MailListFilters` and emits complete filter values.
- `ThreadCard` consumes one `MailThread`, current user ID, and selection/claim callbacks.

- [ ] Write failing tests for Unassigned, My Work, Drafts, capability-gated All Threads, mailbox filtering, status/priority filtering, search, unread state, priority flag, selected state, and quick claim.
- [ ] Run `pnpm test src/features/mail/inbox/inbox.test.tsx` and confirm failures are limited to missing inbox UI.
- [ ] Implement the 200px queue pane and 380px thread pane with keyboard-operable controls and existing shadcn primitives.
- [ ] Use `MailboxIdentity` for shared-address presentation; use `StatusBadge` for thread status.
- [ ] Render pane-scoped loading, empty, and retryable error states with existing common components.
- [ ] Re-run the targeted tests and verify tab/action presence is permission-derived.
- [ ] Review checkpoint: confirm no `user.role === "MANAGER"` authorization logic exists.

### Task 6: Implement conversation timeline and supervisory workflows

**Files:**

- Create: `src/features/mail/thread/components/thread-header.tsx`
- Create: `src/features/mail/thread/components/message-timeline.tsx`
- Create: `src/features/mail/thread/components/inbound-message.tsx`
- Create: `src/features/mail/thread/components/outbound-message.tsx`
- Create: `src/features/mail/dialogs/reassign-thread-dialog.tsx`
- Create: `src/features/mail/dialogs/types/index.ts`
- Create: `src/features/mail/dialogs/utils/validate-reassignment.ts`
- Create: `src/features/mail/dialogs/return-to-queue-dialog.tsx`
- Create: `src/features/mail/drawers/assignment-history-drawer.tsx`
- Create: `src/features/mail/thread/thread-workflows.test.tsx`
- Modify: `src/features/mail/thread/index.tsx`

**Interfaces:**

- `ThreadHeader` emits claim, priority, resolve, reassign, unassign, and history intents while receiving booleans derived by the workspace hook.
- `ReassignmentFormValues` lives in `dialogs/types`; `validateReassignment(values)` lives in `dialogs/utils` and requires target user plus a non-blank business reason.
- Timeline cards expose shared sender identity and authenticated human attribution as separate fields.

- [ ] Write failing tests for selected-thread content, sanitized text bodies, attachment buttons, shared sender/human author distinction, priority/resolution actions, and permission-gated supervisory controls.
- [ ] Add failing interaction tests for reassign validation, successful reassign, return-to-queue reason, assignment-history order, and 409 claim conflict changing the panel to read-only.
- [ ] Run `pnpm test src/features/mail/thread/thread-workflows.test.tsx` and confirm expected missing UI failures.
- [ ] Implement the flexible conversation pane, focused dialogs/drawer, and pane-level conflict/forbidden alerts.
- [ ] Render fixture body content as React text; do not use `dangerouslySetInnerHTML`.
- [ ] Re-run the targeted tests and confirm focus returns to the invoking control after dialogs/drawer close.
- [ ] Review checkpoint: confirm Staff and Manager use the same components and differ only through capability props.

### Task 7: Implement composer and governed AI suggestion

**Files:**

- Create: `src/features/mail/composer/types/index.ts`
- Create: `src/features/mail/composer/utils/validate-mail-draft.ts`
- Create: `src/features/mail/composer/utils/validate-mail-draft.test.ts`
- Create: `src/features/mail/composer/components/ai-draft-suggestion.tsx`
- Create: `src/features/mail/composer/components/reply-composer.tsx`
- Create: `src/features/mail/composer/composer.test.tsx`
- Create: `src/features/mail/composer/index.tsx`
- Modify: `src/features/mail/thread/index.tsx`

**Interfaces:**

- `MailDraftFormValues` lives in `composer/types` with `senderMailboxId`, `body`, and `attachmentIds`.
- `validateMailDraft(values, allowedMailboxIds)` lives in `composer/utils` and rejects blank bodies or out-of-scope sender mailboxes.
- `AiDraftSuggestion` only emits `onInsert(text)`; it has no send callback.
- `ReplyComposer` emits explicit save and send intents and preserves entered content after errors.

- [ ] Write failing validation tests for blank body, inaccessible sender mailbox, and a valid draft.
- [ ] Write failing component tests for sender selection, AI insertion, subsequent human editing, save state, explicit send, permission-disabled composer, reply-to-claim, and retained draft after delivery failure.
- [ ] Run both targeted composer tests and confirm missing behavior failures.
- [ ] Implement the composer using existing textarea/select/button primitives without adding an editor package.
- [ ] Require explicit claim before sending from an unassigned thread; focusing or typing must never claim automatically.
- [ ] Re-run targeted tests and confirm AI insertion never triggers save or send.
- [ ] Review checkpoint: inspect event handlers for a single explicit human send path.

### Task 8: Compose responsive workspace and direct-thread behavior

**Files:**

- Create: `src/features/mail/components/mail-workspace.tsx`
- Create: `src/features/mail/components/mail-access-state.tsx`
- Create: `src/features/mail/mail-workspace.test.tsx`
- Modify: `src/features/mail/index.tsx`

**Interfaces:**

- `MailWorkspace({ user, resourceScope, initialThreadId, repository })` composes all three panes.
- `MailAccessState` distinguishes loading, unauthenticated, forbidden, and permitted states using `mail:read`.
- `initialThreadId` selects a scoped thread or shows a not-found/forbidden-safe empty state without leaking cross-scope data.

- [ ] Write failing integration tests for Staff, restricted Manager, fully capable Manager, direct thread selection, forbidden workspace, and cross-scope thread ID.
- [ ] Add viewport-oriented tests for desktop three-pane landmarks, mid-width collapsed queue navigation, and narrow single-pane back navigation.
- [ ] Run `pnpm test src/features/mail/mail-workspace.test.tsx` and confirm missing composition failures.
- [ ] Implement the client boundary and responsive Tailwind layout; preserve route selection as the durable selected-thread state.
- [ ] Add labelled regions, visible focus, `aria-live="polite"` mutation feedback, and reduced-motion-safe transitions.
- [ ] Re-run integration and all Mail tests.
- [ ] Review checkpoint: verify the UI remains useful at 1440px, 1280px, 1024px, and narrow mobile widths.

### Task 9: Add canonical routes/navigation and remove Email Agent

**Files:**

- Create: `src/app/(staff)/mail/page.tsx`
- Create: `src/app/(staff)/mail/[threadId]/page.tsx`
- Create: `src/app/(staff)/mail/mail-routes.test.tsx`
- Modify: `src/configs/navigation.config.ts`
- Modify: `src/components/layout/app-sidebar.test.tsx`
- Modify: `src/features/feature-architecture.test.ts`
- Delete: `src/app/(staff)/email-agent/page.tsx`
- Delete: `src/app/(staff)/email-agent/[emailId]/page.tsx`
- Delete: `src/features/email-agent/index.tsx`
- Delete: `src/features/email-agent/inbox/index.tsx`
- Delete: `src/features/email-agent/email-detail/index.tsx`
- Delete: `src/features/email-agent/components/email-review.tsx`
- Delete: `src/features/email-agent/mock/index.ts`

**Interfaces:**

- `/mail` renders `MailPage` and `/mail/[threadId]` awaits `params: Promise<{ threadId: string }>` before passing `initialThreadId`.
- Navigation exposes Mail with capability `mail:read` and no Email Agent entry.

- [ ] Write failing route tests for canonical list/detail adapters and a navigation test for the Mail item.
- [ ] Run the targeted route/sidebar tests and confirm failures precede route creation.
- [ ] Add thin canonical route adapters and update navigation without role-based label filtering for Mail.
- [ ] Run route, sidebar, and Mail integration tests.
- [ ] Search with `rg -n "email-agent|EmailAgent|EmailReview|EmailMock" src` and record remaining legacy references.
- [ ] Delete only the listed authorized legacy files after the search confirms no unrelated consumers.
- [ ] Add and enable architecture assertions that `src/features/email-agent` and both legacy route pages are absent.
- [ ] Re-run `pnpm test src/features/feature-architecture.test.ts "src/app/(staff)/mail/mail-routes.test.tsx" src/components/layout/app-sidebar.test.tsx`.
- [ ] Review checkpoint: confirm deletion is limited to the authorized legacy feature/routes.

### Task 10: Final Staff Mail verification

**Files:**

- Modify only if evidence requires it: files changed by Tasks 1–9.

- [ ] Run `pnpm test src/features/mail src/components/common/mail "src/app/(staff)/mail" src/features/feature-architecture.test.ts src/components/layout/app-sidebar.test.tsx`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Run `rg -n "role\s*={2,3}\s*[\"']MANAGER|role\s*={2,3}\s*[\"']STAFF|email-agent|EmailAgent" src` and resolve any action authorization or legacy references.
- [ ] Run `rg -n "dangerouslySetInnerHTML|UI-only fixture" src/features/mail` and confirm no unsafe message rendering and that fixture modules are labelled.
- [ ] Inspect `git diff --check` and the full diff; report unrelated pre-existing failures separately.
- [ ] Do not claim browser visual verification unless the workspace was actually exercised in a real browser.

## Execution Order and Handoff

Tasks 1–4 establish contracts and state. Tasks 5–8 build the same Staff/Manager UI over those contracts. Task 9 performs the explicitly authorized legacy deletion only after replacement tests pass. Task 2 owns `src/components/common/mail/mailbox-identity.tsx`; the Admin Mail plan consumes that shared component after this task lands.
