# Mail Staff/Manager Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/mail` a production-facing Staff/Manager mail workspace backed by the existing Mail BFF APIs, with correct tenant scoping, permission-driven actions, reliable error handling, and verified thread, draft, outbound, message-history, and quarantine workflows.

**Architecture:** Keep the scope to Staff and Manager users only. The FE follows the project flow `feature UI → TanStack Query hooks → typed mail service → shared API client → Staff BFF`; there is no Admin/System Admin screen, route, hook, service method, or permission-management flow in this FE plan. The existing mock repository remains test-only, while runtime Mail data must come from the live BFF without silently falling back to fixtures or optimistic fake success.

**Tech Stack:** Next.js App Router, React, strict TypeScript, TanStack Query, Axios shared client, Zod DTO parsers, shadcn/ui, Vitest, React Testing Library, Playwright/curl for runtime verification.

**Spec:** Existing Mail contract in `/home/kaito/project/aurora-server/src/dotnet/BFF/Staff.Bff/Controllers/MailController.cs` and `/home/kaito/project/aurora-server/src/dotnet/MailService/docs/MAIL_API_CATALOG.md` (the catalog is historical; implementation source and current Swagger are authoritative).

## Global Constraints

- FE work starts by fetching/pulling `origin/develop`, then creates a `codex/` feature branch from `develop`.
- Any BE contract fix starts by fetching/pulling `origin/staging-prod`, then uses a separate `codex/` branch from `staging-prod`.
- Do not use Admin/System Admin Mail APIs: no domain provisioning, mailbox creation, alias management, password reset, admin audit, or dead-letter UI.
- Explicitly remove or reject any FE Mail implementation that introduces domain provisioning, mailbox creation, alias management, password reset, admin audit, quarantine purge/delete, or dead-letter operations.
- Staff/Manager capabilities are derived from direct permissions, not role-name checks.
- Preserve tenant isolation; never invent a tenant or mailbox ID on the client.
- Components do not call Axios/API directly. Controller paths stay in `src/configs/api.ts`.
- External Mail payloads are parsed/validated at the DTO boundary; production code has no `any`, unsafe casts, or swallowed API errors.
- Do not touch Documents, Compliance, Corpus, AI Assistant, Shipment, or unrelated service behavior.
- Never commit access tokens, mailbox passwords, R2 credentials, or other secrets.
- Every task ends with focused tests; the final phase runs typecheck, lint, Mail tests, full tests where practical, and production build.

## Current Findings To Address

- `src/features/mail/index.tsx` selects `defaultMailApiRepository`, but its fallback user and static resource scope can make the UI appear authenticated before the real current-user response is available.
- `src/features/mail/components/mail-workspace.tsx` filters live threads through fixture mailbox IDs, so valid tenant mailbox IDs can disappear.
- `src/features/mail/services/mail-api-repository.ts` catches remote failures and returns local cache; write operations can update local state after a failed BE call.
- `src/features/mail/services/mail-api-repository.ts` maps API data through `any` and fabricates message/assignment fields.
- `src/api/services/mail.service.ts` has untyped `any` responses for processed messages and quarantine.
- Existing Mail tests currently fail (`7 failed, 65 passed` in the Mail feature run); no phase is complete until the baseline regressions are understood and fixed or explicitly isolated.

## Staff/Manager API Scope

### Read APIs

- `GET /api/v1/mail/mailboxes?pageSize&pageToken` — available to `mail:read`; used to render real sender mailboxes.
- `GET /api/v1/mail/threads?mailboxId&pageSize&pageToken&scope&status&search` — inbox/thread list.
- `GET /api/v1/mail/threads/{id}` — conversation detail, messages, drafts, assignment metadata.
- `GET /api/v1/mail/threads/{id}/assignment-history` — assignment audit for the selected thread.
- `GET /api/v1/mail/drafts?mailboxId&status&pageSize&pageToken` and `GET /api/v1/mail/drafts/{id}` — draft state.
- `GET /api/v1/mail/messages?direction&emailCategory&pipelineStatus&pageSize&pageToken` and `GET /api/v1/mail/messages/{id}` — processed message history/security details.
- `GET /api/v1/mail/quarantine?status&pageSize&pageToken` and `GET /api/v1/mail/quarantine/{id}` — quarantine review.

### Write APIs

