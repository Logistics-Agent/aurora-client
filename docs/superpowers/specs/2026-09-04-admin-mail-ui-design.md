# Admin Mail UI Design

## Objective

Build a UI-only, mock-first tenant Admin Mail console that can be implemented independently from the Staff/Manager workspace. It presents overview, assigned-domain, shared-mailbox, single-target alias, quarantine, and audit workflows using deterministic local fixtures.

## Source of Truth

- `D:/aurora/aurora-server/docs/figma/admin-mail-01-product-context.md`
- `D:/aurora/aurora-server/docs/figma/admin-mail-02-ui-spec.md`
- `D:/aurora/aurora-client/AGENTS.md`
- `D:/aurora/aurora-client/docs/PAGES_AND_AUTHORIZATION.md`

## Scope

The feature includes:

- A lightweight Mail Overview derived from the same local fixtures as the detail screens.
- Read-only assigned-domain inventory, mailbox quota, and DNS-record drawer.
- Shared-mailbox inventory, creation form, and default operational mailbox identity.
- Alias inventory, single-target creation form, and deletion.
- Quarantine filters, threat inspection, release, and permanent-delete confirmation.
- A filterable Mail Audit table and structured detail viewer populated by local fixtures and mock actions.
- Direct permission gating for every page section and action.
- Loading, empty, error, validation, success, and forbidden states.

The feature does not include:

- Staff inboxes, thread assignment, reading-pane workflow, drafts, or composition.
- Personal employee mailboxes.
- Tenant-side domain provisioning; only `SYSTEM_ADMIN` provisions and assigns domains.
- Mailbox passwords or credential-reset controls.
- SMTP/IMAP infrastructure, ports, clusters, certificates, or Stalwart administration.
- Live API integration or claims that fixture metrics are realtime.
- Production DTOs, services, query keys, query hooks, or mutation hooks.
- Invented service-uptime or spam-catch percentages.

## Authorization Model

Base role selects the Admin shell and default navigation only. Direct permissions independently control each Mail action, and tenant resource scope controls which domains, mailboxes, aliases, quarantine records, and audit records are visible. A `TENANT_ADMIN` role alone never enables an action.

Mock personas deliberately include missing and directly granted permissions so the UI demonstrates permission-derived states. All mock records carry tenant and resource identifiers; selectors and derived views operate only on the active tenant scope.

## Routes

- `/admin/mail/overview`
- `/admin/mail/domains`
- `/admin/mail/mailboxes`
- `/admin/mail/aliases`
- `/admin/mail/quarantine`
- `/admin/mail/audit`

Each route is a thin adapter. Admin Mail navigation is a capability-aware subsection of the existing staff application shell rather than a second application shell.

## Feature Architecture

Admin Mail lives under the existing administration feature so it can be assigned to a separate implementer without importing Staff Mail UI:

```text
src/features/administration/mail/
  components/          admin-mail shared tables, metrics, and status UI
  overview/            fixture-derived posture dashboard
  domains/             assigned inventory and DNS drawer
  mailboxes/           inventory and creation
  aliases/             inventory, single-target creation, deletion
  quarantine/          list, threat inspection, release, delete
  audit/               fixture-backed list and structured detail viewer
  hooks/               mock-first interaction orchestration
  mock/                fixtures and pure mock transitions
  types/               admin-mail domain types
  utils/               filters, formatting, and safe preview helpers
  index.tsx             public page compositions
```

Component ownership follows reuse:

- Reuse shadcn primitives from `src/components/ui`.
- Place presentation-only UI shared with Staff Mail in `src/components/common/mail`; initially this is limited to `MailboxIdentity`, accepting primitive display props and no feature-owned domain object.
- Reuse existing generic data states and `StatusBadge` from `src/components/common` instead of creating Mail-specific duplicates.
- Keep Admin Mail tables, drawers, dialogs, and domain-specific status UI under `src/features/administration/mail` when they are only reused within Admin Mail.
- Share UI with Staff Mail only when the component has no Mail-workflow or permission semantics tied to either feature.

The feature uses its own async-shaped local mock adapter and feature-owned state. It does not add production DTO, service, query-key, or TanStack Query files. A later API-integration project may replace the adapter behind the feature hooks according to `AGENTS.md`.

## Mock Domain Model

The minimum model includes:

