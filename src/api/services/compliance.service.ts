import { CONTROLLERS } from "@/configs/api";
import {
  type ComplianceEvaluation,
  type GroundedAnswer,
  parseComplianceEvaluationDto,
  parseGroundedAnswerDto,
} from "@/dto/compliance/compliance.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

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

export type ComplianceEvaluationResponse = ComplianceEvaluation;

export type AskCopilotRequest = {
  query: string;
  mode?: number;
  jurisdictionCode?: string;
  effectiveAt?: string;
  topK?: number;
  minimumRelevanceScore?: number;
};

export type AskCopilotResponse = GroundedAnswer;

function parseResponse<T>(response: unknown, parser: (value: unknown) => T): T {
  try {
    return parser(response);
  } catch (error) {
    throw new ApiError({
      message: "Compliance service returned an invalid response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

export const complianceService = {
  evaluateCompliance: async (
    payload: ComplianceEvaluationRequest,
  ): Promise<ComplianceEvaluationResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.compliance.evaluations, payload);
    return parseResponse(response, parseComplianceEvaluationDto);
  },

  getComplianceEvaluation: async (id: string): Promise<ComplianceEvaluationResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.compliance.evaluation(id));
    return parseResponse(response, parseComplianceEvaluationDto);
  },

  askComplianceCopilot: async (payload: AskCopilotRequest): Promise<AskCopilotResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.compliance.copilotAsk, payload);
    return parseResponse(response, parseGroundedAnswerDto);
  },
};
