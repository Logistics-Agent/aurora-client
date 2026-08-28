# FILE OWNERSHIP MATRIX — V3

| Concern                    | Location                                       |
| -------------------------- | ---------------------------------------------- |
| Route file                 | `app/**/page.tsx`                              |
| Feature UI composition     | `features/<feature>/index.tsx`                 |
| Feature component          | `features/<feature>/components`                |
| Feature constants          | `features/<feature>/constants`                 |
| Feature presentation types | `features/<feature>/types`                     |
| Feature UI utils           | `features/<feature>/utils`                     |
| Feature workflow/tab       | `features/<feature>/{tabs,workflows,sections}` |
| Query hook                 | `hooks/queries/<domain>`                       |
| Mutation hook              | `hooks/mutations/<domain>`                     |
| Generic UI hook            | `hooks/ui`                                     |
| Query keys                 | `api/query-keys`                               |
| HTTP endpoint service      | `api/services`                                 |
| Axios client/error         | `api/client`                                   |
| API DTO                    | `dto/<domain>`                                 |
| Domain/application types   | `types`                                        |
| Global Zustand store       | `stores`                                       |
| Global configuration       | `configs`                                      |
| Global constants           | `constants`                                    |
| Shared UI                  | `components/common`                            |
| shadcn primitive           | `components/ui`                                |
| Shared layout              | `components/layout`                            |
| Infrastructure             | `lib`                                          |
