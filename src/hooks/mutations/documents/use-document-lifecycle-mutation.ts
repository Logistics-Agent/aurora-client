"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { complianceKeys } from "@/api/query-keys/compliance.keys";
import { documentsKeys } from "@/api/query-keys/documents.keys";
import { documentsService } from "@/api/services/documents.service";

export type DocumentLifecycleAction = "cancel" | "retry";

export function useDocumentLifecycleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: DocumentLifecycleAction }) =>
      action === "cancel"
        ? documentsService.cancelDocument(id)
        : documentsService.retryDocument(id),
    onSuccess: (document) => {
      queryClient.setQueryData(documentsKeys.detail(document.id), document);
      void queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      void queryClient.invalidateQueries({ queryKey: complianceKeys.all });
    },
  });
}
