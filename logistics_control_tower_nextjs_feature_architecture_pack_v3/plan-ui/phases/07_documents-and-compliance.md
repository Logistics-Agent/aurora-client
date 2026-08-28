# Phase 07 — Documents, OCR and Compliance

## Figma scope

Inspect [07 — Documents & OCR](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-8) and [08 — Compliance](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-9): S15–S20.

## Prompt for the coding AI

Implement `features/documents` and `features/compliance`, with contextual Shipment tabs acting as adapters to local feature components. Build Document Center default/filtered/empty/loading/error, Upload Document default/confirmation, OCR queued/processing/completed/needs-review/failed, OCR review/default/low-confidence/edited/approval-confirmation, Compliance Center and Compliance Review Detail.

Use browser-local file selection only; do not upload, parse documents or call OCR/compliance APIs. OCR output uses labelled fixture data. Low-confidence fields require manual review; approving writes only local UI state after a confirmation dialog. Critical compliance findings use critical semantics and require evidence/actor/resolution confirmation. Do not expose private reasoning or make AI/OCR actions silent.

Use split review panels and document viewer structure from Figma, preserve shipment context, test the review/approval/reject local states, run lint/typecheck, and stop.
