import type { DocumentQueryParams } from "@/api/services/documents.service";

import { rootQueryKeys } from "./root.keys";

export const documentsKeys = {
  all: [...rootQueryKeys.all, "documents"] as const,
  lists: () => [...documentsKeys.all, "list"] as const,
  list: (params: DocumentQueryParams) => [...documentsKeys.lists(), params] as const,
  details: () => [...documentsKeys.all, "detail"] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
  review: (id: string) => [...documentsKeys.detail(id), "review"] as const,
} as const;
