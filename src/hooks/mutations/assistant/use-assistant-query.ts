"use client";

import { useMutation } from "@tanstack/react-query";
import { assistantService } from "@/api/services/assistant.service";
import type {
  AssistantQueryRequest,
  AssistantQueryResponse,
} from "@/dto/assistant/assistant.dto";

export function useAssistantQuery() {
  return useMutation<AssistantQueryResponse, Error, AssistantQueryRequest>({
    mutationFn: (payload: AssistantQueryRequest) => assistantService.query(payload),
  });
}
