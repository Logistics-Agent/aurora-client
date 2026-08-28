# DATA ACCESS + STATE MANAGEMENT — CENTRALIZED HOOKS

## Server reads

All TanStack Query read hooks live under:

```text
src/hooks/queries/<domain>/
```

Example:

```text
src/hooks/queries/shipment/
├── use-shipments-query.ts
├── use-shipment-query.ts
├── use-shipment-timeline-query.ts
└── index.ts
```

Example Compliance:

```text
src/hooks/queries/compliance/
├── use-compliance-list-query.ts
├── use-compliance-detail-query.ts
└── index.ts
```

## Server writes

All TanStack Query mutation hooks live under:

```text
src/hooks/mutations/<domain>/
```

Example:

```text
src/hooks/mutations/shipment/
├── use-create-shipment-mutation.ts
├── use-update-shipment-mutation.ts
├── use-cancel-shipment-mutation.ts
└── index.ts
```

## Query keys

All query-key factories live under:

```text
src/api/query-keys/
```

Example:

```ts
export const shipmentQueryKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentQueryKeys.all, "list"] as const,
  list: (params: ShipmentQueryDto) =>
    [...shipmentQueryKeys.lists(), params] as const,
  details: () => [...shipmentQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentQueryKeys.details(), id] as const,
};
```

Do not scatter literal key arrays around components/hooks.

## API services

All endpoint functions live under:

```text
src/api/services/
```

Example:

```text
shipment.service.ts
document.service.ts
compliance.service.ts
```

Service:

- knows URL/method/params/body
- returns typed transport data
- contains no React
- contains no toast
- contains no query invalidation

## Data flow

```text
Feature UI
→ root hooks/queries or hooks/mutations
→ api/services
→ api/client
→ Backend
```

Query hook imports:

- API service
- query key factory
- DTO/types

Mutation hook imports:

- API service
- query key factory
- QueryClient for targeted invalidation

## Stores

Root `src/stores/` contains global CLIENT state only.

Examples:

- app/sidebar state
- global map selection
- current spatial drill-down level
- current tenant UI selection only if appropriate

Do not store API result cache in Zustand.

## Local state

Feature-local React state or feature-local Zustand store is allowed for UI-only state.

But server data always remains in TanStack Query.
