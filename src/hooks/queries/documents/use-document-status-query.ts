"use client";

import { useQuery } from "@tanstack/react-query";

import { documentsKeys } from "@/api/query-keys/documents.keys";
import { documentsService } from "@/api/services/documents.service";
import type { DocumentStatus } from "@/dto/documents/document.dto";

const DOCUMENT_POLLING_INTERVAL_MS = 2_000;

export function getDocumentStatusPollingInterval(
  status: DocumentStatus["status"] | undefined,
): number | false {
  return status === "RECEIVED" || status === "PROCESSING"
    ? DOCUMENT_POLLING_INTERVAL_MS
    : false;
}

export function useDocumentStatusQuery(id: string | undefined) {
  return useQuery({
    queryKey: documentsKeys.detail(id ?? ""),
    queryFn: () => {
      if (!id) throw new Error("A document id is required.");
      return documentsService.getDocument(id);
    },
    enabled: Boolean(id),
    refetchInterval: (query) => getDocumentStatusPollingInterval(query.state.data?.status),
  });
}
