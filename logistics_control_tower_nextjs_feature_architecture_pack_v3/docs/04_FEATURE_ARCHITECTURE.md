# FEATURE ARCHITECTURE — UI-FIRST FEATURE OWNERSHIP

This architecture applies to EVERY product feature.

## Important distinction

Feature folders own:

- page/workspace composition
- feature-specific components
- feature-specific constants
- feature-specific presentation types
- feature-specific UI utilities
- feature-local schemas when truly UI/form-specific
- tabs
- sections
- workflows
- drawers
- dialogs
- local UI stores only when necessary

Feature folders do NOT own TanStack Query query/mutation hooks.

Server data hooks are centralized at:

```text
src/hooks/queries/<domain>/
src/hooks/mutations/<domain>/
```

## Standard feature

```text
features/<feature>/
├── index.tsx
├── components/
├── constants/
├── types/
├── utils/
├── schemas/
├── tabs/
├── sections/
├── workflows/
├── drawers/
├── dialogs/
└── stores/        # only local UI/client state if needed
```

Create only folders actually needed.

## Feature root

`index.tsx` is the public route-level composition.

Example:

```tsx
// src/features/compliance/index.tsx
import { useComplianceQuery } from "@/hooks/queries/compliance/use-compliance-query";

export function CompliancePage() {
  const complianceQuery = useComplianceQuery();

  return <ComplianceWorkspace query={complianceQuery} />;
}
```

Route:

```tsx
// src/app/(dashboard)/compliance/page.tsx
import { CompliancePage } from "@/features/compliance";

export default function Page() {
  return <CompliancePage />;
}
```

## Universal rule

The same approach applies to:

- auth
- command-center
- shipment
- route-tracking
- documents
- compliance
- cost
- negotiation
- billing
- ai-assistant
- notifications
- email-agent
- administration
- customer-portal

## Recursive UI sub-features

Large tabs/workflows may own their own:

```text
components/
constants/
types/
utils/
schemas/
drawers/
dialogs/
stores/
```

But query/mutation hooks still live centrally under root `src/hooks`.

Example:

```text
features/shipment/tabs/documents/
├── index.tsx
├── components/
├── constants/
├── types/
└── utils/
```

Data hook:

```text
src/hooks/queries/document/use-shipment-documents-query.ts
```

Mutation:

```text
src/hooks/mutations/document/use-upload-document-mutation.ts
```
