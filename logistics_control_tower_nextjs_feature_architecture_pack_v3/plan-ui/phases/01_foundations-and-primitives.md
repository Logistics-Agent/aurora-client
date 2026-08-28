# Phase 01 — Light Foundations and Shared Primitives

## Figma scope

Inspect [01 — Foundations](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-2) and [02 — Components](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-3).

## Prompt for the coding AI

Implement only the cross-feature UI foundation required by later screens. Map the approved Light tokens to semantic CSS variables and Tailwind utilities; preserve existing tokens when equivalent. Align shadcn primitives to Figma instead of duplicating Button, Input, Table, Dialog, Sheet, Tabs, Tooltip, Dropdown, Avatar, Skeleton, Toast, or Checkbox.

Create only genuine cross-feature components under `src/components/common`: `StatusBadge`, `RiskBadge`, `RealtimeStatus`, `AiInsight`, `FilterBar`, `EmptyState`, `ErrorState`, `LoadingState`, `ConfirmActionDialog`, and `AppDataTable` if no equivalent exists. Each must separate shipment status, operational flag, risk and AI state. AI cards need result, confidence, reason, sources, timestamp, suggested action and optional review action. Realtime cards must not render `Live` when stale.

Use local story/demo routes only if the current app already has a pattern for them. Validate visual primitives against Figma, keyboard focus and responsive overflow. Run lint/typecheck and stop.
