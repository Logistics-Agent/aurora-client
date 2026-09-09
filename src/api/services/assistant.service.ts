import { api } from "@/lib/api";
import type {
  AssistantQueryRequest,
  AssistantQueryResponse,
} from "@/dto/assistant/assistant.dto";

export const assistantService = {
  query: async (payload: AssistantQueryRequest): Promise<AssistantQueryResponse> => {
    return api.post<AssistantQueryResponse>("/api/v1/assistant/query", payload);
  },
};
