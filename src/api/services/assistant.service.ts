import { CONTROLLERS } from "@/configs/api";
import {
  type AssistantQueryRequest,
  type AssistantQueryResponse,
  parseGroundedAnswerDto,
} from "@/dto/assistant/assistant.dto";
import { api } from "@/lib/api";
import { ApiError, toApiError } from "@/lib/api-error";

export type AssistantQueryInput = AssistantQueryRequest;

export {
  type AssistantQueryRequest,
  type AssistantQueryResponse,
} from "@/dto/assistant/assistant.dto";

export function isAssistantProviderUnavailable(error: unknown): boolean {
  const apiError = toApiError(error);
  return (
    apiError.status === 503 ||
    apiError.code === "AI_SERVICE_UNAVAILABLE" ||
    apiError.code === "AI_PROVIDER_UNAVAILABLE" ||
    apiError.code === "PROVIDER_UNAVAILABLE"
  );
}

function parseResponse(response: unknown): AssistantQueryResponse {
  try {
    return parseGroundedAnswerDto(response);
  } catch (error) {
    throw new ApiError({
      message: "Assistant service returned an invalid response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

export const assistantService = {
  query: async (payload: AssistantQueryInput): Promise<AssistantQueryResponse> => {
    try {
      const response = await api.post<unknown>(CONTROLLERS.assistant.query, payload);
      return parseResponse(response);
    } catch (error) {
      throw toApiError(error);
    }
  },
};
