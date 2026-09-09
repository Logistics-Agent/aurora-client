"use client";

import type { FormEvent } from "react";

import { PageHeader } from "@/components/layout";
import { getApiErrorMessage } from "@/lib/api-error";

import { AssistantAccessCard } from "./components/assistant-access-card";
import { AssistantAnswer } from "./components/assistant-answer";
import { AssistantComposer } from "./components/assistant-composer";
import { useAssistantWorkspace } from "./hooks/use-assistant-workspace";

export function AiAssistantPage() {
  const { question, setQuestion, askQuestion, answer, error, isPending } = useAssistantWorkspace();
  const ask = async (event: FormEvent<HTMLFormElement>) => {
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
            errorMessage={error ? getApiErrorMessage(error) : undefined}
            onQuestionChange={setQuestion}
            onSubmit={ask}
          />
          {answer && <AssistantAnswer response={answer} />}
        </div>
        <AssistantAccessCard />
      </div>
    </>
  );
}
