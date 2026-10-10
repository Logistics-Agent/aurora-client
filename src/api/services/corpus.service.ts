import { CONTROLLERS } from "@/configs/api";
import {
  type CorpusDocument,
  type KnowledgeQueryResponse,
  parseCorpusDocumentDto,
  parseKnowledgeQueryDto,
  parseRegulatoryQueryDto,
  type RegulatoryQueryResponse,
} from "@/dto/corpus/corpus.dto";
import {
  type CorpusStatus,
  type CorpusVersionStatus,
  type KnowledgeDocumentDetails,
  type KnowledgeDocumentPage,
  type RegulatorySourceDetails,
  type RegulatorySourcePage,
  parseCorpusVersionStatus,
  parseKnowledgeDocumentDetails,
  parseKnowledgeDocumentPage,
  parseRegulatorySourceDetails,
  parseRegulatorySourcePage,
} from "@/dto/corpus/corpus-catalog.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export type IngestRegulatoryInput = {
  idempotencyKey?: string;
  authority: string;
  title: string;
  canonicalSourceUri: string;
  jurisdictionCode?: string;
  regulationType: number;
  languageCode?: string;
  versionLabel?: string;
  publishedAt?: string;
  effectiveFrom?: string;
  contentReference: string;
  storageReference?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  contentSha256?: string;
  rawText: string;
};

export type IngestKnowledgeInput = {
  idempotencyKey?: string;
  title: string;
  category: number;
  sourceReference?: string;
  languageCode?: string;
  versionLabel?: string;
  contentReference: string;
  storageReference?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  contentSha256?: string;
  rawText: string;
};

export type IngestGeneralInput = {
  fileName: string;
  storageReference: string;
  mimeType?: string;
  sizeBytes?: number;
  description?: string;
};

export type PromoteGeneralInput = {
  title: string;
  category: number;
  storageReference: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  languageCode?: string;
};

export type RegulatoryQueryInput = {
  query: string;
  jurisdictionCode?: string;
  effectiveAt?: string;
  regulationTypes?: number[];
  topK?: number;
  minimumRelevanceScore?: number;
};

export type KnowledgeQueryInput = {
  query: string;
  categories?: number[];
  topK?: number;
  minimumRelevanceScore?: number;
};

export type CorpusCatalogParams = {
  page?: number;
  pageSize?: number;
  status?: CorpusStatus;
};

function parseResponse<T>(response: unknown, parser: (value: unknown) => T): T {
  try {
    return parser(response);
  } catch (error) {
    throw new ApiError({
      message: "Corpus service returned an invalid response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

export const corpusService = {
  ingestRegulatory: async (payload: IngestRegulatoryInput): Promise<CorpusDocument> =>
    parseResponse(
      await api.post<unknown>(CONTROLLERS.corpus.regulatory, payload),
      parseCorpusDocumentDto,
    ),
  ingestKnowledge: async (payload: IngestKnowledgeInput): Promise<CorpusDocument> =>
    parseResponse(
      await api.post<unknown>(CONTROLLERS.corpus.knowledge, payload),
      parseCorpusDocumentDto,
    ),
  ingestGeneral: async (payload: IngestGeneralInput): Promise<CorpusDocument> =>
    parseResponse(
      await api.post<unknown>(CONTROLLERS.corpus.general, payload),
      parseCorpusDocumentDto,
    ),
  promoteGeneral: async (id: string, payload: PromoteGeneralInput): Promise<CorpusDocument> =>
    parseResponse(
      await api.post<unknown>(CONTROLLERS.corpus.promoteGeneral(id), payload),
      parseCorpusDocumentDto,
    ),
  queryRegulatory: async (payload: RegulatoryQueryInput): Promise<RegulatoryQueryResponse> =>
    parseResponse(
      await api.post<unknown>(CONTROLLERS.corpus.regulatoryQuery, payload),
      parseRegulatoryQueryDto,
    ),
  queryKnowledge: async (payload: KnowledgeQueryInput): Promise<KnowledgeQueryResponse> =>
    parseResponse(
      await api.post<unknown>(CONTROLLERS.corpus.knowledgeQuery, payload),
      parseKnowledgeQueryDto,
    ),
  listRegulatorySources: async (params: CorpusCatalogParams = {}): Promise<RegulatorySourcePage> =>
    parseResponse(
      await api.get<unknown>(CONTROLLERS.corpus.regulatorySources, { params }),
      parseRegulatorySourcePage,
    ),
  getRegulatorySource: async (id: string): Promise<RegulatorySourceDetails> =>
    parseResponse(
      await api.get<unknown>(CONTROLLERS.corpus.regulatorySource(id)),
      parseRegulatorySourceDetails,
    ),
  getRegulatorySourceStatus: async (id: string): Promise<CorpusVersionStatus> =>
    parseResponse(
      await api.get<unknown>(CONTROLLERS.corpus.regulatorySourceStatus(id)),
      parseCorpusVersionStatus,
    ),
  listKnowledgeDocuments: async (
    params: CorpusCatalogParams & { category?: number } = {},
  ): Promise<KnowledgeDocumentPage> =>
    parseResponse(
      await api.get<unknown>(CONTROLLERS.corpus.knowledgeDocuments, { params }),
      parseKnowledgeDocumentPage,
    ),
  getKnowledgeDocument: async (id: string): Promise<KnowledgeDocumentDetails> =>
    parseResponse(
      await api.get<unknown>(CONTROLLERS.corpus.knowledgeDocument(id)),
      parseKnowledgeDocumentDetails,
    ),
  getKnowledgeDocumentStatus: async (id: string): Promise<CorpusVersionStatus> =>
    parseResponse(
      await api.get<unknown>(CONTROLLERS.corpus.knowledgeDocumentStatus(id)),
      parseCorpusVersionStatus,
    ),
};
