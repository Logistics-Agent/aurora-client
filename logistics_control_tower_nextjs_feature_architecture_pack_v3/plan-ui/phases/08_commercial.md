# Phase 08 — Cost, Negotiation and Billing

## Figma scope

Inspect [09 — Cost & Negotiation](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-10) and [10 — Billing](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-11): S21–S25.

## Prompt for the coding AI

Implement `features/commercial/cost`, `features/commercial/negotiation`, and `features/commercial/billing` plus their thin routes. Use feature-local commercial fixtures and local filters/selection/dialog state only. Build S21 Cost Estimate, S22 Negotiation Center, S23 Negotiation Detail, S24 Billing List and S25 Invoice Detail with contextual shipment identity and links back to Shipment Detail.

Show cost composition, variance/abnormal state, negotiation timeline and carrier-offer review. AI counter-offer UI must include confidence/sources/reason/action and must never auto-send. Accepting an offer requires the explicit confirmation dialog. Implement invoice status, overdue state, payment-record dialog and settlement display locally without billing or payment calls.

Customer-safe commercial rendering belongs in Phase 11, not as a staff page with controls hidden. Run lint/typecheck and stop.
