import type {
  CorpusCatalogParams,
  KnowledgeQueryInput,
  RegulatoryQueryInput,
} from "@/api/services/corpus.service";

import { rootQueryKeys } from "./root.keys";

export const corpusKeys = {
  all: [...rootQueryKeys.all, "corpus"] as const,
  regulatoryQuery: (input: RegulatoryQueryInput) =>
    [...corpusKeys.all, "regulatory-query", input] as const,
  knowledgeQuery: (input: KnowledgeQueryInput) =>
    [...corpusKeys.all, "knowledge-query", input] as const,
  regulatorySources: (params: CorpusCatalogParams) =>
    [...corpusKeys.all, "regulatory-sources", params] as const,
  regulatorySource: (id: string) => [...corpusKeys.all, "regulatory-source", id] as const,
  regulatorySourceStatus: (id: string) =>
    [...corpusKeys.all, "regulatory-source-status", id] as const,
  knowledgeDocuments: (params: CorpusCatalogParams & { category?: number }) =>
    [...corpusKeys.all, "knowledge-documents", params] as const,
  knowledgeDocument: (id: string) => [...corpusKeys.all, "knowledge-document", id] as const,
  knowledgeDocumentStatus: (id: string) =>
    [...corpusKeys.all, "knowledge-document-status", id] as const,
};
