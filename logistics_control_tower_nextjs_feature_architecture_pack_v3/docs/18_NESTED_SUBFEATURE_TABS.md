# NESTED SUB-FEATURE / TAB / WORKFLOW ARCHITECTURE

This rule applies recursively to ALL large features.

## Universal structure

A sufficiently complex child feature may own:

```text
<child>/
├── index.tsx
├── components/
├── hooks/
│   ├── query/
│   └── mutations/
├── constants/
├── types/
├── utils/
├── dto/
├── schemas/
├── stores/
├── drawers/
└── dialogs/
```

Create only what is needed.

## Shipment example

```text
features/shipment/tabs/
├── overview/
├── cargo/
├── route-tracking/
├── documents/
├── compliance/
├── cost/
├── negotiation/
├── billing/
└── timeline/
```

## Route & Tracking example

```text
features/route-tracking/
├── index.tsx
├── components/
├── hooks/
├── constants/
├── types/
├── utils/
└── workspaces/
    ├── route-planning/
    ├── live-map/
    └── shipment-tracking/
```

Each workspace can have its own components/hooks/types/utils.

## Documents example

```text
features/documents/
├── index.tsx
├── components/
├── hooks/
├── constants/
├── types/
├── utils/
└── workflows/
    ├── upload/
    ├── ocr-processing/
    └── ocr-review/
```

## Compliance example

```text
features/compliance/
├── index.tsx
├── components/
├── hooks/
│   ├── query/
│   └── mutations/
├── constants/
├── types/
├── utils/
├── schemas/
└── sections/
    ├── risk-summary/
    ├── findings-table/
    └── review-detail/
```

## Commercial example

```text
features/commercial/
├── cost/
│   ├── index.tsx
│   ├── components/
│   ├── hooks/
│   ├── constants/
│   ├── types/
│   └── utils/
├── negotiation/
│   ├── index.tsx
│   ├── components/
│   ├── hooks/
│   ├── constants/
│   ├── types/
│   ├── utils/
│   └── dialogs/
└── billing/
    ├── index.tsx
    ├── components/
    ├── hooks/
    ├── constants/
    ├── types/
    └── utils/
```

## Administration example

```text
features/administration/
├── users/
├── roles/
├── tenant-settings/
├── audit-log/
│   ├── index.tsx
│   ├── components/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── drawers/
└── ai-operations/
```

## AI Assistant example

```text
features/ai-assistant/
├── index.tsx
├── components/
├── hooks/
├── constants/
├── types/
├── utils/
└── sections/
    ├── conversation/
    ├── context/
    └── suggested-actions/
```

## Customer Portal example

```text
features/customer-portal/
├── index.tsx
├── components/
├── hooks/
├── constants/
├── types/
├── utils/
└── sections/
    ├── overview/
    ├── shipments/
    ├── tracking/
    ├── documents/
    ├── quotes/
    ├── invoices/
    ├── assistant/
    └── notifications/
```

## Boundary test

Create a nested sub-feature when the child:

- has several dedicated components,
- owns hooks/state,
- owns meaningful local types,
- has a distinct workflow,
- or would make the parent hard to reason about.

Avoid mechanical deep nesting for trivial presentational pieces.
