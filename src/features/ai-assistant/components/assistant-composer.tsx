import { Bot, Send } from "lucide-react";
import type { FormEvent } from "react";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AssistantComposer({
  question,
  isPending,
  errorMessage,
  onQuestionChange,
  onSubmit,
}: {
  question: string;
  isPending: boolean;
  errorMessage?: string;
  onQuestionChange: (question: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <WorkspaceCard>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Bot className="size-5 text-violet-700" /> Ask the assistant
      </div>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
        <Input
          aria-label="AI assistant question"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Ask a grounded compliance question"
        />
        <Button type="submit" disabled={!question.trim() || isPending}>
          <Send className="size-4" /> {isPending ? "Checking evidence…" : "Ask assistant"}
        </Button>
      </form>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </WorkspaceCard>
  );
}
