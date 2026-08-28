# Phase 05 — Shipment Core

## Figma scope

Inspect [05 — Shipments](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-6): S05–S11, especially S06 steps 01–06, S07 import and S08 mapping/validation.

## Prompt for the coding AI

Complete `features/shipment` with `ShipmentListPage`, `CreateShipmentPage`, `ImportShipmentsPage`, detail tabs, `CargoDetailDrawer`, and `ShipmentTimeline`. Use local fixtures in `features/shipment/constants/*-ui-fixtures.ts` and view-only types under `features/shipment/types`.

Implement S05 list default/filtered/empty/no-results/loading/error/bulk-selected states with local search/filter/row-selection state. Implement the Create Shipment wizard steps exactly: 1 Shipment, 2 Locations, 3 Cargo, 4 Documents, 5 AI Planning, 6 Review. Include validation UI, dangerous-goods visual state, uploading/OCR processing/upload-error states, explainable AI planning loading/recommendation/failed states, review/submitting/submitted states, and the explicit human route-acceptance confirmation. Do not submit data.

Implement file selection and mapping/validation display locally for Import; retain partial-failure rows visibly rather than pretending import succeeded. Keep tables dense and not cardified. Run interaction tests for wizard progression/validation and lint/typecheck/build, then stop.
