# Phase 02 — Staff Shell and Thin Routing

## Figma scope

Inspect `Global Staff Shell` in [03 — Auth](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=82-64) and staff shells in S04/S09.

## Prompt for the coding AI

Create/reuse `AppShell`, `AppSidebar`, `AppHeader`, `PageContainer`, and `PageHeader` in `src/components/layout`. Match the 232–256px sidebar, ~64px header, global search, realtime indicator, AI processing, notifications and user section from Figma. Keep content panels light, compact, bordered and responsive; do not hardcode a 1440px app width.

Add thin App Router adapters for the planned staff routes. Each adapter imports only a public feature entry; it does not contain tables, filters, fixture values, dialogs or page composition. Centralize route constants and role-aware navigation configuration. Hide navigation a role must not know exists; do not fill the sidebar with disabled items.

Use local UI state only for sidebar collapse, search affordance and selected navigation. Run the app at 1440×900 and 1280×800, verify shell alignment against Figma, run lint/typecheck/build, then stop.
