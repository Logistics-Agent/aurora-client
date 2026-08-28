# Phase 14 — Final UI QA and Direct Fixes

## Prompt for the coding AI

Perform a full UI inspection against `plan-ui/01_FIGMA_NODE_MAP.md` and all approved Figma pages. Do not only report issues: fix all issues that are local to the UI codebase, then re-run validation.

Verify: S01–S35 coverage; Create Shipment steps 1–6; import validation; Customer Portal desktop/mobile; global states; confirmation dialogs; local prototype flows A–F; thin routes and feature ownership; shared component reuse; shipment-centric navigation; exception-first hierarchy; AI explainability; realtime truthfulness; permission consistency; Light tokens; enterprise density; functional 3D restraint; and Command Center/Shipment Detail North Star consistency.

Inspect actual running routes at 1440×900, 1280×800 and customer 390px. Fix visual drift in shell width, typography, spacing, borders, selected states, table density, panel proportions, semantic colors and responsive overflow. Remove unused UI-only code and duplicated components where a shared primitive exists. Do not add backend integration.

Run `pnpm lint`, `pnpm typecheck`, applicable tests and `pnpm build`. Report exact Figma frames, routes/files changed, fixture-only interactions, validation output, and the intentionally deferred backend work.