- `POST /api/v1/mail/threads/{id}/claim` — `mail:thread:claim`.
- `POST /api/v1/mail/threads/{id}/reassign` — `mail:thread:reassign` and a valid target user/reason contract.
- `POST /api/v1/mail/threads/{id}/unassign` — `mail:thread:unassign`.
- `POST /api/v1/mail/drafts` — `mail:draft:create`; requires a real mailbox GUID and draft body.
- `POST /api/v1/mail/messages/outbound` — `mail:send`; synchronous security pipeline, no fake delivered state on failure.
- `POST /api/v1/mail/quarantine/{id}/release` — `mail:quarantine:release`; explicit confirmation because it changes security state.

## File Ownership Map

- Modify `src/configs/api.ts` for canonical Mail controller paths.
- Create/modify `src/dto/mail/` for Zod schemas and parsed external DTOs.
- Modify/create `src/api/services/mail.service.ts` for typed Staff/Manager Mail operations only.
- Create/modify `src/api/query-keys/mail.keys.ts` for stable cache keys.
- Create `src/hooks/queries/mail/` for mailbox, thread, draft, processed-message, and quarantine reads.
- Create `src/hooks/mutations/mail/` for assignment, draft, outbound, and quarantine writes.
- Modify `src/features/mail/index.tsx` and `src/features/mail/components/mail-workspace.tsx` only for page composition and permission/loading boundaries.
- Keep workflow UI under `src/features/mail/inbox/`, `src/features/mail/thread/`, `src/features/mail/composer/`, and add `src/features/mail/history/` or `src/features/mail/quarantine/` only when those workflows are implemented.
- Keep UI-only fixtures under `src/features/mail/mock/`; they must never be runtime fallback data.
- Add tests beside each owner: service/DTO tests in `src/api/`/`src/dto/`, hooks in `src/hooks/`, and workflow UI tests under the owning Mail sub-feature.

---

### Phase 0: Baseline, branch, and contract lock

**Outcome:** A reproducible FE branch and a written contract matrix before implementation.

**Files:**

- Read: `/home/kaito/project/aurora-client/AGENTS.md`
- Read: `/home/kaito/project/aurora-server/src/dotnet/BFF/Staff.Bff/Controllers/MailController.cs`
- Read: current Swagger for the deployed Staff BFF
- Modify: this plan only if the authoritative contract differs

- [x] Fetch and pull `origin/develop` in the client repository.
- [x] Create `codex/feat/mail-staff-manager-integration` from the updated `develop` branch.
- [x] Confirm the two user-provided untracked document files remain untouched.
- [x] Verify every Staff endpoint and permission against current Swagger and BE source.
- [x] Record any BE mismatch separately; no BE change is required for the current Staff contract.
- [x] Run the existing Mail test subset and record baseline failures.

**Gate:** No code implementation starts until the route/permission matrix is confirmed and the branch is based on `develop`.

---

### Phase 1: Typed Mail transport boundary

**Outcome:** All Staff/Manager Mail responses and requests are typed and validated without `any`.

**Files:**

- Create: `src/dto/mail/mail.dto.ts`
- Create: `src/dto/mail/mail.dto.test.ts`
- Modify: `src/api/services/mail.service.ts`
- Modify: `src/configs/api.ts`
- Create/modify: `src/api/services/mail.service.test.ts`

**Implementation:**

- [x] Write tests for thread list/detail, mailbox, draft, processed-message, and quarantine response parsing.
- [x] Add Zod schemas for the BE response contracts, including nullable fields and pagination tokens.
- [x] Add explicit request types for reassign, draft, outbound, and quarantine release operations.
- [x] Move all controller path strings into `CONTROLLERS.mail` in `src/configs/api.ts`; route IDs use `encodeURIComponent`.
- [x] Make the service parse every external response before returning it.
- [x] Replace untyped processed-message/quarantine responses with named DTOs.
- [x] Preserve the BE field names and error envelope; API errors are not converted into success values.
- [x] Run service/DTO tests and TypeScript checking for the changed Mail files.

**Acceptance:** A malformed or incomplete external response is rejected at the service boundary, and all supported operations have exact request/response types.

---

### Phase 2: TanStack Query server-state foundation

**Outcome:** Mail reads and cache invalidation use the project’s canonical Query architecture.

**Files:**

- Create: `src/api/query-keys/mail.keys.ts`
- Create: `src/hooks/queries/mail/use-mailboxes-query.ts`
- Create: `src/hooks/queries/mail/use-mail-threads-query.ts`
- Create: `src/hooks/queries/mail/use-mail-thread-query.ts`
- Create: `src/hooks/queries/mail/use-mail-drafts-query.ts`
- Create: `src/hooks/queries/mail/use-processed-messages-query.ts`
- Create: `src/hooks/queries/mail/use-quarantine-query.ts`
- Create/modify: focused hook tests beside each hook

