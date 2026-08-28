# PAGE ADAPTER RULE

Correct:

```tsx
import { ShipmentsPage } from "@/features/shipment";
export default function Page() {
  return <ShipmentsPage />;
}
```

Wrong: implementing tables, API calls, filters, mutation logic, and full page business UI inside `app/**/page.tsx`.
