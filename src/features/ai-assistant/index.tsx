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
    <div className="space-y-6 pb-12">
      <PageHeader
        title="AI Assistant"
        description="Grounded logistics & compliance intelligence powered by official regulations and tenant SOP evidence."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AssistantComposer
            question={question}
            isPending={isPending}
            errorMessage={error ? getApiErrorMessage(error) : undefined}
            onQuestionChange={setQuestion}
            onSubmit={ask}
          />
          {answer && <AssistantAnswer response={answer} />}
        </div>
        <div>
          <AssistantAccessCard />
        </div>
      </div>
    </div>
  );
}
