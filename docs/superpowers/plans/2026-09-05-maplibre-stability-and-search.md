# MapLibre Stability Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Aurora's MapLibre integration resilient across Next.js bundlers, provider failures, sub-path deployments, production asset delivery, and increasing marker volume.

**Architecture:** Keep `src/components/common/geo-map` as the only owner of MapLibre lifecycle, worker configuration, basemap fallback, health state, and rendering performance. Keep feature filtering and shipment semantics outside the renderer. Search/geocoding is explicitly deferred to the later API integration and is out of scope for this plan. Use a configurable secondary style provider rather than assuming that a second OpenFreeMap style is an independent outage fallback.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, MapLibre GL JS 6.6.x, OpenFreeMap, optional MapTiler terrain, Vitest, React Testing Library, Playwright/browser runtime when available.

**Spec:** `docs/superpowers/specs/2026-08-25-real-3d-logistics-map-design.md` plus the provider/worker findings recorded in the MapLibre official Next.js guidance and the 2026-09-05 repository review.

## Global Constraints

- Follow `AGENTS.md` and keep MapLibre imports behind `src/components/common/geo-map`.
- Do not add a second HTTP client, backend endpoint, WebSocket, SSE transport, or geocoder provider without an explicit provider/API contract.
- Keep `NEXT_PUBLIC_MAP_STYLE_URL` as the primary style override and add `NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL` only as an optional independent secondary style.
- Copy `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs` from the installed package into the same `public/maplibre` directory before `dev` and `build`.
- Do not copy source maps to production `public/maplibre`; runtime needs only the two `.mjs` files.
- Do not label fixture telemetry as live backend data.
- Preserve the SVG fallback and all current loading, unavailable, retry, attribution, and simulated-telemetry disclosures.
- Pin the MapLibre package to the exact version selected for the implementation; upgrade it only together with worker and browser verification.
- Do not commit, delete unrelated files, or modify the existing dirty worktree changes.

---

### Task 1: Make the worker asset contract minimal and deployment-safe

**Files:**

- Modify: `package.json`
- Modify: `scripts/copy-maplibre-worker.mjs`
- Modify: `src/components/common/geo-map/utils/load-maplibre.ts`
- Test: `src/components/common/geo-map/utils/load-maplibre.test.ts`
- Create: `src/components/common/geo-map/utils/maplibre-asset-health.ts`
- Test: `src/components/common/geo-map/utils/maplibre-asset-health.test.ts`

**Interfaces:**

- `configureMapLibreWorker(maplibre: { setWorkerUrl(workerUrl: string): void }): void`
- `getMapLibreWorkerUrl(baseUri?: string): string`
- `getMapLibreSharedUrl(baseUri?: string): string`
- `checkMapLibreWorkerAssets(fetcher: typeof fetch, baseUri?: string): Promise<{ worker: "ok" | "error"; shared: "ok" | "error"; ok: boolean }>`

- [x] Write failing tests proving that the worker and shared URLs resolve under `/`, `/aurora/`, and a document base URI with a trailing slash.
- [x] Write a failing test proving the health check requires HTTP `ok` for both `.mjs` files and returns `ok: false` when either file is missing.
- [x] Change the copy script to copy only `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs`.
- [x] Pin `maplibre-gl` to the installed exact version selected by the repository instead of a floating caret range.
- [x] Configure MapLibre with `getMapLibreWorkerUrl(document.baseURI)` before the first map instance is created.
- [x] Implement the health helper with same-origin `fetch` requests, `cache: "no-store"`, and no credential/header access.
- [x] Run `pnpm.cmd test -- src/components/common/geo-map/utils/load-maplibre.test.ts src/components/common/geo-map/utils/maplibre-asset-health.test.ts` and verify all tests pass.
- [x] Inspect `public/maplibre` and confirm only the two runtime `.mjs` files are required by the copy script.

### Task 2: Add independent style fallback configuration

**Files:**

