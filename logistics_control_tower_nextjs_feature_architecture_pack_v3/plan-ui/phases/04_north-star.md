# Phase 04 — North Star: Command Center and Shipment Detail

## Figma scope

Inspect [S04 Global](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=86-2), Vietnam, selected, alert and partial-failure variants on page 56:5; inspect [S09 Shipment Detail](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=87-2), exception, route context and stale variants on page 56:6.

## Prompt for the coding AI

Implement `features/command-center` at `/overview` and the initial `features/shipment` detail shell at `/shipments/[shipmentId]`. Build fixture-driven KPI, global/Vietnam map composition, exception list, operational pulse, map selection and partial failure state. Use an SVG/CSS spatial map or existing R3F boundary only if already installed; do not add a WebGL dependency merely to fake a backend. The spatial treatment is functional, pale blue and restrained.

Build Shipment Detail as the common entity anchor: route/current-position panel, clear shipment status, risk and operational flags, ETA/delay, timeline preview, document count, cost, and contextual tab bar. Use local selection/tabs only. Every contextual destination must retain a visible shipment identity and return path.

Compare both screens side-by-side with Figma at 1440×900 before continuing. Fix hierarchy, panel proportion, typography, semantic colors and map restraint. Run lint/typecheck/build and stop.
