# START HERE — LOGISTICS AI CONTROL TOWER FRONTEND

This pack is the coding context + phased execution guide for the frontend.

## Mandatory reading order before coding

1. `AGENTS.md`
2. `docs/00_APP_CONTEXT.md`
3. `docs/01_PRODUCT_MODULE_MAP.md`
4. `docs/02_FRONTEND_ARCHITECTURE.md`
5. `docs/03_FOLDER_STRUCTURE.md`
6. `docs/04_FEATURE_ARCHITECTURE.md`
7. `docs/05_FEATURE_PUBLIC_API_RULES.md`
8. `docs/06_DATA_ACCESS_AND_STATE.md`
9. `docs/07_TYPES_DTO_SCHEMA_OWNERSHIP.md`
10. `docs/08_UI_DESIGN_SYSTEM.md`
11. `docs/09_3D_SPATIAL_ARCHITECTURE.md`
12. `docs/10_ROUTING_AND_LAYOUT.md`
13. `docs/11_AUTH_PERMISSION_BOUNDARIES.md`
14. `docs/12_ERROR_REALTIME_AI_RULES.md`
15. `docs/13_CODE_STYLE_NAMING.md`
16. `docs/14_TESTING_QUALITY_GATES.md`
17. `docs/15_DEFINITION_OF_DONE.md`
18. `docs/16_CONTEXT_LOADING_STRATEGY.md`

Then execute `01_INIT_PROJECT_NEXTJS.md`.

Only after initialization passes, continue with `phases/`.

## Non-negotiable route rule

`src/app/**/page.tsx` is a routing adapter, not a feature implementation.

```tsx
import { ShipmentsPage } from "@/features/shipment";

export default function Page() {
  return <ShipmentsPage />;
}
```

The real route-level UI composition lives in `src/features/shipment/index.tsx`.

## Local-first ownership

If only Shipment uses something, keep it inside `features/shipment`.
Promote to shared `components/`, `hooks/`, `constants/`, `types/`, `dto/`, `utils/`, or `schemas/` only after real cross-feature reuse exists.

## Run order

00 Initialize Next.js
→ 01 Shared Core
→ 02 Layout + Routing
→ 03 Auth + Permissions
→ 04 North Star
→ 05 Shipment Core
→ 06 Route + Tracking
→ 07 Documents/OCR/Compliance
→ 08 Commercial
→ 09 AI + Communication
→ 10 Administration
→ 11 Customer Portal
→ 12 Realtime + States
→ 13 3D Integration
→ 14 Final QA

## Universal feature structure

The Shipment structure is only an example of the universal architecture.

Every feature and sufficiently complex nested sub-feature follows the same local-first model:
`components/`, `hooks/query/`, `hooks/mutations/`, `constants/`, `types/`, `utils/`, `dto/`, `schemas/`, `stores/`, `tabs/`, `sections/`, `workflows/`, `drawers/`, `dialogs/` as needed.

Read:

- `docs/04_FEATURE_ARCHITECTURE.md`
- `docs/18_NESTED_SUBFEATURE_TABS.md`
- `templates/UNIVERSAL_FEATURE_TREE.md`

## V3 canonical root data structure

Server queries and mutations are centralized:

```text
hooks/queries/<domain>/
hooks/mutations/<domain>/
```

API:

```text
api/client/
api/services/
api/query-keys/
```

Global client state:

```text
stores/
```

Global app configuration:

```text
configs/
```

These rules override older examples using feature-local query/mutation hooks.