- Modify: `.env.example`
- Modify: `src/components/common/geo-map/constants/map-config.ts`
- Modify: `src/components/common/geo-map/constants/map-config.test.ts`
- Modify: `src/components/common/geo-map/logistics-geo-map.tsx`
- Modify: `src/components/common/geo-map/types/index.ts`

**Interfaces:**

- Extend `PublicMapEnvironment` with `NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL?: string`.
- Extend runtime config with `fallbackStyleUrl?: string` and `hasIndependentFallback: boolean`.
- Preserve `OPENFREEMAP_LITE_STYLE` as the same-provider resilient style; do not call it an independent provider fallback.

- [x] Add failing tests for empty, whitespace-only, and configured `NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL` values.
- [x] Add the optional environment variable to `.env.example` with a warning that it must point to a provider independent from the primary style.
- [x] Change the style timeout flow to try the independent fallback URL first when configured, then the inline OpenFreeMap resilient style, then the existing SVG fallback.
- [x] Keep the fallback chain idempotent so repeated `style.load`, `error`, or timeout events cannot call `setStyle` more than once per fallback stage.
- [x] Preserve operational GeoJSON layers, attribution, controls, and children after every style replacement.
- [x] Add component tests proving the fallback order and that no secondary URL is requested when it is absent.
- [x] Run `pnpm.cmd test -- src/components/common/geo-map/constants/map-config.test.ts src/components/common/geo-map/logistics-geo-map.webgl.test.tsx` and verify all tests pass.

### Task 3: Surface worker/style/tile failures instead of relying only on idle timeout

**Files:**

- Modify: `src/components/common/geo-map/logistics-geo-map.tsx`
- Modify: `src/components/common/geo-map/components/svg-map-fallback.tsx`
- Create: `src/components/common/geo-map/types/map-health.ts`
- Test: `src/components/common/geo-map/logistics-geo-map.webgl.test.tsx`
- Test: `src/components/common/geo-map/utils/maplibre-asset-health.test.ts`

**Interfaces:**

- Define `MapHealthState = "checking" | "ready" | "worker-error" | "style-error" | "tile-error" | "webgl-error"` in `types/map-health.ts`.
- Keep `LogisticsGeoMap` props unchanged for feature consumers; health remains internal except for accessible fallback copy.
- Add a pure `classifyMapLibreError(error: unknown): "style-error" | "tile-error" | "worker-error" | "unknown"` helper beside the map runtime utilities.

- [x] Add failing tests for a missing worker health check, a style resource error, a tile resource error, `webglcontextlost`, and an idle timeout.
- [x] Run the focused WebGL test and verify the new cases fail before implementation.
- [x] Run the asset health check before creating `new maplibre.Map`; show the existing SVG fallback with retry when the local worker pair is unavailable.
- [x] Attach a single stable MapLibre error handler that records the health state and ignores recoverable tile errors until the configured timeout expires.
- [x] Keep console logging development-only, but make the user-facing fallback state deterministic and accessible.
- [x] Ensure every map event handler, timer, `ResizeObserver`, custom marker, and map instance is cleaned up on unmount.
- [x] Run `pnpm.cmd test -- src/components/common/geo-map/logistics-geo-map.webgl.test.tsx src/components/common/geo-map/logistics-geo-map.test.tsx` and verify all tests pass.


### Task 4: Harden style compatibility and terrain behavior

**Files:**

- Modify: `src/components/common/geo-map/utils/map-style.ts`
- Modify: `src/components/common/geo-map/utils/operational-layers.ts`
- Modify: `src/components/common/geo-map/constants/map-config.ts`
- Test: `src/components/common/geo-map/utils/map-style.test.ts`
- Test: `src/components/common/geo-map/utils/operational-layers.test.ts`

**Interfaces:**

- `getBuildingLayerTarget(style: StyleLike): { source: string; sourceLayer: string; beforeLayerId?: string } | undefined`
- `addTerrain(map: MapLibreMap, terrainUrl?: string): boolean`
- `setBuildingLayersVisibility(map: MapLibreMap, visible: boolean): void`

