# Real 3D Logistics Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the illustrative SVG logistics map with a real MapLibre WebGL map, restrained 3D buildings/terrain/assets, honest fixture telemetry, and a reliable SVG fallback.

**Architecture:** A shared `geo-map` renderer owns MapLibre/Three.js lifecycle and presentation mechanics. Route/tracking sub-features continue to own geographic fixture data, filtering, selection, freshness, and workflow semantics. The existing shared map becomes a compatibility boundary while screens migrate to longitude/latitude contracts.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, MapLibre GL JS, Three.js, Zustand, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-25-real-3d-logistics-map-design.md`

## Global Constraints

- Default style URL is exactly `https://tiles.openfreemap.org/styles/liberty`.
- `NEXT_PUBLIC_MAP_STYLE_URL` may override the style.
- `NEXT_PUBLIC_MAPTILER_KEY` is optional and enables Terrain RGB v2 only.
- Telemetry remains a typed UI-only fixture and must never be labeled live.
- No backend endpoint, WebSocket, SSE, Axios call, TanStack Query hook, or fake API route.
- No feature imports `maplibre-gl` or `three` directly.
- Preserve feature-local `mock/`, `types/`, `stores/`, `utils/`, and meaningful `index.tsx` composition.
- Do not commit unless the user explicitly authorizes it.

---

