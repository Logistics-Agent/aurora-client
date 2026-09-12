"use client";

import { useQuery } from "@tanstack/react-query";

import { documentsKeys } from "@/api/query-keys/documents.keys";
import { documentsService } from "@/api/services/documents.service";
import { useDocumentStatusQuery } from "./use-document-status-query";

export function useDocumentQuery(id: string | undefined) {
  return useDocumentStatusQuery(id);
}

export function useDocumentReviewQuery(id: string | undefined) {
  return useQuery({
    queryKey: documentsKeys.review(id ?? ""),
    queryFn: () => {
      if (!id) {
        throw new Error("A document id is required.");
      }

      return documentsService.getOcrReviewDetails(id);
    },
    enabled: Boolean(id),
  });
}
