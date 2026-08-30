# Real 3D Logistics Map

## Runtime

Route Planning, Live Operations Map, Shipment Tracking, and the Shipment Detail route tab use a real WebGL geospatial renderer instead of SVG geometry.

- `maplibre-gl@5.24.0`: vector-tile map, camera, GeoJSON sources, line/circle layers, building extrusion, attribution, scale, navigation controls, and WebGL2-to-WebGL1 compatibility fallback.
- `three@0.185.1`: one restrained selected-shipment model in a MapLibre custom 3D layer when WebGL2 is available.
- `@types/three@0.185.4`: strict TypeScript declarations for the existing Three.js dependency.
- OpenFreeMap Liberty: zero-credential default vector style using OpenMapTiles/OpenStreetMap data.
- OpenFreeMap vector-lite style: inline resilient style using the same vector tile service without glyph or sprite dependencies when the primary Liberty style does not complete within eight seconds.
- MapTiler Terrain RGB v2: optional elevation source when a public browser key is configured.

MapLibre 5.24 is intentionally pinned to the final v5 line because MapLibre 6 removed WebGL1. The capability gate accepts WebGL2 or WebGL1, and MapLibre tries WebGL2 before WebGL1. This preserves a real vector map and building extrusion on browser/GPU combinations that reject WebGL2. The Three.js shipment model remains WebGL2-only and is omitted on WebGL1 without taking down the map.

Official references:

- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [OpenFreeMap quick start](https://openfreemap.org/quick_start/)
- [MapTiler 3D terrain with MapLibre](https://docs.maptiler.com/guides/maps-apis/maps-platform/how-to-build-a-3d-map-with-maplibre-v2-gl-js/)

## Environment

```dotenv
# Optional; defaults to OpenFreeMap Liberty.
NEXT_PUBLIC_MAP_STYLE_URL=

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

## Fallback

The previous SVG renderer remains available as `SvgMapFallback`.

The renderer first attempts the configured vector style. It initializes operational layers on MapLibre's `style.load` event, but it keeps the loading gate visible until MapLibre's `load` event confirms the first visually complete render. A recoverable resource error does not immediately destroy the primary style. If that style does not render within eight seconds, the renderer switches to the inline OpenFreeMap vector-lite style. The resilient style removes glyph and sprite dependencies while retaining real vector landcover, water, roads, route layers, markers, and building extrusion.

The same eight-second render gate applies to the vector-lite style. If neither style produces a visually complete frame, the renderer shows the interactive SVG route and marker fallback instead of an empty “map unavailable” panel. A later `webglcontextlost` event also activates this usable fallback.

The SVG renderer activates only when:

- WebGL is unavailable;
- both the primary and resilient vector styles cannot initialize;
- the map is explicitly unavailable;
- component tests run in JSDOM.

The fallback preserves shipment children, route/marker semantics, retry behavior, layer controls, and an explicit `3D map fallback` badge. Provider errors after a visually complete render do not automatically destroy the operational context.

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
