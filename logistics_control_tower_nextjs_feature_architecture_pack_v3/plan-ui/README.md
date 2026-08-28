# Logistics AI Control Tower — UI-only Execution Pack

This pack is the authoritative execution guide for implementing the approved Figma design as a **UI-only** Next.js application.

## Source context

- Architecture pack: `/home/kaito/project/aurora-client/logistics_control_tower_nextjs_feature_architecture_pack_v3`
- Frontend rules: `/home/kaito/project/aurora-client/AGENTS.md`
- Figma file: `drI45J1ajP37h7UD8mM1fx`
- Figma map: [01_FIGMA_NODE_MAP.md](01_FIGMA_NODE_MAP.md)

## Scope boundary

Build visual UI, responsive layout, reusable components, local interaction state, and clearly labelled feature-local display fixtures. Do not implement API clients, TanStack Query hooks, mutations, authentication, WebSockets, GPS streaming, OCR, compliance, AI, billing, or any fake backend service.

## How to execute

1. Read `00_UI_ONLY_EXECUTION_SPEC.md`, `01_FIGMA_NODE_MAP.md`, `/home/kaito/project/aurora-client/AGENTS.md`, and the target Next.js repository's existing architecture files.
2. Execute one prompt in `phases/` at a time, in numeric order.
3. In every phase, inspect the linked Figma node through MCP before editing JSX/CSS.
4. Run the phase quality gate, compare the running page against Figma, fix differences, then stop.
5. Do not begin the next prompt until the current phase is accepted.

The planning pack is deliberately stored separately from the Next.js application because the supplied Aurora Client directory is an architecture pack, not the runnable application repository.