### Task 1: Add the map runtime and configuration contract

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.env.example`
- Create: `src/components/common/geo-map/constants/map-config.ts`
- Create: `src/components/common/geo-map/types/index.ts`
- Test: `src/components/common/geo-map/constants/map-config.test.ts`

**Interfaces:**

- Produces: `MAP_STYLE_URL`, `MAPTILER_KEY`, `GeoPoint`, `LogisticsGeoRoute`, `LogisticsGeoMarker`, `GeoMapAvailability`.

- [ ] Write a failing test asserting the OpenFreeMap default and MapTiler terrain URL behavior.
- [ ] Run `pnpm vitest run src/components/common/geo-map/constants/map-config.test.ts` and verify RED.
- [ ] Install `maplibre-gl` with pnpm and add typed configuration/constants.
- [ ] Add documented public environment variables without secrets.
- [ ] Rerun the targeted test and verify GREEN.

### Task 2: Build geographic conversion utilities

**Files:**

- Create: `src/components/common/geo-map/utils/geojson.ts`
- Create: `src/components/common/geo-map/utils/map-style.ts`
- Test: `src/components/common/geo-map/utils/geojson.test.ts`
- Test: `src/components/common/geo-map/utils/map-style.test.ts`

**Interfaces:**

- Consumes: geographic types from Task 1.
- Produces: `routesToFeatureCollection(routes)`, `markersToFeatureCollection(markers)`, `getOperationalBounds(routes, markers)`, `getBuildingExtrusionLayer(style)`.

- [ ] Write failing tests with real HCM/Singapore coordinates, semantic route kinds, empty data, and a style with/without a building source.
- [ ] Run both utility test files and verify RED.
- [ ] Implement pure GeoJSON/bounds/style helpers with no browser globals.
- [ ] Rerun both test files and verify GREEN.

### Task 3: Preserve and isolate the SVG fallback

**Files:**

- Create: `src/components/common/geo-map/components/svg-map-fallback.tsx`
- Create: `src/components/common/geo-map/hooks/use-webgl-capability.ts`
- Test: `src/components/common/geo-map/components/svg-map-fallback.test.tsx`
- Modify: `src/components/common/logistics-map.tsx`

**Interfaces:**

- Produces: `SvgMapFallback`, `useWebglCapability()`.
- Preserves: loading/unavailable overlays, marker semantics, layer controls, zoom/reset, and children.

- [ ] Write failing tests for capability fallback, static marker semantics, retry, and context preservation.
- [ ] Run the fallback test and verify RED.
- [ ] Extract the current SVG renderer without changing its public behavior.
- [ ] Implement capability detection that returns `supported`, `unsupported`, or `checking`.
- [ ] Rerun existing logistics-map and fallback tests and verify GREEN.

### Task 4: Implement the MapLibre lifecycle boundary

**Files:**

- Create: `src/components/common/geo-map/logistics-geo-map.tsx`
- Create: `src/components/common/geo-map/components/map-status-overlay.tsx`
- Create: `src/components/common/geo-map/components/map-controls.tsx`
- Create: `src/components/common/geo-map/logistics-geo-map.test.tsx`
- Create: `src/components/common/geo-map/index.ts`
- Modify: `src/components/common/index.ts`

**Interfaces:**

- Consumes: Task 1 types/config, Task 2 helpers, Task 3 fallback.
- Produces: `LogisticsGeoMap(props)` and shared exports.

- [ ] Mock the MapLibre constructor and write failing tests for one-time initialization, cleanup, fit bounds, style errors, retry, and attribution/disclosure text.
- [ ] Run the component test and verify RED.
- [ ] Implement a lowest-level client component using refs and effects; import MapLibre CSS once at this boundary.
- [ ] Add real map attribution and separate simulated telemetry disclosure.
- [ ] Ensure style/tile failure swaps to SVG fallback without removing feature children.
- [ ] Rerun the component and existing shared-map tests and verify GREEN.

### Task 5: Add route, marker, building, terrain, and Three.js layers

**Files:**

- Create: `src/components/common/geo-map/utils/operational-layers.ts`
- Create: `src/components/common/geo-map/utils/shipment-model-layer.ts`
- Test: `src/components/common/geo-map/utils/operational-layers.test.ts`
- Test: `src/components/common/geo-map/utils/shipment-model-layer.test.ts`
- Modify: `src/components/common/geo-map/logistics-geo-map.tsx`

**Interfaces:**

- Produces: `syncOperationalLayers(map, routes, markers, visibility)`, `createShipmentModelLayer(marker)`, `disposeShipmentModelLayer(layer)`.

- [ ] Write failing tests for semantic line styling, filtered source updates, building extrusion insertion, optional terrain, selected shipment model placement, and disposal.
- [ ] Run both layer test files and verify RED.
- [ ] Implement GeoJSON source/layer synchronization and OpenMapTiles-compatible light building extrusion.
- [ ] Enable Terrain RGB v2 only when `NEXT_PUBLIC_MAPTILER_KEY` exists.
- [ ] Implement one restrained Three.js custom layer for the selected/current shipment and release GPU resources on replacement/unmount.
- [ ] Rerun the layer and map component tests and verify GREEN.

### Task 6: Migrate feature-local fixtures to geographic coordinates

**Files:**

- Modify: `src/features/route-tracking/route-planning/mock/index.ts`
- Modify: `src/features/route-tracking/route-planning/types/index.ts`
- Modify: `src/features/route-tracking/live-map/mock/index.ts`
- Modify: `src/features/route-tracking/live-map/types/index.ts`
- Modify: `src/features/route-tracking/shipment-tracking/mock/index.ts`
- Modify: `src/features/route-tracking/shipment-tracking/types/index.ts`
- Modify: `src/features/shipment/mock/index.ts`
- Test: existing feature tests plus fixture-shape tests in each owning sub-feature.

**Interfaces:**

- Consumes: `GeoPoint`, `LogisticsGeoRoute`, `LogisticsGeoMarker`.
- Produces: feature-local HCM, Cat Lai, corridor, port, and Singapore fixture coordinates.

- [ ] Add failing assertions that fixtures contain valid longitude/latitude ranges and preserve shipment IDs.
- [ ] Run the owning feature tests and verify RED.
- [ ] Replace SVG path/x/y fixture geometry with typed geographic coordinates while retaining the UI-only fixture annotation.
- [ ] Rerun feature tests and verify GREEN.

### Task 7: Integrate the real map into S12, S13, S14, and Shipment Detail

**Files:**

- Modify: `src/features/route-tracking/route-planning/index.tsx`
- Modify: `src/features/route-tracking/live-map/index.tsx`
- Modify: `src/features/route-tracking/shipment-tracking/index.tsx`
- Modify: `src/features/shipment/shipment-detail/index.tsx`
- Modify: their existing component tests.

**Interfaces:**

- Consumes: `LogisticsGeoMap` and geographic fixtures.
- Preserves: feature-local filters, acceptance, deviation, unknown-ID handling, stale/offline withholding, drawer behavior, and thin routes.

- [ ] Update tests first to require the real-map disclosure, feature interactions, filtered map data, unknown-ID safety, and SVG fallback.
- [ ] Run the four feature test files and verify RED.
- [ ] Replace shared SVG map calls with `LogisticsGeoMap` while keeping each index as meaningful composition.
- [ ] Connect selected route/marker, layers, availability, signal state, and responsive details through existing local stores.
- [ ] Rerun the four feature tests and verify GREEN.

### Task 8: Accessibility, responsive behavior, and performance policy

**Files:**

- Modify: `src/components/common/geo-map/logistics-geo-map.tsx`
- Modify: `src/components/common/geo-map/components/map-controls.tsx`
- Modify: `src/app/globals.css` only if MapLibre control theming cannot remain component-local.
- Test: `src/components/common/geo-map/logistics-geo-map.test.tsx`

**Interfaces:**

- Produces: keyboard-accessible external controls, reduced-motion camera policy, mobile pitch policy, and canvas fallback labeling.

- [ ] Add failing tests for accessible names, reduced motion, mobile mode, and all critical controls outside the canvas.
- [ ] Run the map component test and verify RED.
- [ ] Implement 58° desktop, reduced tablet, and 35° mobile pitch with no full-screen fly-through.
- [ ] Keep shipment details and semantic statuses in DOM outside WebGL.
- [ ] Rerun targeted tests and verify GREEN.

### Task 9: Document the new runtime and verify the project

**Files:**

- Create: `docs/ui-implementation/real-3d-map.md`
- Modify: `docs/ui-implementation/figma-code-map.md`
- Modify: `docs/ui-implementation/phase-status.md`
- Modify: `README.md` if local setup does not already point to `.env.example`.

**Interfaces:**

- Documents: provider, attribution, environment variables, architecture, fallback, 3D decisions, mock/realtime boundary, and deferred backend work.

- [ ] Write the runtime documentation with exact setup and disclosure behavior.
- [ ] Run Prettier over every touched source and documentation file.
- [ ] Run targeted geo-map and route/tracking tests.
- [ ] Run `pnpm test`, `pnpm lint`, and `pnpm typecheck`.
- [ ] Run `pnpm exec next build --webpack` and verify S12/S13/S14 plus Shipment Detail routes in the manifest.
- [ ] Attempt desktop/mobile browser inspection; record the exact environment limitation if unavailable.
- [ ] Update `phase-status.md` with only the validation evidence actually observed.

## Self-review result

- Every design requirement maps to at least one task.
- No backend or realtime integration is implied by the real basemap.
- Geographic types and helper names are consistent across tasks.
- No placeholders remain.
- Commit steps are intentionally omitted because the user prohibited commits unless explicitly requested.
