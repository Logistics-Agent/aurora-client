"use client";

import { useState } from "react";

import { useAssistantQueryMutation } from "@/hooks/mutations/assistant/use-assistant-query-mutation";

import { ASSISTANT_QUERY_DEFAULTS } from "../constants/assistant.constants";

export function useAssistantWorkspace() {
  const [question, setQuestion] = useState("");
  const mutation = useAssistantQueryMutation();

  const askQuestion = async () => {
    const query = question.trim();
    if (!query) return;
    await mutation.mutateAsync({ query, ...ASSISTANT_QUERY_DEFAULTS });
  };

  return {
    question,
    setQuestion,
    askQuestion,
    answer: mutation.data,
    error: mutation.error,
    isPending: mutation.isPending,
  };
}
