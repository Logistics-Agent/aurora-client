# Feature and Nested Sub-feature Ownership Rules

These rules are mandatory for every business feature under `src/features`.

## Layered ownership

A top-level feature owns concerns reused by multiple sub-features of that feature:

```text
src/features/<feature>/
├── components/
├── hooks/
├── constants/
├── types/
├── utils/
├── mock/
├── stores/
├── <sub-feature>/
└── index.tsx
```

A nested sub-feature repeats the same local-first structure when needed:

```text
src/features/<feature>/<sub-feature>/
├── components/
├── hooks/
├── constants/
├── types/
├── utils/
├── mock/
├── stores/
├── sections/
├── tabs/
├── workflows/
├── drawers/
├── dialogs/
└── index.tsx
```

Create only the folders a feature or sub-feature actually needs.

## Ownership promotion

- Used by one sub-feature: keep it inside that sub-feature.
- Used by multiple sub-features in the same feature: promote it to the feature root.
- Used by independent features: promote it to the appropriate shared root folder.
- Do not import another business feature's UI to assemble a page.
- Do not create a shared abstraction for hypothetical reuse.

## Index files compose pages

`index.tsx` is not a single re-export file. A route-level feature or sub-feature index must contain meaningful page composition or workflow orchestration.

Valid:

```tsx
export function ShipmentDetailPage({ shipmentId }: ShipmentDetailPageProps) {
  return (
    <ShipmentDetailLayout>
      <ShipmentHeader shipmentId={shipmentId} />
      <ShipmentTabs shipmentId={shipmentId} />
    </ShipmentDetailLayout>
  );
}
```

Invalid:

```tsx
export { ShipmentDetailPage } from "./components/shipment-detail-page";
```

Also invalid: one `*-workspace.tsx` switching between independent route screens with a `mode` prop.

## Route boundary

- Every `app/**/page.tsx` stays a thin route adapter.
- A route imports the public page function from `src/features/<feature>`.
- Dynamic route parameters are passed into the appropriate page composition instead of being discarded.

## Shared infrastructure

- Use only singular `src/lib/` for shared infrastructure and framework utilities.
- shadcn/Tailwind utilities remain in `src/lib/utils.ts`.
- Query, HTTP and future infrastructure belong under `src/lib/<domain>/`.
- Do not create `src/libs/`.

## Hooks and state

- Feature-local `hooks/` contain UI behavior and local composition hooks only.
- TanStack Query hooks use only `src/hooks/queries/<domain>/`.
- TanStack mutation hooks use only `src/hooks/mutations/<domain>/`.
- Zustand stores contain client interaction/spatial state only.
- Local component state remains local when no sibling needs it.

## Mock data

- UI-only fixtures live in the narrowest owning `mock/` folder.
- Fixtures reused by multiple sub-features may live in the feature root `mock/`.
- Every UI-only fixture group must be marked:

```ts
// UI-only fixture until backend integration phase.
```

- Fixture state must remain interactive but must never be presented as persisted, backend-live, or realtime data.
