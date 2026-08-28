# Phase 03 — Auth Screens and Permission UX

## Figma scope

Inspect [03 — Auth](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-4): S01 Login states, S02 Forgot Password states, S03 Select Tenant. Also inspect P14 role-aware examples on [13 — Administration](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-14).

## Prompt for the coding AI

Implement `features/auth` with Login, Forgot Password, and Select Tenant feature roots plus thin routes. Reproduce default/loading/error/locked/success visual states using local form state and Zod/React Hook Form only for client-side validation. Do not connect identity, SSO, reset-password or tenant APIs.

Add a small shared permission presentation contract (for example `PermissionState` plus navigation filtering helper) and local fixture roles: Operations, Finance, Compliance, Admin, Customer. Use it to show known restricted actions with plain explanation/request-access UI. Customer navigation must contain only Overview, My Shipments, Documents, Quotes, Invoices, AI Assistant and Notifications; never render internal capabilities or their data.

Test keyboard-visible form errors, loading state and permission hide-versus-explain behavior. Run lint/typecheck and stop.
