# SHIPMENT FEATURE TREE — V3 EXAMPLE

```text
src/features/shipment/
├── index.tsx
├── components/
│   ├── shipment-list-header.tsx
│   ├── shipment-table.tsx
│   ├── shipment-detail-tabs.tsx
│   └── shipment-summary.tsx
├── constants/
│   ├── shipment-columns.ts
│   ├── shipment-filters.ts
│   └── shipment-tabs.ts
├── types/
│   ├── shipment-table-row.types.ts
│   └── shipment-view.types.ts
├── utils/
│   ├── map-shipment-to-row.ts
│   └── get-operational-flags.ts
├── schemas/
│   └── shipment-filter.schema.ts
├── tabs/
│   ├── overview/
│   ├── cargo/
│   ├── route-tracking/
│   ├── documents/
│   ├── compliance/
│   ├── cost/
│   ├── negotiation/
│   ├── billing/
│   └── timeline/
├── workflows/
│   ├── create/
│   │   ├── index.tsx
│   │   ├── components/
│   │   ├── constants/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── schemas/
│   │   └── steps/
│   │       ├── shipment/
│   │       ├── locations/
│   │       ├── cargo/
│   │       ├── documents/
│   │       ├── planning/
│   │       └── review/
│   └── import/
├── drawers/
└── dialogs/
```

Server data:

```text
src/hooks/queries/shipment/
├── use-shipments-query.ts
├── use-shipment-query.ts
├── use-shipment-timeline-query.ts
└── index.ts

src/hooks/mutations/shipment/
├── use-create-shipment-mutation.ts
├── use-update-shipment-mutation.ts
├── use-cancel-shipment-mutation.ts
└── index.ts
```

API:

```text
src/api/services/shipment.service.ts
src/api/query-keys/shipment.query-keys.ts
```

Transport/domain contracts:

```text
src/dto/shipment/
src/types/shipment.types.ts
```
