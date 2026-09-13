"use client";

import { useQuery } from "@tanstack/react-query";

import { corpusKeys } from "@/api/query-keys/corpus.keys";
import {
  type CorpusCatalogParams,
  corpusService,
  type KnowledgeQueryInput,
  type RegulatoryQueryInput,
} from "@/api/services/corpus.service";

export function useRegulatoryCorpusQuery(input?: RegulatoryQueryInput) {
  const queryInput = input?.query.trim() ? input : undefined;

  return useQuery({
    queryKey: corpusKeys.regulatoryQuery(queryInput ?? { query: "" }),
    queryFn: () => {
      if (!queryInput) throw new Error("A corpus query is required.");
      return corpusService.queryRegulatory(queryInput);
    },
    enabled: Boolean(queryInput),
  });
}

export function useKnowledgeCorpusQuery(input?: KnowledgeQueryInput) {
  const queryInput = input?.query.trim() ? input : undefined;

  return useQuery({
    queryKey: corpusKeys.knowledgeQuery(queryInput ?? { query: "" }),
    queryFn: () => {
      if (!queryInput) throw new Error("A corpus query is required.");
      return corpusService.queryKnowledge(queryInput);
    },
    enabled: Boolean(queryInput),
  });
}

export function useRegulatorySourcesQuery(params: CorpusCatalogParams = {}) {
  return useQuery({
    queryKey: corpusKeys.regulatorySources(params),
    queryFn: () => corpusService.listRegulatorySources(params),
  });
}

export function useKnowledgeDocumentsQuery(
  params: CorpusCatalogParams & { category?: number } = {},
) {
  return useQuery({
    queryKey: corpusKeys.knowledgeDocuments(params),
    queryFn: () => corpusService.listKnowledgeDocuments(params),
  });
}
