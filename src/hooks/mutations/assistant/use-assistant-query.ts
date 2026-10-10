"use client";

import { useMutation } from "@tanstack/react-query";
import { assistantService, type AssistantQueryInput, type AssistantQueryResponse } from "@/api/services/assistant.service";

export function useAssistantQuery() {
  return useMutation<AssistantQueryResponse, Error, AssistantQueryInput>({
    mutationFn: (payload: AssistantQueryInput) => assistantService.query(payload),
  });
}
