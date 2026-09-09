"use client";

import { useQuery } from "@tanstack/react-query";

import { documentsKeys } from "@/api/query-keys/documents.keys";
import {
  type DocumentListParams,
  documentsService,
  normalizeDocumentListParams,
} from "@/api/services/documents.service";

export function useDocumentsQuery(
  params: DocumentListParams = {},
  options?: { enabled?: boolean },
) {
  const normalizedParams = normalizeDocumentListParams(params);

  return useQuery({
    queryKey: documentsKeys.list(normalizedParams),
    queryFn: () => documentsService.listDocuments(normalizedParams),
    enabled: options?.enabled ?? true,
  });
}
