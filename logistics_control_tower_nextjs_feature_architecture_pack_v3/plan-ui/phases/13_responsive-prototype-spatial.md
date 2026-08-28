# Phase 13 — Responsive Behavior, Local Prototype Flows and Spatial Polish

## Figma scope

Inspect P15 staff responsive frames on [04 — Overview](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-5), customer mobile frames on page 56:16, and Flow A–F on [16 — Prototype Flows](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-17).

## Prompt for the coding AI

Validate staff screens at 1440×900 and 1280×800; use a secondary tablet layout where Figma provides one. Do not force complex Route Planning, Live Map, OCR Review or AI Operations workspaces into a phone layout. Validate Customer Portal at 390px.

Implement local UI navigation states for six journeys, using existing feature routes or in-memory state only: A Create Shipment (all six steps), B Import Shipment validation/partial result, C GPS exception → alternative → human approval → ETA update, D OCR → human review → compliance resolution, E carrier email → AI extraction → human review → negotiation approval, F delivery → invoice → payment → settlement. No API/AI/realtime transport is permitted. Motion must be subtle and communicate selection/progression only.

Polish functional spatial visual components shared by Command Center, Live Map, Route Planning, Tracking and Shipment route context. Lazy-load existing heavy 3D only if the app already supports it; otherwise retain the Figma-equivalent light spatial composition and fallback. Run responsive visual checks, lint/typecheck/build, then stop.
