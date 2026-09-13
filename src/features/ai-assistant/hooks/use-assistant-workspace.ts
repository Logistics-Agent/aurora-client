"use client";

import { useState } from "react";

import type { AssistantMode } from "@/dto/assistant/assistant.dto";
import { useAssistantQueryMutation } from "@/hooks/mutations/assistant/use-assistant-query-mutation";

import { ASSISTANT_QUERY_DEFAULTS } from "../constants/assistant.constants";

function readVerifiedContextFromUrl() {
  if (typeof window === "undefined") return { shipmentId: "", evaluationId: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    shipmentId: params.get("shipmentId") ?? "",
    evaluationId: params.get("evaluationId") ?? "",
  };
}

export function useAssistantWorkspace() {
  const initialContext = useState(readVerifiedContextFromUrl)[0];
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<AssistantMode>(ASSISTANT_QUERY_DEFAULTS.mode);
  const [jurisdictionCode, setJurisdictionCode] = useState<string>(
    ASSISTANT_QUERY_DEFAULTS.jurisdictionCode,
  );
  const [shipmentId, setShipmentId] = useState(initialContext.shipmentId);
  const [evaluationId, setEvaluationId] = useState(initialContext.evaluationId);
  const mutation = useAssistantQueryMutation();

  const askQuestion = async () => {
    const query = question.trim();
    if (!query) return;
    const context = {
      ...(shipmentId.trim() ? { shipmentId: shipmentId.trim() } : {}),
      ...(evaluationId.trim() ? { evaluationId: evaluationId.trim() } : {}),
    };

    try {
      await mutation.mutateAsync({
        query,
        mode,
        jurisdictionCode,
        topK: ASSISTANT_QUERY_DEFAULTS.topK,
        minimumScore: ASSISTANT_QUERY_DEFAULTS.minimumScore,
        ...(Object.keys(context).length > 0 ? { context } : {}),
      });
    } catch {
      return;
    }
  };

  return {
    question,
    setQuestion,
    mode,
    setMode,
    jurisdictionCode,
    setJurisdictionCode,
    shipmentId,
    setShipmentId,
    evaluationId,
    setEvaluationId,
    askQuestion,
    answer: mutation.data,
    error: mutation.error,
    isPending: mutation.isPending,
    isProviderUnavailable: mutation.isProviderUnavailable,
  };
}
