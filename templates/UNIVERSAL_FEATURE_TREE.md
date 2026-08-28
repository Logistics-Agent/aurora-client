# UNIVERSAL FEATURE TREE — V3

Every feature uses this UI-oriented structure when needed:

```text
src/features/<feature>/
├── index.tsx
├── components/
├── constants/
├── types/
├── utils/
├── schemas/
├── stores/
├── tabs/
├── sections/
├── workflows/
├── drawers/
├── dialogs/
└── sub-features/
```

Server data hooks are centralized OUTSIDE the feature:

```text
src/hooks/
├── queries/
│   └── <domain>/
└── mutations/
    └── <domain>/
```

API transport is centralized:

```text
src/api/
├── client/
├── services/
└── query-keys/
```

## Example: Shipment

```text
features/shipment/
├── index.tsx
├── components/
├── constants/
├── types/
├── utils/
├── schemas/
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
│   └── import/
├── drawers/
└── dialogs/

hooks/queries/shipment/
hooks/mutations/shipment/

api/services/shipment.service.ts
api/query-keys/shipment.query-keys.ts
dto/shipment/
types/shipment.types.ts
```

The same pattern applies to every domain.
