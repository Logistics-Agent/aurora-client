# Customer Portal Completion Design

## Context

The `/portal/**` routes and `(customer)` layout exist, but the current feature is a single conditional component with placeholder-level content. Phase 11 was marked complete even though the Figma desktop workspaces and mobile states were not implemented. This design completes only the customer-facing portal and preserves the existing staff dashboard.

## Approved Figma contract

- Desktop: `119:2`, `119:61`, `119:129`, `120:2`, `120:46`, `120:95`, `121:2`, `121:47`, `121:94`.
- Mobile at 390px: `130:2`, `130:34`, `130:64`, `130:91`, `130:118`, `130:146`, `130:172`.
- Light tokens, restrained map treatment, customer-safe information and bottom navigation follow the approved Figma direction.

## Architecture

- Keep every `src/app/(customer)/portal/**/page.tsx` as a thin route adapter.
- Keep `src/features/customer-portal/index.tsx` as the public feature entry and mode dispatcher.
- Replace the monolithic `customer-workspace.tsx` with focused local workspaces under `workspaces/<screen>/`.
- Store customer presentation types in `types/`, pure filtering/state-transition helpers in `utils/`, interactive client state in `stores/`, and all UI-only data in `mock/`.
- Reuse shared primitives from `components/common` and `components/ui`; no staff feature UI or staff fixtures may be imported.
- Upgrade `CustomerShell` to the Figma desktop sidebar/content header and retain the four-item mobile bottom navigation.

## Screen behavior

### Overview

Show four KPI cards, recent shipment activity, an attention-required card, and customer-safe data disclosure. Shipment rows and the review action navigate to customer-owned routes.

### My Shipments

Show four customer shipments in a desktop table and mobile cards. Search filters by shipment ID, origin or destination. Status filtering is local. Selecting a row enables the “View shipment” action and navigating a row opens its customer detail route.

### Shipment Detail

Show delayed/customer-notified status, customer-visible timeline, carrier/container/reference details, three downloadable documents, support context, tracking navigation and AI-assistant navigation. No internal risk scoring, operational notes, negotiation or device controls are exposed.

### Tracking

Follow Figma’s customer restraint: show origin/destination and milestone progress, but do not expose precise internal carrier GPS coordinates. The state is explicitly “GPS stale” with a last-update timestamp and customer-notified delay advisory.

### Documents, Quotes and Invoices

Documents support local search, selection and an opened/download-ready state. Quotes support customer confirmation for an awaiting-confirmation quote. Invoices support selection and local “view invoice” details; payment recording remains unavailable because it is an internal/backend action.

### AI Assistant

Show a customer-safe scope panel and a local question flow. Every answer includes result, confidence, rationale, sources, timestamp and suggested action, and explicitly states that AI does not change shipment or commercial data.

### Notifications

Show grouped customer-visible notifications, local read/unread state and a preferences panel with in-app/email toggles. No internal alert metadata is shown.

## Responsive behavior

- Desktop (`md` and above): 232px sidebar, 64px customer workspace header, fluid content grid.
- Mobile (`390px` target): compact header, stacked cards, table replaced by cards, fixed four-item bottom navigation, no horizontal overflow.
- Interactive controls maintain at least 40px practical touch targets where they are primary mobile actions.

## Testing and quality

- Use TDD for selectors, state transitions and observable workspace interactions.
- Test customer-scope boundaries by asserting prohibited internal labels are absent.
- Run targeted tests after each workspace group, then full `test`, `lint`, `typecheck`, Prettier check and production build.
- Browser visual testing is attempted only if local browser permission is available; otherwise report that limitation without claiming a browser pass.

## Constraints

- UI-only fixtures use `// UI-only fixture until backend integration phase.`
- No backend/API, authentication, billing, download, realtime or AI service integration.
- No commits, pushes, resets or cleanup of unrelated files.
