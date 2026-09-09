"use client";

import { useQuery } from "@tanstack/react-query";

import { documentsKeys } from "@/api/query-keys/documents.keys";
import { documentsService } from "@/api/services/documents.service";

export function useDocumentQuery(id: string | undefined) {
  return useQuery({
    queryKey: documentsKeys.detail(id ?? ""),
    queryFn: () => {
      if (!id) {
        throw new Error("A document id is required.");
      }

      return documentsService.getDocument(id);
    },
    enabled: Boolean(id),
  });
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
