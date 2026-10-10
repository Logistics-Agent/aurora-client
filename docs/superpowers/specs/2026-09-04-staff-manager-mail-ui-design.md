# Staff and Manager Mail UI Design

## Objective

Build a mock-first operational mail workspace for staff and managers. The UI replaces and removes the current minimal Email Agent review screen with the shared-mailbox and thread workflow defined by the server-side Figma specifications, while keeping all fixture data visibly non-production.

## Source of Truth

- `D:/aurora/aurora-server/docs/figma/staff-mail-01-product-context.md`
- `D:/aurora/aurora-server/docs/figma/staff-mail-02-ui-spec.md`
- `D:/aurora/aurora-client/AGENTS.md`
- `D:/aurora/aurora-client/docs/PAGES_AND_AUTHORIZATION.md`

## Scope

The feature includes:

- A desktop three-pane workspace with responsive two-pane and single-pane variants.
- Queue navigation for unassigned work, the current user's work, and all accessible threads.
- A Drafts queue for in-progress human and AI-assisted drafts.
- Shared-mailbox filtering, status filtering, priority filtering, and search.
- Thread cards, conversation detail, inbound and outbound messages, attachments, and delivery state.
- Explicit claim, manager reassign, manager return-to-queue, and assignment-history flows.
- Thread priority changes and resolution by the current assignee.
- Draft composition, AI-assisted text insertion, and an explicit human send action.
- Permission-aware page and action states.
- Loading, empty, error, forbidden, claim conflict, and outbound failure states.
- Keyboard and accessibility behavior described by the UI specification.

The feature does not include:

- Personal employee inboxes.
- Admin domain, mailbox, alias, quarantine, or audit management.
- Live API integration, server-side persistence, real email delivery, or realtime subscriptions.
- Autonomous AI sending or approval.
- A rich-text editor dependency; the mock-first composer uses existing controls.

## Authorization Model

The implementation follows this order:

```text
Base role -> select persona shell and default navigation
Direct permission -> decide which tabs and actions are visible or enabled
Resource scope -> decide which tenant mailboxes and threads are visible
```

`user.role` may select the Operations shell, but it must not grant Mail actions. Staff and managers render the same `MailWorkspace`; differences come from `hasPermission(user, permission)`. For example, `mail:thread:read_all`, `mail:thread:reassign`, and `mail:thread:unassign` independently control the All Threads tab and supervisory actions.

Mock personas include realistic combinations where a manager lacks a permission or a staff user receives one directly. Resource scope is modeled separately through accessible mailbox identifiers and current-user ownership, so permission does not imply access to every tenant record.

## Routes and Legacy Removal

- `/mail` is the canonical workspace route.
- `/mail/[threadId]` opens the selected thread directly.
- Existing `/email-agent` and `/email-agent/[emailId]` routes are deleted; backward-compatible redirects are not required.
- Route files remain thin adapters and import public feature entries.

## Feature Architecture

The implementation uses a new `src/features/mail` boundary. Existing `src/features/email-agent` code and its route adapters are deleted after the new `/mail` routes and navigation are working.

```text
src/features/mail/
  components/          shared mail UI pieces
  inbox/               queue, filters, and thread list
  thread/              conversation timeline and thread header
  composer/            draft and explicit send interaction
  dialogs/             reassign and return-to-queue workflows
  drawers/             assignment history
  hooks/               mock-first interaction orchestration
  mock/                fixtures and pure mock transitions
  types/               feature-only domain types
  utils/               filtering and presentation helpers
  index.tsx             public page compositions
```

The current `email-agent` is a legacy local prototype for approving extracted carrier requests. It is not a mailbox or thread system. Its useful AI-review concept is represented inside the selected thread's AI suggestion panel; the old feature, fixtures, and routes do not remain in the codebase.

Component ownership follows reuse:

- Reuse existing primitives from `src/components/ui`.
- Place UI reused by Staff Mail and Admin Mail in `src/components/common/mail`; initially this is limited to a presentation-only `MailboxIdentity` component whose props contain primitive display data rather than either feature's domain model.
- Reuse existing generic data states and `StatusBadge` from `src/components/common` instead of creating Mail-specific duplicates.
- Keep Mail-only components under `src/features/mail/components`, even when several Mail sub-features reuse them.
- Do not promote a component to shared ownership for hypothetical reuse.

Remote-looking fixture data is not placed in Zustand or TanStack Query. The mock feature owns an in-memory fixture adapter and local composition state. Its interface mirrors future async operations so API integration can replace the adapter without rewriting presentation components.

