export type AssistantSearchMode = "ALL" | "REGULATORY" | "KNOWLEDGE";

export type AssistantQueryRequest = {
  query: string;
  mode?: AssistantSearchMode;
  jurisdictionCode?: string;
  effectiveAt?: string;
  regulationTypes?: number[];
  categories?: number[];
  topK?: number;
  minimumScore?: number;
};

export type AssistantRegulatoryCitation = {
  evidenceId: string;
  sourceId: string;
  documentVersionId: string;
  chunkId: string;
  title: string;
  authority: string;
  jurisdiction: string;
  regulationType: string;
  section: string;
  page: string;
  excerpt: string;
  canonicalSourceUri: string;
  score: number;
};

export type AssistantKnowledgeReference = {
  evidenceId: string;
  sourceId: string;
  documentVersionId: string;
  chunkId: string;
  title: string;
  category: string;
  section: string;
  page: string;
  excerpt: string;
  score: number;
};

export type AssistantConflict = {
  regulatoryEvidenceId: string;
  knowledgeEvidenceId: string;
  description: string;
};

export type AssistantGovernanceSummary = {
  decisionId: string;
  automationLevel: string;
  requiresApproval: boolean;
  capabilityCode: string;
  totalTokens: number;
};

export type AssistantQueryResponse = {
  query: string;
  answer: string;
  regulatoryCitations: AssistantRegulatoryCitation[];
  knowledgeReferences: AssistantKnowledgeReference[];
  conflicts: AssistantConflict[];
  insufficientEvidence: boolean;
  missingInformation: string[];
  governance: AssistantGovernanceSummary;
  retrievalTraceId: string;
};
