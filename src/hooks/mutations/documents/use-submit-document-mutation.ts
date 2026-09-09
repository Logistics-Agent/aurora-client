"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { documentsKeys } from "@/api/query-keys/documents.keys";
import {
  documentsService,
  type SubmitShipmentDocumentInput,
} from "@/api/services/documents.service";

export function useSubmitDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitShipmentDocumentInput) =>
      documentsService.submitShipmentDocument(input),
    onSuccess: (document) => {
      queryClient.setQueryData(documentsKeys.detail(document.id), document);
      void queryClient.invalidateQueries({ queryKey: documentsKeys.all });
    },
  });
}
