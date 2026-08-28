# UI Implementation Phase Status

| Phase | Status   | Routes/screens                                                   | Figma nodes                          | Validation                     |
| ----- | -------- | ---------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| 00    | Complete | Preflight contract                                               | `56:2`, `56:3` → `58:10`, `65:2`     | baseline lint/typecheck passed |
| 01    | Complete | Light tokens and shared primitives                               | `56:2`, `56:3` → `58:10`, `65:2`     | lint/typecheck passed          |
| 02    | Complete | Staff shell, customer shell, thin route adapters                 | `82:64`, `86:2`, `87:2`              | lint/typecheck passed          |
| 03    | Complete | Login, reset password, tenant selection, permission presentation | `56:4` → `84:40`, `84:255`, `84:354` | lint/typecheck passed          |

| 04 | Complete | `/overview`, `/shipments/[shipmentId]` | `86:2`, `87:2` | typecheck/lint passed; production build passed |
| 05 | Complete | `/shipments`, `/shipments/new`, `/shipments/import` | `91:201`, `93:560` | typecheck/lint/test passed; production build passed |
| 06 | Complete | `/route-planning`, `/live-map`, `/shipments/[shipmentId]/tracking` | `98:2`, `99:230`, `100:520` | GPS/map re-audit complete; typecheck/lint/test/build passed |
| 07 | Complete | `/documents`, `/documents/upload`, `/documents/[documentId]/ocr`, `/compliance`, `/compliance/[findingId]` | `102:2`, `103:773`, `104:2` | typecheck/lint/test passed; production build passed |
| 08 | Complete | `/cost-estimate`, `/negotiations`, `/negotiations/[negotiationId]`, `/billing`, `/invoices/[invoiceId]` | `107:2`, `108:2` | typecheck/lint/test passed; production build passed |
| 09 | Complete | `/assistant`, `/notifications`, `/email-agent`, `/email-agent/[emailId]` | `111:2`, `112:2` | typecheck/lint/test passed; production build passed |
| 10 | Complete | `/admin/users`, `/admin/roles`, `/admin/tenant`, `/admin/audit`, `/admin/ai-operations`, `/admin/ai-operations/[executionId]` | `114:2` | typecheck/lint/test passed; production build passed |
| 11 | Complete | `/portal`, `/portal/shipments`, `/portal/shipments/[shipmentId]`, `/portal/shipments/[shipmentId]/tracking`, `/portal/documents`, `/portal/quotes`, `/portal/invoices`, `/portal/assistant`, `/portal/notifications` | desktop `119:2`, `119:61`, `119:129`, `120:2`, `120:46`, `120:95`, `121:2`, `121:47`, `121:94`; mobile `130:2`, `130:34`, `130:64`, `130:91`, `130:118`, `130:146`, `130:172` | mapping 9/9; full suite 30/30; lint/typecheck/format/build passed; all 9 production routes returned HTTP 200 |
| 12 | Complete | Shared loading/empty/error/realtime/AI/confirmation/permission states | `122:2`, `124:2`, `128:391` | typecheck/lint/test passed; production build passed |
| 13 | Complete | Responsive grids, overflow-safe tables, local flows A–F, restrained SVG map | `130:2`, `133:2` | typecheck/lint/test passed; HTTP smoke checks passed at representative routes |
| 14 | Complete | S01–S35 coverage and final fix log | `134:2` | typecheck/lint/test passed; `next build --webpack` passed; route manifest and HTTP smoke checks verified |

## Final QA notes

