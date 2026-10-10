"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { corpusKeys } from "@/api/query-keys/corpus.keys";
import {
  corpusService,
  type IngestGeneralInput,
  type IngestKnowledgeInput,
  type IngestRegulatoryInput,
  type PromoteGeneralInput,
} from "@/api/services/corpus.service";

export function useCorpusMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: corpusKeys.all });

  const ingestRegulatory = useMutation({
    mutationFn: (input: IngestRegulatoryInput) => corpusService.ingestRegulatory(input),
    onSuccess: invalidate,
  });
  const ingestKnowledge = useMutation({
    mutationFn: (input: IngestKnowledgeInput) => corpusService.ingestKnowledge(input),
    onSuccess: invalidate,
  });
  const ingestGeneral = useMutation({
    mutationFn: (input: IngestGeneralInput) => corpusService.ingestGeneral(input),
    onSuccess: invalidate,
  });
  const promoteGeneral = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PromoteGeneralInput }) =>
      corpusService.promoteGeneral(id, input),
    onSuccess: invalidate,
  });
  return {
    ingestRegulatory,
    ingestKnowledge,
    ingestGeneral,
    promoteGeneral,
  };
}
