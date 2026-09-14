"use client";

import type { FormEvent } from "react";

import { PageHeader } from "@/components/layout";
import { getApiErrorMessage } from "@/lib/api-error";

import { AssistantAccessCard } from "./components/assistant-access-card";
import { AssistantAnswer } from "./components/assistant-answer";
import { AssistantComposer } from "./components/assistant-composer";
import { AssistantProviderUnavailable } from "./components/assistant-provider-unavailable";
import { useAssistantWorkspace } from "./hooks/use-assistant-workspace";

export function AiAssistantPage() {
  const {
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
    answer,
    error,
    isPending,
    isProviderUnavailable,
  } = useAssistantWorkspace();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await askQuestion();
  };

  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Ask grounded questions about permitted operational and compliance context."
      />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <AssistantComposer
            question={question}
            isPending={isPending}
            errorMessage={error && !isProviderUnavailable ? getApiErrorMessage(error) : undefined}
            mode={mode}
            jurisdictionCode={jurisdictionCode}
            shipmentId={shipmentId}
            evaluationId={evaluationId}
            onQuestionChange={setQuestion}
            onModeChange={setMode}
            onJurisdictionChange={setJurisdictionCode}
            onShipmentIdChange={setShipmentId}
            onEvaluationIdChange={setEvaluationId}
            onSubmit={handleSubmit}
          />
          {isProviderUnavailable && <AssistantProviderUnavailable />}
          {answer && !error && <AssistantAnswer response={answer} />}
        </div>
        <AssistantAccessCard />
      </div>
    </>
  );
}