- UI-only fixture data is explicitly labeled and no screen calls backend/API services.
- Staff and customer route groups are separated by the `/portal` URL prefix; dynamic segments use canonical Next.js names.
- Realtime indicators distinguish live, stale, offline, reconnecting/disconnected and unavailable states; fixture data is not presented as backend-live data.
- AI surfaces include result, confidence, rationale, sources, timestamp, suggested action and human-review context.
- Remaining work is backend-only: authentication, authorization enforcement, persistence, API/Query integration, realtime transport, OCR/AI execution, billing/compliance services and production telemetry.
- Architecture follow-up: removed the monolithic `src/features/workspace-ui` implementation. Feature roots now own their page composition under local `components/` and `mock/` folders; shared card/metric primitives live under `src/components/common`.
- Local interactions are wired for shipment selection/search, six-step shipment creation, route selection and freshness, document/OCR approval, compliance resolution, commercial confirmation, AI answer reveal, notification/email review, admin user state and Customer Portal views.
- Figma route/tracking re-audit: S12 now distinguishes three selectable route paths, calculation failure/retry and human acceptance; S13 adds active-shipment selection, GPS markers/tooltips and shipment context; S14 adds completed/current/planned legs plus coordinates, speed, heading, last GPS, ETA and progress.
- GPS context is also present in Command Center, the Shipment Detail route tab, and Customer Portal tracking. Each feature owns typed data under its own `mock/`; only the stateless map renderer is shared in `components/common`.
- Customer Portal reimplementation: replaced the placeholder workspace with nine feature-local workspaces and a responsive desktop/mobile shell. Portal mock data is centralized under `src/features/customer-portal/mock/`; local search, filtering, selection, document preview, quote confirmation, invoice detail, AI review, read state and notification preferences are interactive without presenting fixture state as a persisted transaction.
- Feature ownership refactor: route-owned UI now lives in meaningful `index.tsx` page compositions at each nested sub-feature. Shared concerns remain at the feature root; all multi-route `components/*-workspace.tsx` and `workspaces/**/*-workspace.tsx` page monoliths were removed. Dynamic shipment, document, compliance, negotiation, invoice, AI execution and email identifiers are passed into their detail compositions.
- The mandatory ownership contract is documented in `/home/kaito/project/aurora-client/rules.md` and linked from `AGENTS.md`. A static architecture regression suite verifies 38 nested page indexes, two single-screen root compositions, rejects 21 obsolete workspace paths, enforces three dynamic shipment parameter boundaries, and prevents the deprecated `src/libs/` tree from returning.
- Shared infrastructure is normalized under singular `src/lib/`: shadcn/Tailwind utilities remain in `src/lib/utils.ts`, while query infrastructure lives in `src/lib/query/`.
- Customer Portal disclosure rules are explicit: the tracking screen labels GPS as stale and withholds current coordinates/speed/heading; the AI assistant exposes result, confidence, rationale, sources, timestamp, suggested action and human-review context while excluding internal operations, tenant administration and commercial controls.
- Browser-based visual inspection was requested by the implementation workflow but local-browser permission was unavailable in the validation environment. Runtime behavior is covered by component interaction tests, production build, route generation and static responsive review; no browser-pass claim is made for this re-audit.

## Customer Portal QA rerun — 25 Aug 2026

- `pnpm test`: 11 files, 30 tests passed. An initial parallel run caused two 5-second resource-contention timeouts; both targeted tests and the subsequent isolated full suite passed without changing timeout thresholds.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed with no TypeScript errors.
- `npx prettier@3.6.2 --check . --ignore-unknown`: passed after formatting the full project.
- `pnpm exec next build --webpack`: passed; all static and dynamic portal routes appeared in the generated manifest.
- Production HTTP smoke on port 3100: all nine portal routes returned 200.
- In-app browser desktop/mobile inspection: attempted and denied by local browser permission; no visual-browser pass is claimed.

## Feature ownership QA rerun — 25 Aug 2026

- Structural TDD: the first architecture run failed 30/30 checks against the old monolith layout; the expanded final suite passes all 65 ownership, route-boundary, and shared-infrastructure checks.
- `pnpm test`: 12 files, 95 tests passed. One initial full-suite run hit the existing 5-second route-planning timeout under resource contention; the isolated test passed in 1.93 seconds and the immediate full-suite rerun passed without changing production code or timeout thresholds.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed with no TypeScript errors.
- `npx prettier@3.6.2 --check . --ignore-unknown`: passed.
- `pnpm exec next build --webpack`: passed with all expected static and dynamic routes in the manifest.
- No feature page-composition file matching `*workspace*.tsx` remains, and no route screen is selected through a `mode` prop.

