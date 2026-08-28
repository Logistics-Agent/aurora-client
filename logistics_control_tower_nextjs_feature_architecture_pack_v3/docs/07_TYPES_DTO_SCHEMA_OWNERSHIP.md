# TYPES / DTO / SCHEMA OWNERSHIP — V3

## Root types

`src/types/` contains domain/application types broadly used across features.

Examples:

- Shipment
- Route
- TrackingPoint
- Document
- ComplianceFinding
- Invoice
- Negotiation
- User

## Root DTO

`src/dto/<domain>/` contains API transport request/query DTOs.

Examples:

```text
dto/shipment/
├── create-shipment.dto.ts
├── update-shipment.dto.ts
├── shipment-query.dto.ts
└── index.ts
```

## Feature-local presentation types

A feature may still own view-only/presentation types:

```text
features/shipment/types/shipment-table-row.types.ts
features/route-tracking/types/map-layer.types.ts
```

These must not replace shared domain/API types.

## Schemas

Use Zod schemas:

- root `schemas/` when cross-feature/API-wide,
- feature-local schema when it only exists for one feature UI/form workflow.

Avoid duplicate shape definitions when inference/reuse is possible.
