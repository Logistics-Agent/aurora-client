"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { complianceKeys } from "@/api/query-keys/compliance.keys";
import { documentsKeys } from "@/api/query-keys/documents.keys";
import { documentsService } from "@/api/services/documents.service";
import type { CreateDocumentIntakeInput } from "@/dto/documents/document-upload.dto";

export function useDocumentIntakeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDocumentIntakeInput) =>
      documentsService.createDocumentIntake(input),
    onSuccess: (document) => {
      queryClient.setQueryData(documentsKeys.detail(document.id), document);
      void queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: complianceKeys.all });
    },
  });
}
