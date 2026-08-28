# TESTING + QUALITY GATES

Per phase run appropriate lint, typecheck, tests, and build.

Meaningful tests should target pure transforms, critical schemas, important interactions, permissions, and data hooks where practical.

Recommended final Playwright flows:
Create Shipment, Import Shipment, GPS exception/replan, OCR+Compliance, Negotiation approval, Delivery→Settlement.
