# Logistics AI Control Tower UI-only Execution Specification

## Goal

Implement every approved Logistics AI Control Tower Figma screen in the existing Next.js App Router application with accurate light-theme layout, reusable UI composition, realistic local fixtures, and local interaction states.

## Non-negotiable constraints

- Figma is the visual source of truth. Inspect exact node IDs in `01_FIGMA_NODE_MAP.md` before coding a batch.
- This is UI-only. Do not create API services, Query keys/hooks, mutations, Axios calls, authentication integration, WebSocket/GPS transport, OCR/compliance/AI/billing services, or placeholder endpoints.
- Use feature-local `constants/*-ui-fixtures.ts` for display data, with the comment `// UI-only fixture until backend integration phase.`
- `src/app/**/page.tsx` remains a thin route adapter. Route composition belongs in `src/features/<feature>/index.tsx`.
- Use Tailwind CSS and existing shadcn/Radix primitives. Extend them to match Figma; do not recreate generic primitives or introduce another component library.
- Use `@/*` imports, strict TypeScript, kebab-case file names, and PascalCase React components.
- Keep feature-specific components, dialogs, drawers, workflows, sections, types and UI state local to their feature. Promote only proven cross-feature patterns to `src/components/common`.
- Use `useState`, feature-local UI stores, or existing root UI stores only for visible client interactions. Do not model server state locally as a fake service.
- Default to Server Components. Put `"use client"` only around local interactive boundaries.

## Visual system

Use existing semantic variables first. If they are absent, create only these approved Light tokens in `globals.css`/Tailwind mapping:

`background #F6F9FC`, `surface #FFFFFF`, `surface-secondary #F9FBFD`, `border #DCE5EE`, `text #102033`, `text-secondary #6F8092`, `primary #2F74FF`, `cyan #53B8FF`, `success #1DB978`, `warning #F5A623`, `high-risk #E97818`, `critical #F04444`, `ai #6D5CE7`, `ai-surface #F1F0FF`.

Use 6–8px control radii, 8–12px panel radii, compact enterprise density, thin borders, restrained shadows, and Inter. Do not introduce dark shell fragments, oversized SaaS cards, generic AI gradients, or decorative 3D.

## UX invariants

- Shipment is central. Tracking, documents, compliance, cost, negotiation, billing, notifications and AI answers show shipment identity/context and provide a route back to the shipment when applicable.
- Exceptions outrank normal data: delayed, deviation, GPS stale/offline, document missing, OCR review, compliance risk, abnormal cost, negotiation waiting and overdue payment.
- Keep Shipment Status, operational flag, risk, priority and AI execution state separate.
- Important AI UI exposes result, confidence, reason, sources, timestamp, suggested action and human-review action. Never expose chain-of-thought or silently apply sensitive changes.
- `Live` means fresh data only. Stale GPS shows its last update and never shows Live; disconnected state is persistent and actionable.
- Customer pages never render internal costs/floor, negotiation strategy, other customers, AI Operations, Audit Log, tenant administration or GPS-device administration. Hide unknown features; show a permission state only for a capability the user can reasonably know exists.

## UI-only local interactions

Implement only presentational/local behavior visible in Figma: sidebar active state, tabs, filter chips, search input state, sort/selection state, stepper navigation, drawer/dialog/sheet open-close state, selected map marker, local notifications, form validation display, static upload progress/OCR states, route comparison selection, AI review/approval confirmations and toast feedback.

## Required verification per phase

1. Read the phase Figma node with MCP and inspect current target files.
2. Implement only the listed Figma frames and explicitly named local interactions.
3. Compare the running route at 1440×900 and its stated responsive breakpoint to Figma.
4. Run `pnpm lint`, `pnpm typecheck`, and the smallest relevant test command if configured. Run `pnpm build` after route/layout changes and at final QA.
5. Fix visual or type/lint failures before reporting the phase complete. Stop after the phase.
