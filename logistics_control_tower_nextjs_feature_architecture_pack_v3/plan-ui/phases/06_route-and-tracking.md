# Phase 06 — Route Planning, Live Map and Tracking

## Figma scope

Inspect [06 — Route & Tracking](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-7): S12–S14 plus route calculation failure, map unavailable, GPS stale/offline and disconnected states.

## Prompt for the coding AI

Implement `features/route-tracking` with route planning, live operations map and shipment tracking workspaces. Reuse the common spatial/map visual language; keep scene composition feature-local. Use fixture route alternatives and local selected-route/selected-marker state. Do not implement GPS, WebSocket, map-provider, routing or ETA APIs.

Render planned/completed/current/alternative routes with the correct light semantic map palette. Include map tooltip and shipment drawer. Reproduce route-ready/selected/calculation-failed, map-loading/unavailable, live, route-deviation, GPS-stale, GPS-offline and realtime-disconnected frames. A stale object must show `Last update 18 mins ago` and must not show Live. The disconnected banner must preserve surrounding shipment context and provide a local reconnect affordance.

Ensure the Shipment Detail route tab composes contextual UI rather than deep-importing the global workspace. Run responsive visual checks, lint/typecheck, and stop.
