# Figma → Code Map

Source file: `drI45J1ajP37h7UD8mM1fx`, approved node map: `plan-ui/01_FIGMA_NODE_MAP.md`.

| Figma scope                                                      | Route(s)                                                           | Feature root                                                              | Shared UI                                                                           | Fixture convention                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| Foundations / Components `56:2`, `56:3`                          | all                                                                | `src/components`, `src/components/layout`                                 | semantic tokens, badges, states, dialogs, tables                                    | feature-local `*-ui-fixtures.ts`                  |
| Auth `56:4`                                                      | `/login`, `/forgot-password`, `/select-tenant`                     | `src/features/auth`                                                       | auth form primitives, permission state                                              | `src/features/auth/constants/auth-ui-fixtures.ts` |
| Overview `56:5`                                                  | `/overview`                                                        | `src/features/command-center`                                             | KPI, map, exception, realtime                                                       | command-center fixtures                           |
| Shipments `56:6`                                                 | `/shipments/**`                                                    | `src/features/shipment`                                                   | table, stepper, drawer, timeline                                                    | shipment fixtures                                 |
| Route & Tracking `56:7`; S12 `98:2`, S13 `99:230`, S14 `100:520` | `/route-planning`, `/live-map`, `/shipments/[shipmentId]/tracking` | `src/features/route-tracking/{route-planning,live-map,shipment-tracking}` | `components/common/geo-map`, MapLibre/Three.js, SVG fallback, route/realtime status | each sub-feature owns geographic `mock/index.ts`  |
| Documents/OCR `56:8` and Compliance `56:9`                       | `/documents/**`, `/compliance/**`                                  | `src/features/documents`, `src/features/compliance`                       | viewer, review state, banners                                                       | document/compliance fixtures                      |
| Commercial `56:10`, Billing `56:11`                              | `/cost-estimate`, `/negotiations/**`, `/billing`, `/invoices/**`   | `src/features/commercial`                                                 | finance tables, confirmation dialog                                                 | commercial fixtures                               |
| Assistant/Communication `56:12`, `56:13`                         | `/assistant`, `/notifications`, `/email-agent/**`                  | feature roots                                                             | AI insight, notification, review                                                    | local fixtures                                    |
| Administration `56:14`                                           | `/admin/**`                                                        | `src/features/administration`                                             | matrix, audit drawer, AI execution                                                  | admin fixtures                                    |
| States/Flows `56:15`, `56:17`                                    | owning routes                                                      | `src/components/common` + owner                                           | loading, empty, error, confirm                                                      | local interaction state                           |
| Customer Portal `56:16`                                          | `/portal/**`                                                       | `src/features/customer-portal`                                            | customer shell, mobile nav                                                          | customer fixtures                                 |

All fixture values are display-only and must be annotated with:

```ts
// UI-only fixture until backend integration phase.
```

No route imports a backend service or TanStack Query hook in this UI-only implementation.
