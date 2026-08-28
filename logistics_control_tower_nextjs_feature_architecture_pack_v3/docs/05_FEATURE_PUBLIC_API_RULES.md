# FEATURE PUBLIC API RULES

Route consumers import from feature roots:

```ts
import { ShipmentsPage } from "@/features/shipment";
```

Avoid cross-feature deep imports.
A consumer should not need to know a feature's internal folder tree.

Use `index.tsx` at a route-level React feature root as requested by this project.
Use `index.ts` for internal non-React barrels/public APIs when useful.

Do not create a giant root barrel exporting the entire application.
