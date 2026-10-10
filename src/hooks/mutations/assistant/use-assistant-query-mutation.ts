"use client";

import { useMutation } from "@tanstack/react-query";

import {
  type AssistantQueryInput,
  assistantService,
  isAssistantProviderUnavailable,
} from "@/api/services/assistant.service";

export function useAssistantQueryMutation() {
  const mutation = useMutation({
    mutationFn: (input: AssistantQueryInput) => assistantService.query(input),
  });

  return {
    ...mutation,
    isProviderUnavailable: isAssistantProviderUnavailable(mutation.error),
  };
}
