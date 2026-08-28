# Phase 10 — Administration

## Figma scope

Inspect [13 — Administration](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-14): S30–S35 and P14 role-aware examples.

## Prompt for the coding AI

Implement `features/administration` as local modules for users, roles, tenant settings, audit log and AI operations. Build S30 user list/invite modal, S31 permission matrix, S32 tenant settings, S33 audit log/audit drawer, S34 AI Operations Dashboard and S35 AI Execution Detail. Use static admin fixtures and local dialog/drawer/filter states only.

Role-aware navigation and restricted actions must use the shared permission presentation. Admin can govern configuration but operational/finance/compliance actions still show a known-feature restriction when the role lacks that assigned capability. AI Execution Detail shows input context, retrieval sources, approved tool calls, outcome, confidence, errors and timing; it never shows private chain-of-thought.

Use compact tables/panels; keep AI failure visually subordinate to critical system states when both appear. Run lint/typecheck/build and stop.
