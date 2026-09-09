import { CONTROLLERS } from "@/configs/api";
import { type GroundedAnswer, parseGroundedAnswerDto } from "@/dto/assistant/assistant.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export type AssistantQueryInput = {
  query: string;
  mode?: string;
  jurisdictionCode?: string;
  effectiveAt?: string;
  regulationTypes?: string[];
  categories?: string[];
  topK?: number;
  minimumScore?: number;
};

export type AssistantQueryResponse = GroundedAnswer;

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
    const response = await api.post<unknown>(CONTROLLERS.assistant.query, payload);
    return parseResponse(response);
  },
};