## Route and tracking map QA rerun — 25 Aug 2026

- Figma design context was read for S12 `98:2`, S13 `99:230`, and S14 `100:520` under Route & Tracking page `56:7` before implementation.
- The restrained light vector map now supports zoom/reset, traffic and restriction layers, accessible route controls, marker tooltips, loading/unavailable states, and explicit fixture disclosure while preserving map children and shipment context.
- Route Planning owns route comparison, calculation failure/retry and local human acceptance. Live Map owns functional Status/Mode/Risk/Customer/Region filters, search, marker selection and its responsive shipment drawer; filtering applies consistently to the queue, routes, markers and selected drawer. Shipment Tracking owns deviation review and never substitutes another shipment's telemetry or route controls for an unknown dynamic ID.
- `route-planning`, `live-map`, and `shipment-tracking` each own local `mock/`, `types/`, and `stores/`; the root feature retains only genuinely shared realtime presentation and fixture-state utilities. Architecture tests reject a feature-wide mock/store regression.
- Fixture GPS is labeled `Simulated current`, never backend-live, including Shipment Detail. Stale data displays exactly `Last update 18 mins ago`; speed/heading are withheld outside a current snapshot, and offline/disconnected states withhold coordinates, ETA, motion, and route progress. Disconnected state exposes a local Reconnect action.
- The map SVG is presentational; keyboard users select route alternatives through native buttons. Static markers expose image semantics, and the selected shipment drawer is in normal document flow on mobile before becoming a restrained desktop overlay.
- TDD covered map layers, context-preserving loading/error states, route comparison/failure/acceptance, live filters/drawer, unknown shipment IDs, deviation handling, and stale/offline telemetry honesty. Final focused reviewer regression: 4 files, 16 tests passed.
- Full suite: 15 files, 118 tests passed. Architecture ownership checks are included. Lint and strict TypeScript passed. The transport audit found no Axios, TanStack Query, WebSocket, or fetch calls in the UI-only route/tracking scope.
- `next build --webpack`: exit 0; 34/34 static pages generated and all expected static/dynamic routes appeared in the manifest.
- Production HTTP smoke was attempted, but this validation sandbox rejects local socket binding with `listen EPERM`; no HTTP-smoke pass is claimed for this rerun. Production build output and component interaction tests provide the available runtime evidence.
- Browser QA was attempted through the required runner, but Playwright and a local Chromium/Chrome executable are unavailable. No browser-visual pass is claimed.

## Real 3D map implementation — 25 Aug 2026

- Replaced the illustrative SVG map on S12, S13, S14, and Shipment Detail with a shared MapLibre WebGL renderer using real longitude/latitude fixtures and an OpenFreeMap vector basemap.
- Added MapLibre and strict Three.js declarations. Existing Three.js renders one selected shipment asset through a MapLibre custom 3D layer; a second React Three Fiber canvas was intentionally avoided to prevent camera/render-loop divergence. MapLibre was later pinned to `5.24.0` for WebGL1 compatibility; see the 26 Aug follow-up below.
- Added light building extrusion, semantic GeoJSON route/marker layers, restrained responsive pitch, optional MapTiler Terrain RGB v2, provider attribution, scale/navigation controls, reduced-motion behavior, and WebGL/style fallback.
- Added `NEXT_PUBLIC_MAP_STYLE_URL` and optional `NEXT_PUBLIC_MAPTILER_KEY` to `.env.example`. Full runtime and provider documentation is in `docs/ui-implementation/real-3d-map.md`.
- Real-map disclosure and simulated-telemetry disclosure are separate. No backend API, Query hook, Axios call, WebSocket, SSE connection, or fake endpoint was introduced.
- Geographic utilities and runtime configuration: 4 files, 8 tests passed. Feature integration tests: 4 files, 14 tests passed. Final full suite: 19 files, 127 tests passed.
- Full-suite QA initially exposed three post-teardown React scheduler errors from Customer Portal because the parameterized test did not explicitly unmount its nine React roots. Added `afterEach(cleanup)`; two consecutive default `pnpm test` runs then passed cleanly with 19 files and 127/127 tests.
- Lint, strict TypeScript, and targeted Prettier checks passed. `next build --webpack` exited 0, compiled MapLibre/Three.js, and generated 34/34 static pages with S12/S13/S14 and Shipment Detail routes in the manifest.
- Browser QA was attempted through the required local runner, but Playwright and a Chromium executable are not installed in this environment. No browser-visual pass is claimed.

