import { CONTROLLERS } from "@/configs/api";
import {
  type ComplianceEvaluation,
  type ComplianceEvaluationList,
  type GroundedAnswer,
  parseComplianceEvaluationDto,
  parseComplianceEvaluationListDto,
  parseGroundedAnswerDto,
} from "@/dto/compliance/compliance.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export type StartComplianceEvaluationRequest = {
  idempotencyKey: string;
  effectiveAt?: string;
};

export type ComplianceEvaluationResponse = ComplianceEvaluation;

export type ComplianceEvaluationListParams = {
  page?: number;
  pageSize?: number;
  status?: ComplianceEvaluation["status"];
  freshness?: ComplianceEvaluation["freshness"];
};

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
  startEvaluation: async (
    shipmentId: string,
    payload: StartComplianceEvaluationRequest,
  ): Promise<ComplianceEvaluationResponse> => {
    const response = await api.post<unknown>(
      CONTROLLERS.compliance.startEvaluation(shipmentId),
      payload,
    );
    return parseResponse(response, parseComplianceEvaluationDto);
  },

  listEvaluations: async (
    params: ComplianceEvaluationListParams = {},
  ): Promise<ComplianceEvaluationList> => {
    const response = await api.get<unknown>(CONTROLLERS.compliance.evaluations, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ...(params.status ? { status: params.status } : {}),
        ...(params.freshness ? { freshness: params.freshness } : {}),
      },
    });
    return parseResponse(response, parseComplianceEvaluationListDto);
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
