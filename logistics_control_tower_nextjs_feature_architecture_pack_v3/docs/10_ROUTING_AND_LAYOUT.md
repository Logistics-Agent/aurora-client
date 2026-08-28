# ROUTING + LAYOUT

Route groups:
`(auth)`, `(dashboard)`, `(customer)`.

Thin page example:

```tsx
import { ShipmentDetailPage } from "@/features/shipment";

export default async function Page({ params }) {
  const { shipmentId } = await params;
  return <ShipmentDetailPage shipmentId={shipmentId} />;
}
```

Do not put filters, queries, mutations, tables, or business page UI in `page.tsx`.

Shared layouts live in `components/layout` and are imported by App Router layouts.
