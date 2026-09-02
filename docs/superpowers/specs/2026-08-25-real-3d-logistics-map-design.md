# Real 3D Logistics Map Design

## Objective

Replace the illustrative SVG logistics map with a real WebGL geospatial map for Route Planning, Live Operations Map, Shipment Tracking, and Shipment Detail while preserving the approved light control-tower hierarchy and feature-first ownership.

## Decisions

- Use `maplibre-gl` as the map renderer.
- Use OpenFreeMap's Liberty vector style as the zero-credential default: `https://tiles.openfreemap.org/styles/liberty`.
- Render the default map with pitch, bearing, atmosphere, route elevation, and real building extrusion when the style exposes an OpenMapTiles-compatible building source.
- Support optional MapTiler terrain through `NEXT_PUBLIC_MAPTILER_KEY`. Without a key, the application remains a real pitched vector/building map and labels terrain as unavailable.
- Use existing `three` directly inside a MapLibre custom layer for restrained shipment assets. Do not create a second React Three Fiber canvas or synchronize two camera systems.
- Keep GPS and route data as typed feature-local fixtures. The basemap is real; telemetry remains explicitly simulated until a backend/realtime phase is authorized.
- Preserve the current SVG renderer as an automatic fallback for WebGL failure, tile/style failure, tests, reduced capability, and offline development.

## Dependency and configuration changes

- Add `maplibre-gl` to runtime dependencies.
- Add `NEXT_PUBLIC_MAP_STYLE_URL` to override the default OpenFreeMap style.
- Add optional `NEXT_PUBLIC_MAPTILER_KEY` for Terrain RGB v2.
- Document both variables in `.env.example` and this design.
- Import MapLibre CSS once from the shared geospatial client boundary.

No Mapbox token, Cesium dependency, backend endpoint, WebSocket, or fake API route is introduced.

## Ownership

```text
src/components/common/geo-map/
├── components/
│   ├── map-controls.tsx
│   ├── map-status-overlay.tsx
│   └── svg-map-fallback.tsx
├── constants/
│   └── map-config.ts
├── hooks/
│   └── use-webgl-capability.ts
├── types/
│   └── index.ts
├── utils/
│   ├── geojson.ts
│   └── map-style.ts
├── logistics-geo-map.tsx
└── index.ts

src/features/route-tracking/<sub-feature>/
├── mock/
├── stores/
├── types/
├── utils/
└── index.tsx
```

The shared map owns rendering mechanics only. Coordinates, shipment semantics, selected routes, filtering, freshness, and exception behavior remain in their owning feature/sub-feature.

## Public map contract

The new shared component accepts geographic data instead of SVG paths:

```ts
type GeoPoint = { longitude: number; latitude: number };

type LogisticsGeoRoute = {
  id: string;
  label: string;
  coordinates: GeoPoint[];
  kind: "planned" | "completed" | "current" | "alternative" | "risk";
  layer?: "traffic" | "restrictions";
};

type LogisticsGeoMarker = {
  id: string;
  label: string;
  detail: string;
  position: GeoPoint;
  tone: "origin" | "current" | "destination" | "alert";
  shipmentId?: string;
  heading?: number;
};
```

The existing `LogisticsMap` export becomes a compatibility wrapper during migration, then delegates to `LogisticsGeoMap`. No feature imports MapLibre directly.

## Rendering behavior

1. Initialize MapLibre only in the lowest client boundary after capability detection.
2. Fit the camera to route and marker bounds, then apply a restrained pitch between 48° and 58°.
3. Convert route fixtures to GeoJSON and render separate layers for completed, current, planned, alternative, and risk semantics.
4. Render buildings as light, low-opacity extrusions beneath operational layers.
5. Add a small Three.js shipment model only for the selected/current shipment; other shipments remain GPU-efficient symbol/circle layers.
6. Preserve layer toggles, zoom/reset, marker selection, route selection through native controls, loading, unavailable, and retry states.
7. Use MapLibre `easeTo`/`fitBounds` for geospatial camera movement. GSAP remains available for non-map spatial transitions but does not fight MapLibre's camera loop.

## Realtime honesty

- Basemap disclosure: `Real map · OpenStreetMap/OpenMapTiles data`.
- Fixture disclosure: `Simulated shipment telemetry · no live GPS transport`.
- Current fixture badge: `Simulated current`.
- Stale, offline, disconnected, and reconnecting states continue to withhold movement according to the existing contract.
- Unknown shipment IDs never receive another shipment's route or telemetry.

## Failure and fallback

- WebGL unavailable: show the current SVG renderer with an explanatory capability badge.
- Style/tile error: preserve shipment controls and show retry plus SVG fallback.
- Terrain key absent: retain real vector/building 3D and hide the terrain toggle.
- Reduced motion: camera changes are immediate or short fades; no fly-through.
- Component unmount: remove the MapLibre instance, custom Three.js resources, observers, and event listeners.

## Responsive behavior

- Desktop: pitched map, restrained building extrusion, right-side shipment details.
- Tablet: lower pitch and compact controls.
- Mobile: pitch reduced to 35°; details remain in document flow; 3D asset layer may be disabled under the capability/performance policy.
- All critical shipment status and controls remain available outside the canvas.

## Validation

- Unit tests for coordinate conversion, bounds, source/layer generation, capability fallback, and cleanup.
- Component tests with a mocked MapLibre constructor for initialization, route/marker updates, filter propagation, state overlays, retry, and fallback.
- Existing Route Planning, Live Map, Tracking, Shipment Detail, architecture, and honesty tests remain green.
- Run formatting, lint, strict typecheck, full tests, and `next build --webpack`.
- Inspect desktop and mobile when a browser runtime is available; do not claim visual QA when local browser/socket capability is blocked.

## Documentation deliverables

- Update `.env.example` with provider variables.
- Add `docs/ui-implementation/real-3d-map.md` with architecture, provider attribution, configuration, fallback, fixture/realtime boundaries, and operational controls.
- Update `docs/ui-implementation/figma-code-map.md` and `phase-status.md` with the real-map implementation and validation evidence.

## Deferred backend-only work

Live device ingestion, API snapshots, WebSocket/SSE transport, historical breadcrumb persistence, geofencing services, ETA calculation services, and production telemetry monitoring remain deferred.
