# Phase 00 — Target App Preflight and Figma Contract

## Prompt for the coding AI

You are implementing **UI only** in the runnable Next.js repository, not in this planning pack. Read `AGENTS.md`, `docs/00_APP_CONTEXT.md`, `docs/02_FRONTEND_ARCHITECTURE.md`, `docs/03_FOLDER_STRUCTURE.md`, `docs/04_FEATURE_ARCHITECTURE.md`, `docs/08_UI_DESIGN_SYSTEM.md`, `docs/10_ROUTING_AND_LAYOUT.md`, and `plan-ui/00_UI_ONLY_EXECUTION_SPEC.md`.

Before modifying anything, inspect `package.json`, `src/app`, `src/features`, `src/components/{ui,layout,common}`, existing Tailwind config/globals, `components.json`, and current routes. Inspect Figma foundations/components at [56:2](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-2) and [56:3](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-3) through MCP.

Create a short `docs/ui-implementation/figma-code-map.md` in the runnable app that records: Figma frame, route, feature root, shared primitives, and fixture file. Define the `// UI-only fixture until backend integration phase.` convention. Do not create API services, Query hooks, mutations, auth integration, fake endpoints, WebSocket code, or business logic.

Run `pnpm lint` and `pnpm typecheck` as baseline. Report existing failures separately; do not hide or suppress them. Stop after the contract/map is accepted.