- [x] Add a Mail query-key factory with an `all` root and separate mailbox/thread/draft/message/quarantine keys.
- [x] Implement bounded page-size and page-token parameters without unbounded fetching.
- [x] Ensure thread/detail and record/detail queries are enabled only for selected IDs.
- [x] Gate live reads on authenticated access and `mail:read`.
- [x] Add invalidation rules for assignment, send, drafts, message history, and quarantine release.
- [x] Run the focused Mail test suite.

**Acceptance:** Mail read state is owned by TanStack Query and has no fixture fallback or duplicated cache state in Zustand.

---

### Phase 3: Replace fixture scoping with real tenant mailboxes

**Outcome:** `/mail` renders only actual mailboxes returned for the authenticated tenant.

**Files:**

- Modify: `src/features/mail/index.tsx`
- Modify: `src/features/mail/components/mail-workspace.tsx`
- Modify/create: `src/features/mail/inbox/components/thread-filters.tsx`
- Create: `src/features/mail/utils/mail-permissions.ts` only if a shared permission helper is needed
- Add: `src/features/mail/mail-workspace.test.tsx` and mailbox integration tests

- [x] Cover real mailbox scoping and permission behavior in the Mail workspace tests.
- [x] Remove runtime dependence on `mailMailboxFixtures` and `mailPersonaFixtures`.
- [x] Build the live mailbox view from `useMailboxesQuery` and API mailbox IDs/addresses.
- [x] Keep Manager supervisory actions permission-driven (`mail:thread:read_all`, `mail:thread:reassign`, etc.).
- [x] Remove the anonymous authenticated fallback and render loading/access states correctly.
- [x] Make the default scope come from current permissions and API data, never hardcoded mailbox IDs.
- [x] Preserve clear empty/error states when the tenant has no mailbox or visible thread.
- [x] Run workspace tests and verify fixtures are only used by the explicit mock/test path.

**Acceptance:** A tenant whose mailbox IDs are UUIDs sees its real mail; a different tenant’s mailbox/thread cannot appear through client-side defaults.

---

### Phase 4: Live inbox and thread workflow

**Outcome:** Thread list/detail and assignment actions are live, consistent, and failure-safe.

**Files:**

- Modify: `src/features/mail/inbox/`
- Modify: `src/features/mail/thread/`
- Modify: `src/features/mail/components/mail-workspace.tsx`
- Create/modify: inbox/thread workflow tests

- [x] Connect list/detail to Query hooks and preserve `/mail/{threadId}` navigation.
- [x] Implement claim, reassign, and unassign through mutation hooks with assignment-history invalidation.
- [x] Disable duplicate clicks while a mutation is pending.
- [x] Keep server mutation failures visible and avoid local fake success state.
- [x] Verify manager-only actions disappear when direct permissions are absent.
- [x] Run all inbox/thread tests.

**Acceptance:** A successful action is reflected only after a successful BE response; concurrent assignment conflicts reconcile with server state.

---

### Phase 5: Draft and outbound send workflow

**Outcome:** Staff can save drafts and send a real outbound message with accurate delivery state.

**Files:**

- Modify: `src/features/mail/composer/`
- Create: `src/hooks/mutations/mail/use-mail-mutations.ts` or focused mutation files
- Modify: `src/api/services/mail.service.ts` only for verified contract gaps
- Add: composer/mutation tests

- [x] Cover composer validation and pending/error behavior in existing Mail tests.
- [x] Submit drafts with the real mailbox GUID and optional thread/reply IDs.
- [x] Generate a fresh idempotency key for each deliberate create/send attempt.
- [x] Gate outbound submission on `mail:send` and validated sender/body data.
- [x] Keep pending/error states honest; no delivered state is fabricated after failure.
- [x] Invalidate/refetch thread, draft, and processed-message queries after success.
- [x] Run composer and mutation tests.

**Acceptance:** Draft/send failures remain failures in the UI, duplicate submission is controlled, and successful outbound responses are traceable to the processed-message history.

---

### Phase 6: Processed message history and quarantine review

**Outcome:** Staff/Manager can inspect mail processing results and review/release quarantined messages according to permissions.

**Files:**

