"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  corpusUploadService,
  type CorpusFileUploadInput,
} from "@/api/services/corpus-upload.service";
import { corpusKeys } from "@/api/query-keys/corpus.keys";

export function useCorpusUploadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CorpusFileUploadInput) => corpusUploadService.uploadFile(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: corpusKeys.all });
    },
  });
}
