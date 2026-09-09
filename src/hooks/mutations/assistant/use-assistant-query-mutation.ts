"use client";

import { useMutation } from "@tanstack/react-query";

import { type AssistantQueryInput, assistantService } from "@/api/services/assistant.service";

export function useAssistantQueryMutation() {
  return useMutation({
    mutationFn: (input: AssistantQueryInput) => assistantService.query(input),
  });
}
