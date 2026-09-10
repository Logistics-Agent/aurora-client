"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { documentsKeys } from "@/api/query-keys/documents.keys";
import { type DocumentReviewInput, documentsService } from "@/api/services/documents.service";

export function useDocumentReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DocumentReviewInput }) =>
      documentsService.reviewDocument(id, input),
    onSuccess: (document) => {
      void queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      queryClient.setQueryData(documentsKeys.detail(document.id), document);
    },
  });
}