## Mock Domain Model

The minimum model includes:

- `MailQueueScope`: `unassigned | mine | all`.
- `MailThreadStatus`: `unassigned | in_progress | waiting_customer | resolved`.
- `MailPriority`: `urgent | high | normal | low`.
- `MailThread`: identity, optimistic-concurrency version, mailbox, subject, participants, assignment, status, priority, unread state, timestamps, preview, and messages.
- `MailMessage`: direction, author attribution, shared sender address, sanitized body text, attachments, timestamp, and delivery state.
- `AssignmentEvent`: claim, reassign, and unassign events with actor, target, reason, and timestamp.
- `AiDraftSuggestion`: exact commercial parameters, confidence/evidence labels, and proposed wording.

Fixtures include enough records to demonstrate every queue, permission state, loading/empty/error state, a 409 claim conflict, a 403 reply block, and a delivery failure. UI copy labels them as demonstration data where a user could otherwise infer live backend state.

The mock adapter behaves like a remote source: operations are asynchronous, expose pending/success/error states, preserve cursor-like pagination metadata where shown, and update all dependent views consistently. No button is decorative when the specification describes an interaction.

## Interaction and State Flow

1. Route parameters establish the selected thread; URL navigation is the durable selection state.
2. Queue, mailbox, status, priority, and search filters derive a visible thread list from fixtures.
3. Claim submits the thread version and transitions an unassigned thread to the current user unless the conflict fixture returns `409 THREAD_ALREADY_ASSIGNED`.
4. Reassign and unassign require their direct capabilities and append an assignment-history event.
5. Replying to an unassigned thread first performs the explicit claim transition; it never silently claims on editor focus.
6. The current assignee can change priority and mark the thread resolved.
7. The composer selects from assigned tenant shared mailboxes and always displays the resulting shared sender identity.
8. AI assistance inserts editable wording into the draft only. Sending remains a separate human action.
9. Send appends an outbound message with authenticated-author attribution and a mock delivery state.

## Permissions

UI behavior reads direct permissions from the current user and never infers authority from role alone:

- `mail:read` controls workspace access.
- `mail:thread:read_all` controls the All Threads queue.
- `mail:thread:claim` controls claiming.
- `mail:thread:reassign` controls reassignment.
- `mail:thread:unassign` controls return-to-queue.
- `mail:draft:create` controls draft editing.
- `mail:send` controls sending.

The mock fixture layer supplies persona and resource-scope presets for visual testing, but UI decisions still call the canonical `hasPermission` helper. Role comparisons are limited to shell/persona selection.

## Responsive and Accessibility Rules

- At 1440px, render the specified three-pane workspace.
- At 1024px to 1279px, collapse queue navigation while keeping list and conversation panes.
- Below 1024px, show one navigable pane at a time with explicit back navigation.
- Preserve visible focus, semantic regions, labelled controls, `aria-live` status feedback, and keyboard actions that do not override text-entry behavior.
- Respect reduced motion and avoid layout-dependent animation.

## Error Handling

- A claim conflict refreshes assignment state, disables claim, and changes the thread to read-only when owned by another staff member.
- A forbidden reply disables the composer and identifies the current assignee without exposing unrelated tenant data.
- A send failure keeps draft content intact and offers an explicit retry.
- Empty and error states are scoped to the pane that failed; they do not blank the whole shell unnecessarily.

## Testing Strategy

- Pure unit tests cover fixture transitions, filtering, and permission-derived action state.
- Component tests cover queue navigation, direct thread routing, claim conflict, reassign/unassign, draft insertion, send failure, and responsive navigation semantics.
- Route and architecture tests verify the canonical Mail pages and absence of legacy Email Agent imports/routes.
- Accessibility assertions cover names, focus behavior, disabled/hidden permission variants, and live status regions.
- Final verification runs targeted Vitest tests, full tests when practical, typecheck, lint, and production build.

## Acceptance Criteria

- All Staff/Manager panes, queues, actions, and states explicitly described by the updated source documents are represented by working mock interactions.
- The UI clearly distinguishes shared mailbox identity from authenticated human author.
- No action is authorized by role checks or sidebar visibility.
- Staff and Manager use the same workspace while direct permissions and resource scope produce different visible tabs, actions, and records.
- AI never sends or approves mail autonomously.
- The legacy Email Agent feature, fixtures, navigation, and routes are removed after `/mail` replaces them.
- No new UI, state, or editor dependency is added.
- The feature passes targeted tests, TypeScript checking, lint, and production build.