- `MailDomain`: assigned status, routing status, DKIM selector/public record, quota, retention, and timestamps.
- `SharedMailbox`: address, domain, local part, default-mailbox flag, status, and created timestamp.
- `MailAlias`: alias address, domain, exactly one target mailbox identifier, and timestamp.
- `QuarantineRecord`: sender, recipients, subject, scores, authentication checks, headers, sanitized preview text, status, and timestamps.
- `MailAuditRecord`: actor, action, resource, result, timestamp, and structured details.

Fixtures cover populated, loading, empty, error, success, validation-error, and forbidden variants. All summary metrics are derived from fixtures rather than separately hard-coded.

The local mock adapter is asynchronous and exposes pending/success/error states. Mutations update overview metrics, inventories, quarantine state, and audit history together so the application behaves like it is backed by coherent persisted data rather than disconnected static cards.

## Interaction and State Flow

1. Overview cards and recent activity derive from the same fixture collections as the detail screens.
2. Assigned domains are read-only; users can inspect DKIM DNS instructions but cannot create or assign domains.
3. Creating a mailbox validates the assigned domain and local part, then updates domain quota usage while preserving exactly one default operational mailbox.
4. Creating an alias requires exactly one existing target shared mailbox.
5. Deleting an alias requires confirmation and removes only the forwarding identity, never the target mailbox.
6. Releasing quarantine changes the record status and returns it to the inbound operational queue.
7. Permanent deletion requires a destructive confirmation and removes preview access without restoring the message.
8. Successful mock actions append a local Mail Audit record so Overview and Audit remain visually consistent.

## Permissions

- `mail:mailbox:manage` controls mailbox creation, alias creation, and alias deletion.
- `mail:quarantine:read` controls quarantine visibility.
- `mail:quarantine:release` controls release.
- `mail:quarantine:delete` controls permanent deletion.
- `mail:audit:read` controls the Mail Audit screen.
- `mail:system:manage` is never exposed or required in this tenant UI.

Role labels may explain persona context but never authorize actions. Missing permissions produce the hidden or disabled states required by the UI specification and remain enforced independently per action.

## Security-Sensitive Preview

- Default presentation is sanitized plain text plus a collapsible header inspector.
- The mock implementation does not use `dangerouslySetInnerHTML`.
- External images, styles, fonts, scripts, and clickable links are never loaded from fixture bodies.
- If HTML preview is added during later API integration, it must use a sandboxed iframe with scripts disabled, external assets blocked, and links defanged.

## Responsive and Accessibility Rules

- Optimize tables for 1440px, support 1280px, and preserve usability at 1024px.
- Below desktop width, keep critical identity/status cells visible and move secondary fields into row details rather than horizontal overflow where practical.
- Drawers and dialogs have focus trapping, labelled titles/descriptions, keyboard dismissal where safe, and focus return.
- Destructive confirmation cannot be submitted accidentally by Enter from unrelated fields.
- Status meaning is conveyed by text and iconography, not color alone.

## Error Handling

- Form validation remains local and field-specific.
- Mock adapter failures use the shared error-state pattern with retry where the operation is safe to repeat.
- Destructive actions do not optimistically disappear before mock confirmation succeeds.
- Permission failures do not expose action forms or sensitive quarantine content.
- Empty-state copy distinguishes no configured resources from a failed load.

## Testing Strategy

- Pure unit tests cover derived overview metrics, filters, validation, default-mailbox invariants, single-target aliases, mock transitions, and audit generation.
- Component tests cover every route's loading, empty, error, populated, permission, and primary interaction state.
- Security tests assert quarantine content is rendered as text with no active external asset or link behavior.
- Navigation tests verify capability-aware Admin Mail links.
- Final verification runs targeted Vitest tests, full tests when practical, typecheck, lint, and production build.

## Acceptance Criteria

- The six Admin Mail navigation destinations render coherent, working mock UI; the four screens explicitly detailed by the updated source documents remain authoritative for their domain behavior.
- Overview metrics and recent activity remain consistent with the underlying fixtures.
- Assigned domains remain read-only in every permission state.
- Every tenant fixture has exactly one default operational mailbox, and every alias has exactly one target mailbox.
- Staff Mail components are not imported or duplicated.
- Tenant-admin UI never exposes `mail:system:manage`.
- Quarantine previews cannot execute or fetch untrusted content.
- Fixture data is visibly non-live wherever that distinction matters.
- No new UI library is added.
- The feature passes targeted tests, TypeScript checking, lint, and production build.