## Real 3D map loading fix — 25 Aug 2026

- Reproduced the reported state where controls rendered but the canvas remained behind `Loading real 3D map`. The renderer was waiting for MapLibre's full `load` event, which can remain pending on a blocked tile, glyph, sprite, or style request.
- Operational layers initialize on `style.load`, but readiness waits for MapLibre's `load` event so the UI cannot claim a real vector map before the first visually complete frame.
- Added an eight-second initial-style timeout and provider failover. The original raster fallback was replaced on 26 Aug after environment diagnosis; see the follow-up below.
- Added WebGL regression coverage for successful style readiness, provider-error failover, and hung-provider timeout. Final validation evidence is recorded after the full QA rerun.
- Final QA: focused WebGL suite passed 3/3; full suite passed 20 files and 130/130 tests; ESLint and strict TypeScript passed; full-project Prettier check passed; `next build --webpack` compiled successfully and generated 34/34 static pages.
- Runtime browser screenshot could not be captured in this environment because the bundled browser runner reports `Playwright not installed`; the original visual symptom is covered by the new readiness and provider-failover regression tests, but no browser-visual pass is claimed.
- Follow-up screenshot on 26 Aug showed the style gate passing while the canvas remained visually empty. The state machine now handles post-style provider errors, times out both vector styles, preserves interactive SVG routes when both styles fail, and recovers from Brave/Linux `webglcontextlost` events.
- Follow-up QA: WebGL renderer state suite passed 5/5, WebGL2 capability suite passed 3/3, and the combined focused map suites passed 9/9. Full suite passed 21 files and 135/135 tests; ESLint, strict TypeScript, and full-project Prettier passed; `next build --webpack` compiled successfully and generated 34/34 static pages.

## Brave/Linux real-map compatibility follow-up — 26 Aug 2026

- The latest screenshot confirmed that the final SVG capability fallback works, but also confirmed that Brave still did not retain a GPU map context.
- Environment diagnosis found Brave `149.1.91.180` on Ubuntu/X11 with Intel UHD Graphics 620 and Mesa `25.2.8`. Isolated Brave WebGL probes reported a failed GPU command buffer and deprecated software-WebGL fallback. This is a runtime GPU-context failure, not evidence that Brave generally lacks WebGL support.
- The former `tile.openstreetmap.org` raster fallback resolved to loopback on this machine, while the OpenFreeMap Liberty style and vector TileJSON endpoints returned HTTP 200. The blocked raster dependency was removed.
- Pinned `maplibre-gl@5.24.0`, the final v5 release, so MapLibre can try WebGL2 and then WebGL1. MapLibre 6 removed WebGL1 support.
- Replaced raster fallback with an inline OpenFreeMap vector-lite style. It removes glyph/sprite dependencies but retains real vector landcover, water, roads, operational routes/markers, and building extrusion.
- The Three.js selected-shipment model now runs only when WebGL2 exists; a WebGL1-only canvas keeps the real map running without the model. Removed the model layer's unconditional repaint loop to reduce unnecessary GPU work.
- Focused map regression after the compatibility change: 6 files and 18/18 tests passed. Full validation is recorded after the final QA rerun.
- In-app localhost visual verification was attempted but blocked by the environment's saved browser permission. No browser-visual pass is claimed for this follow-up.
