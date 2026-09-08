import { api } from "@/lib/api";

export type ComplianceEvaluationRequest = {
  idempotencyKey?: string;
  externalShipmentId?: string;
  originCountryCode?: string;
  destinationCountryCode?: string;
  transportMode?: string;
  effectiveAt?: string;
  jurisdictionCodes?: string[];
  cargo?: Array<{
    name: string;
    hsCode: string;
    quantity: number;
    unit: string;
    weightKg: number;
    volumeM3: number;
    isDangerousGoods: boolean;
    dangerousGoodsCode?: string;
    packageType?: string;
  }>;
  documents?: Array<{
    externalDocumentId: string;
    documentType: string;
    normalizedJson: string;
    extractionConfidence: number;
    needsReview: boolean;
  }>;
};

export type ComplianceEvaluationResponse = {
  evaluationId: string;
  status: string;
  verdict: "PASSED" | "FLAGGED" | "BLOCKED" | "REVIEW_REQUIRED";
  summary: string;
  findings: Array<{
    findingId: string;
    ruleId: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    message: string;
    remediationAction?: string;
  }>;
  evaluatedAt?: string;
};

export type AskCopilotRequest = {
  query: string;
  mode?: number;
  jurisdictionCode?: string;
  effectiveAt?: string;
  topK?: number;
  minimumRelevanceScore?: number;
};

export type AskCopilotResponse = {
  answer: string;
  confidence: number;
  citations: Array<{
    sourceDocument: string;
    articleNumber: string;
    snippet: string;
    relevanceScore: number;
  }>;
};

export const complianceService = {
  evaluateCompliance: async (
    payload: ComplianceEvaluationRequest,
  ): Promise<ComplianceEvaluationResponse> => {
    return api.post("/api/v1/compliance/evaluations", payload);
  },

  getComplianceEvaluation: async (
    id: string,
  ): Promise<ComplianceEvaluationResponse> => {
    return api.get(`/api/v1/compliance/evaluations/${id}`);
  },

  askComplianceCopilot: async (
    payload: AskCopilotRequest,
  ): Promise<AskCopilotResponse> => {
    return api.post("/api/v1/compliance/copilot/ask", payload);
  },
};

