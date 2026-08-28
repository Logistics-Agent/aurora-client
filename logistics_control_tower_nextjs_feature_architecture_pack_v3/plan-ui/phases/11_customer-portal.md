# Phase 11 — Customer Portal Desktop and Mobile

## Figma scope

Inspect [15 — Customer Portal](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-16): nine desktop screens and seven mobile frames.

## Prompt for the coding AI

Implement a distinct `features/customer-portal` and `(customer)` route layout. Do not import a staff screen and hide controls. Reuse only stable primitives, status semantics and shipment view components. Build Overview, My Shipments, Shipment Detail, Tracking, Documents, Quotes, Invoices, AI Assistant and Notifications using customer-scoped fixtures.

The exact portal navigation is Overview, My Shipments, Documents, Quotes, Invoices, AI Assistant and Notifications. Customer data never contains internal cost/floor, negotiation strategy, other customer data, AI Ops, Audit Log, tenant administration or GPS device admin. Customer AI answers are limited to customer-visible shipment/documents/invoices/milestones and explicitly state that no action changes data.

Build the Figma mobile variants for list, detail, tracking, documents, invoice, notifications and assistant with a usable bottom navigation and 390px viewport. Verify 390px and desktop side-by-side. Run lint/typecheck and stop.
