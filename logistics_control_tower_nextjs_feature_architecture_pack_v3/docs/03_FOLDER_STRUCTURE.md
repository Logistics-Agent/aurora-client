# TARGET FOLDER STRUCTURE — V3

The project uses feature-first UI ownership, but SERVER DATA HOOKS are centralized at root by domain.

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (customer)/
│   ├── layout.tsx
│   ├── globals.css
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── api/
│   ├── client/
│   │   ├── axios-client.ts
│   │   ├── api-error.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── shipment.service.ts
│   │   ├── route.service.ts
│   │   ├── tracking.service.ts
│   │   ├── document.service.ts
│   │   ├── ocr.service.ts
│   │   ├── compliance.service.ts
│   │   ├── cost.service.ts
│   │   ├── negotiation.service.ts
│   │   ├── billing.service.ts
│   │   ├── assistant.service.ts
│   │   ├── notification.service.ts
│   │   ├── email-agent.service.ts
│   │   ├── user.service.ts
│   │   ├── tenant.service.ts
│   │   ├── audit.service.ts
│   │   └── ai-operations.service.ts
│   │
│   ├── query-keys/
│   │   ├── auth.query-keys.ts
│   │   ├── shipment.query-keys.ts
│   │   ├── route.query-keys.ts
│   │   ├── tracking.query-keys.ts
│   │   ├── document.query-keys.ts
│   │   ├── compliance.query-keys.ts
│   │   ├── cost.query-keys.ts
│   │   ├── negotiation.query-keys.ts
│   │   ├── billing.query-keys.ts
│   │   ├── notification.query-keys.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── common/
│   └── three/
│
├── configs/
│   ├── env.config.ts
│   ├── app.config.ts
│   ├── navigation.config.ts
│   └── index.ts
│
├── constants/
│   ├── routes.ts
│   ├── permissions.ts
│   └── index.ts
│
├── dto/
│   ├── auth/
│   ├── shipment/
│   ├── route/
│   ├── tracking/
│   ├── document/
│   ├── compliance/
│   ├── cost/
│   ├── negotiation/
│   ├── billing/
│   └── index.ts
│
├── features/
│   ├── auth/
│   ├── command-center/
│   ├── shipment/
│   ├── route-tracking/
│   ├── documents/
│   ├── compliance/
│   ├── commercial/
│   ├── ai-assistant/
│   ├── notifications/
│   ├── email-agent/
│   ├── administration/
│   └── customer-portal/
│
├── hooks/
│   ├── queries/
│   │   ├── auth/
│   │   ├── shipment/
│   │   ├── route/
│   │   ├── tracking/
│   │   ├── document/
│   │   ├── compliance/
│   │   ├── cost/
│   │   ├── negotiation/
│   │   ├── billing/
│   │   ├── assistant/
│   │   ├── notification/
│   │   ├── email-agent/
│   │   ├── administration/
│   │   └── index.ts
│   │
│   ├── mutations/
│   │   ├── auth/
│   │   ├── shipment/
│   │   ├── route/
│   │   ├── tracking/
│   │   ├── document/
│   │   ├── compliance/
│   │   ├── cost/
│   │   ├── negotiation/
│   │   ├── billing/
│   │   ├── assistant/
│   │   ├── notification/
│   │   ├── email-agent/
│   │   ├── administration/
│   │   └── index.ts
│   │
│   └── ui/
│       ├── use-debounce.ts
│       ├── use-media-query.ts
│       └── index.ts
│
├── lib/
│   ├── query/
│   │   ├── query-client.ts
│   │   └── index.ts
│   ├── validation/
│   ├── permissions/
│   └── three/
│
├── providers/
│   ├── app-provider.tsx
│   ├── query-provider.tsx
│   └── index.ts
│
├── schemas/
│
├── stores/
│   ├── app.store.ts
│   ├── map.store.ts
│   ├── auth.store.ts
│   └── index.ts
│
├── types/
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── shipment.types.ts
│   ├── route.types.ts
│   ├── tracking.types.ts
│   ├── document.types.ts
│   ├── compliance.types.ts
│   ├── cost.types.ts
│   ├── negotiation.types.ts
│   ├── billing.types.ts
│   ├── ai.types.ts
│   └── index.ts
│
└── utils/
    ├── cn.ts
    ├── format-date.ts
    ├── format-currency.ts
    ├── format-number.ts
    └── index.ts
```

## Important ownership rule

Features own UI composition and feature-local presentation code.

Server-data hooks are NOT feature-local.

All TanStack Query read hooks go under:

`src/hooks/queries/<domain>/`

All TanStack Query mutation hooks go under:

`src/hooks/mutations/<domain>/`

All query key factories go under:

`src/api/query-keys/`

All HTTP endpoint functions go under:

`src/api/services/`

This rule applies to every domain.
