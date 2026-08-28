# Phase 12 — Global States, Confirmations and Permission UX

## Figma scope

Inspect [14 — States](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-15), P13 on [16 — Prototype Flows](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-17), and P14 on page 56:14.

## Prompt for the coding AI

Wire common states into owning UI rather than leaving them as a disconnected gallery. Cover loading for dashboard/table/map/route/OCR/compliance/cost/AI/negotiation/invoice; empty states for shipments/tracking/documents/compliance/negotiations/invoices/notifications/email/AI/search/filter; error/partial states for API/GPS/map/AI timeout/OCR/compliance/upload/import/permission/session; realtime fresh/stale/offline/reconnecting; and AI queued/processing/completed/needs-review/failed.

Implement all eight sensitive confirmation dialogs: Cancel Shipment, Delete Draft, Accept AI Route, Reject OCR, Approve OCR, Approve Negotiation Offer, Record Payment and Mark Compliance Resolved. Write explicit consequence copy, maintain shipment/entity context and require local confirmation before state changes. Use toasts only for successful local actions; use banners/Notification Center for persistent or critical events.

Audit every staff/customer route for hide-versus-explain permission correctness. Add interaction tests for stale/offline semantics, confirmation cancellation and Customer feature exclusion. Run lint/typecheck and stop.
