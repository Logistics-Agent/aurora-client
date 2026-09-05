# Real 3D Logistics Map

## Runtime

Route Planning, Live Operations Map, Shipment Tracking, and the Shipment Detail route tab use a real WebGL geospatial renderer instead of SVG geometry.

- `maplibre-gl@6.6.0`: vector-tile map, camera, GeoJSON sources, line/circle layers, building extrusion, attribution, scale, and navigation controls. Pinned to exact version `6.6.0` to avoid worker/library bundle mismatch.
- `three@0.185.1`: one restrained selected-shipment model in a MapLibre custom 3D layer when WebGL2 is available.
- `@types/three@0.185.4`: strict TypeScript declarations for the existing Three.js dependency.
- OpenFreeMap Liberty: zero-credential default vector style using OpenMapTiles/OpenStreetMap data.
- OpenFreeMap vector-lite style: inline resilient style using the same vector tile service without glyph or sprite dependencies when the primary style does not complete within eight seconds.
- MapTiler Terrain RGB v2: optional elevation source when a public browser key is configured.

Official references:

- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [OpenFreeMap quick start](https://openfreemap.org/quick_start/)
- [MapTiler 3D terrain with MapLibre](https://docs.maptiler.com/guides/maps-apis/maps-platform/how-to-build-a-3d-map-with-maplibre-v2-gl-js/)

## Worker Asset Distribution and Validation

MapLibre requires dedicated web worker scripts for background tile parsing and geometry tiling.

1. **Runtime Worker Copying (`scripts/copy-maplibre-worker.mjs`):**
   - Automatically executed before `dev` and `build`.
   - Copies only runtime `.mjs` artifacts (`maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs`) into `public/maplibre/`.
   - Excludes `.js.map`, `.d.ts`, or non-runtime bundle files to avoid build bloat and unnecessary static assets.
2. **Worker Configuration (`load-maplibre.ts`):**
   - Uses `maplibregl.setWorkerUrl()` to bind worker scripts to the application's base path (`NEXT_PUBLIC_BASE_PATH`).
   - Dynamically resolves both worker and shared module URLs with trailing slash normalization.
3. **Pre-Mount Asset Health Probing (`maplibre-asset-health.ts`):**
   - In browser environments, probes worker asset availability via same-origin `GET` requests with `cache: 'no-store'` before instantiating the WebGL canvas.
   - If assets return 404 or fail to load, immediately transitions to the fallback state rather than hanging on worker creation.
4. **Postbuild Validation (`scripts/check-maplibre-assets.mjs`):**
   - Automatically invoked during `pnpm build` via `postbuild` (or standalone via `pnpm check:maplibre-assets`).
   - Validates existence, minimum file size, and valid JavaScript syntax of both worker files in `public/maplibre/`.
   - Accepts a server URL as a positional CLI argument, or through `MAPLIBRE_SMOKE_SERVER_URL`, for live HTTP response and MIME type verification.

## Environment

```dotenv
# Optional; defaults to OpenFreeMap Liberty.
NEXT_PUBLIC_MAP_STYLE_URL=

# Optional; independent secondary vector style fallback (must not share host with primary).
NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL=

# Optional; enables MapTiler Terrain RGB v2.
NEXT_PUBLIC_MAPTILER_KEY=
```

Both values are exposed to the browser by Next.js. Never place a private server credential in either variable. Apply provider-side origin restrictions and usage limits to a production MapTiler key.

## Ownership

The shared renderer lives under:

```text
src/components/common/geo-map/
├── components/
├── constants/
├── hooks/
├── types/
├── utils/
├── logistics-geo-map.tsx
└── index.ts
```

It owns only geospatial rendering mechanics. Feature behavior and geographic fixture data remain local under:

```text
src/features/route-tracking/route-planning/
src/features/route-tracking/live-map/
src/features/route-tracking/shipment-tracking/
src/features/shipment/shipment-detail/
```

## 3D behavior

- Desktop pitch: 56°.
- Tablet pitch: 45°.
- Mobile pitch: 35°.
- Reduced motion: 0° pitch and immediate camera fitting.
- Buildings: low-opacity light extrusion from an OpenMapTiles-compatible `building` source layer.
- Terrain: enabled only when `NEXT_PUBLIC_MAPTILER_KEY` is present, with restrained 1.15× exaggeration.
- Shipment asset: a small procedural Three.js vehicle is rendered only for the selected current marker and only when the map canvas has WebGL2. It does not force a continuous repaint loop.
- Routes and all non-selected markers remain GPU-efficient MapLibre GeoJSON layers.

MapLibre owns geospatial camera transitions through `fitBounds`. GSAP is not connected to the MapLibre camera because two animation loops would compete for the same view state.

## Data honesty

The basemap and geographic coordinates are real. Shipment movement is not realtime.

- UI disclosure: `Real vector map · 3D buildings`.
- Resilient-style disclosure: `Real vector map · resilient 3D style` when building extrusion is available, otherwise `Real vector map · resilient style`.
- Telemetry disclosure: `Simulated telemetry`.
- Current fixture state: `Simulated current`.
- Stale/offline/disconnected behavior continues to withhold current motion.
- Unknown shipment IDs receive no substituted route or telemetry.

No API, Axios call, TanStack Query hook, WebSocket, SSE connection, or fake endpoint was added.

## Fallback and Error Resilience

The previous SVG renderer remains available as `SvgMapFallback`.

The renderer implements a multi-stage, idempotent fallback cascade:
1. **Primary Style:** Attempts the configured vector style (`NEXT_PUBLIC_MAP_STYLE_URL` or OpenFreeMap Liberty).
2. **Independent Fallback Style:** If configured via `NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL`, fails over to this operator-selected secondary vector provider.
3. **Resilient Style:** If primary (and secondary) fail or exceed an 8-second visual completeness gate, switches to the inline OpenFreeMap vector-lite style. This style operates without external glyph or sprite dependencies while retaining real vector roads, landcover, water, routes, and building extrusion.
4. **Interactive SVG Fallback:** If all vector styles fail or if WebGL is unavailable / context lost, activates `SvgMapFallback`.

### Error Classification and Recovery
Rather than silently stalling until the idle timeout expires, runtime errors are classified immediately via `classifyMapLibreError`:
- `asset-load-failure`: Worker or shared module failed to fetch or returned non-200.
- `webgl-context-lost`: WebGL context was destroyed by browser/GPU watchdog.
- `webgl-unsupported`: Hardware or driver lacks WebGL capability.
- `style-load-failure`: Vector style JSON failed to parse or could not be loaded.
- `tile-error`: Fatal vector tile decode or network failure.
- `unknown`: General runtime exception.

When falling back to SVG due to an error, `SvgMapFallback` displays:
- A descriptive error banner informing the user of the underlying cause.
- A semantic `data-health-state` attribute for automated testing and health monitoring.
- An accessible **"Thử lại tải bản đồ 3D"** (Retry) button with nonce invalidation, cleanly tearing down and re-attempting WebGL initialization without requiring a full page refresh.

## Fleet-Scale Marker Strategy

To prevent browser DOM exhaustion and frame drops when tracking dense fleets:
- **DOM Marker Threshold (`HTML_MARKER_LIMIT = 100`):** When marker count exceeds 100, full HTML DOM markers are rendered exclusively for the `selectedMarkerId` or active `tone === "current"` vehicles.
- **GPU Circle Layer Fallback:** All non-selected fleet markers transition to GPU-accelerated circle layers with full opacity, preserving spatial awareness at 60 FPS without thousands of DOM elements.
- **Dynamic Reconciliation:** Selecting a marker dynamically promotes it to a full interactive DOM marker while demoting previously selected markers back to GPU rendering.


## Brave on Linux troubleshooting

Brave supports WebGL, but browser/GPU combinations can still lose the GPU process or block map-provider requests.

1. Open `brave://gpu` and confirm WebGL and WebGL2 are hardware accelerated.
2. Confirm **Settings → System → Use graphics acceleration when available** is enabled, then relaunch Brave.
3. Temporarily lower Shields for the local application and check whether `tiles.openfreemap.org` requests are blocked in DevTools Network.
4. Compare the same route in Chrome or Firefox. If only Brave fails, capture `brave://gpu` after the failure; a current Brave/Linux GPU-process regression is tracked in [brave/brave-browser#52749](https://github.com/brave/brave-browser/issues/52749).

The Ubuntu development machine used for the 26 Aug investigation resolves `tile.openstreetmap.org` to loopback, so the former raster fallback could never load there. That dependency has been removed. OpenFreeMap's style and vector TileJSON endpoints both returned HTTP 200 during the same investigation.

Do not ship browser launch flags as an application fix. The UI must remain usable through its vector-style and SVG fallback states.

## Deferred production integration

- authenticated tile-provider configuration;
- live GPS snapshot API;
- WebSocket/SSE telemetry;
- historical breadcrumb persistence;
- geofencing and ETA services;
- production map performance telemetry.