- [x] Add failing tests for styles with no building source, a building source without symbol layers, duplicate building layer IDs, and a terrain URL that is absent.
- [x] Guard all style-dependent `getLayer`, `addLayer`, `setLayoutProperty`, and `setTerrain` calls behind the appropriate source/layer existence checks.
- [x] Ensure a custom style without OpenMapTiles `building` layers still renders operational routes and markers without throwing.
- [x] Ensure terrain is disabled when no MapTiler key exists and that a terrain source is not registered twice after style replacement.
- [x] Run the utility tests and verify all tests pass.

### Task 5: Reduce marker overhead at fleet scale

**Files:**

- Modify: `src/components/common/geo-map/logistics-geo-map.tsx`
- Modify: `src/components/common/geo-map/utils/operational-layers.ts`
- Modify: `src/components/common/geo-map/utils/shipment-map-marker.tsx`
- Modify: `src/components/common/geo-map/types/index.ts`
- Test: `src/components/common/geo-map/logistics-geo-map.webgl.test.tsx`
- Test: `src/components/common/geo-map/utils/operational-layers.test.ts`

**Interfaces:**

- Preserve `markersToFeatureCollection(markers)` for the GPU-rendered operational layer.
- Add a local threshold constant, for example `HTML_MARKER_LIMIT = 100`.
- Keep HTML markers for selected/current or small datasets; use the GeoJSON marker layer for the rest.

- [x] Add failing tests proving small datasets retain accessible HTML markers and large datasets do not create one DOM marker per shipment.
- [x] Keep marker click selection available through the GeoJSON `aurora-markers` layer for large datasets.
- [x] Render the custom HTML marker only for selected/current markers when the threshold is exceeded.
- [x] Verify marker reconciliation removes stale DOM markers and does not leak event listeners.
- [x] Run focused map and operational-layer tests.

### Task 6: Add production smoke checks and browser verification

**Files:**

- Create: `scripts/check-maplibre-assets.mjs`
- Modify: `package.json`
- Create: `tests/e2e/maplibre-smoke.spec.ts`
- Modify: `docs/ui-implementation/real-3d-map.md`
- Modify: `docs/ui-implementation/phase-status.md`

**Interfaces:**

- `check-maplibre-assets.mjs` exits non-zero when either runtime asset is absent, unreadable, or not served as JavaScript after a production build.
- The browser smoke test visits `/live-map` and checks the worker request, style request, first rendered map state or explicit SVG fallback, absence of uncaught console errors, and usable map controls.

- [x] Add a failing asset smoke script for missing worker/shared files.
- [x] Add `check:maplibre-assets` and a `prebuild`/post-build invocation that does not overwrite generated source files outside `public/maplibre`.
- [x] Implement the smoke script using Node filesystem checks and, when a server URL is provided, HTTP status/content-type checks for both assets.
- [x] Add the Playwright test with desktop and mobile projects, but skip only when the repository has no browser installation; record the exact skip reason.
- [x] Verify `/maplibre/maplibre-gl-worker.mjs` and `/maplibre/maplibre-gl-shared.mjs` return HTTP 200 in the running Next.js app.
- [x] Inspect browser console and network requests; treat worker 404, shared-module 404, style failure, and uncaught WebGL errors as failures.
- [x] Run `pnpm.cmd typecheck`, `pnpm.cmd lint`, focused map/live-map tests, full `pnpm.cmd test`, and `pnpm.cmd build`.
- [x] Record only observed browser/build evidence in the documentation.

## Review Checklist

- [x] `public/maplibre` contains the two runtime modules required by MapLibre v6, in the same directory.
- [x] Worker URL works at the deployed base URI, including a configured sub-path.
- [x] Primary style failure can reach an independent provider when configured, then the same-provider resilient style, then SVG.
- [x] Missing worker/shared assets produce a visible fallback instead of an indefinite loading state.
- [x] No production source maps are copied unless explicitly enabled for a debug build.
- [x] Search/geocoding remains explicitly deferred to the future API integration and is not expanded in this map hardening work.
- [x] Map tests, typecheck, lint, build, and browser smoke verification have evidence.
- [x] No commit or unrelated worktree cleanup is performed by the implementer.