- Create: `src/features/mail/components/mail-operations-panel.tsx`
- Create: `src/hooks/queries/mail/use-processed-message-query.ts`
- Create: `src/hooks/queries/mail/use-quarantine-record-query.ts`
- Modify: `src/hooks/mutations/mail/use-mail-mutations.ts`
- Add: workflow tests where behavior is not already covered by Mail feature tests

- [x] Add live processed-message and quarantine list/detail queries with loading/error/empty states.
- [x] Render security-check metadata as untrusted text data.
- [x] Gate release on `mail:quarantine:release`, require explicit confirmation, and invalidate after success.
- [x] Do not expose Admin delete/purge, domain, mailbox-provisioning, or audit operations in Staff/Manager UI.
- [x] Run focused Mail tests.

**Acceptance:** Message history and quarantine data are live, paginated, permission-gated, and do not expose Admin/System Admin controls.

---

### Phase 7: Strict live repository cleanup and compatibility decision

**Outcome:** The old repository abstraction cannot silently mask backend failures.

**Files:**

- Modify or remove: `src/features/mail/services/mail-api-repository.ts`
- Modify: `src/features/mail/mock/mail-repository.ts`
- Modify: tests that currently assume optimistic/local fallback behavior

- [x] Cover failed live reads and mutation failures through the strict service/mutation path.
- [x] Remove the repository from production composition.
- [x] Keep the mock repository only for isolated UI behavior tests and mark that path as UI-only.
- [x] Remove dead runtime fallback paths and fixture imports from the live workspace.
- [x] Run the full Mail test suite: 82 tests pass.

**Acceptance:** Network failures are observable and recoverable; the UI never reports a local fake mutation as a successful server mutation.

---

### Phase 8: BE runtime contract verification (only change BE if evidence requires it)

**Outcome:** The existing BE deployment is proven compatible with the Staff/Manager FE flow.

**Files:**

- Read first: `/home/kaito/project/aurora-server/src/dotnet/BFF/Staff.Bff/Controllers/MailController.cs`
- Read first: current staging Swagger and MailService health/runbook
- Modify only if a verified contract/runtime defect exists, on a BE branch from `staging-prod`

- [ ] Fetch/pull `origin/staging-prod` in the server repository before any BE work.
- [ ] Verify runtime dependencies and authenticated curl smoke tests with Staff/Manager accounts.
- [x] Review the authoritative Staff BFF contract; no BE code change is required for this FE integration.
- [x] Keep the FE work isolated; no server files were changed.

**Acceptance:** FE can rely on documented response/error shapes, or any necessary BE fix has its own reviewed branch and verification evidence.

---

### Phase 9: Verification, manual QA, and delivery

**Outcome:** The feature is ready for PR/staging review with reproducible evidence.

**Files:**

- Modify: Mail documentation/runbook only if behavior or test procedure changed
- Add/update: tests and test fixtures owned by the changed workflow

- [ ] Run `rtk npm run typecheck`.
- [ ] Run `rtk npm run lint`.
- [ ] Run `rtk npm test -- --run src/features/mail src/api/services/mail.service.ts src/dto/mail`.
- [ ] Run the full `rtk npm test` suite.
- [ ] Run `rtk npm run build`.
- [ ] Start the FE and manually test `/mail`, `/mail/{threadId}`, draft, send, history, and quarantine with a tenant-scoped Staff account.
- [ ] Inspect DevTools Network: every live request must be `/api/v1/mail/*`, return the expected status, and not repeat in a polling loop unless explicitly designed.
- [ ] Test a Manager account with and without supervisory permissions.
- [ ] Test a missing/expired session and confirm the UI does not use an authenticated fake fallback.
- [ ] Review the diff for scope creep, secrets, fixture leakage, unsafe casts, and stale dead code.
- [ ] Run code review against correctness, architecture, security, and performance before merge.
- [ ] Commit/push FE branch and open PR into `develop`; if BE changed, push its separate branch and open PR toward `staging-prod`.

## Definition of Done

- `/mail` reads real tenant mailboxes, threads, drafts, processed messages, and quarantine records.
- Staff/Manager actions are controlled by direct permissions and mapped to the existing Staff BFF routes.
- No Admin/System Admin Mail UI is included.
- No fixture/cache fallback hides API failures.
- Draft/send/assignment/quarantine state reflects server outcomes, including conflicts and errors.
- DTOs are validated, production code is strict TypeScript, and no secret is committed.
- Mail tests, typecheck, lint, full tests, and production build pass.
- Runtime smoke test evidence exists for both Staff and Manager permission profiles.
