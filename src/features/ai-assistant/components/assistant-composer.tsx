import { Bot, Send } from "lucide-react";
import type { FormEvent } from "react";

import { WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AssistantMode } from "@/dto/assistant/assistant.dto";

import {
  ASSISTANT_JURISDICTION_OPTIONS,
  ASSISTANT_MODE_OPTIONS,
} from "../constants/assistant.constants";

function isAssistantMode(value: string): value is AssistantMode {
  return ASSISTANT_MODE_OPTIONS.some((option) => option.value === value);
}

export function AssistantComposer({
  question,
  isPending,
  errorMessage,
  mode,
  jurisdictionCode,
  shipmentId,
  evaluationId,
  onQuestionChange,
  onModeChange,
  onJurisdictionChange,
  onShipmentIdChange,
  onEvaluationIdChange,
  onSubmit,
}: {
  question: string;
  isPending: boolean;
  errorMessage?: string;
  mode: AssistantMode;
  jurisdictionCode: string;
  shipmentId: string;
  evaluationId: string;
  onQuestionChange: (question: string) => void;
  onModeChange: (mode: AssistantMode) => void;
  onJurisdictionChange: (jurisdictionCode: string) => void;
  onShipmentIdChange: (shipmentId: string) => void;
  onEvaluationIdChange: (evaluationId: string) => void;
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
      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <label
          className="space-y-1 text-xs font-medium text-muted-foreground"
          htmlFor="assistant-mode"
        >
          <span>Mode</span>
          <select
            id="assistant-mode"
            aria-label="Assistant mode"
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm font-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={mode}
            onChange={(event) => {
              if (isAssistantMode(event.target.value)) {
                onModeChange(event.target.value);
              }
            }}
          >
            {ASSISTANT_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label
          className="space-y-1 text-xs font-medium text-muted-foreground"
          htmlFor="assistant-jurisdiction"
        >
          <span>Jurisdiction</span>
          <select
            id="assistant-jurisdiction"
            aria-label="Assistant jurisdiction"
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm font-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={jurisdictionCode}
            onChange={(event) => onJurisdictionChange(event.target.value)}
          >
            {ASSISTANT_JURISDICTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label
          className="space-y-1 text-xs font-medium text-muted-foreground"
          htmlFor="shipment-id"
        >
          <span>Verified shipment ID (optional)</span>
          <Input
            id="shipment-id"
            aria-label="Verified shipment ID"
            value={shipmentId}
            onChange={(event) => onShipmentIdChange(event.target.value)}
            placeholder="Shipment ID"
          />
        </label>
        <label
          className="space-y-1 text-xs font-medium text-muted-foreground"
          htmlFor="evaluation-id"
        >
          <span>Verified evaluation ID (optional)</span>
          <Input
            id="evaluation-id"
            aria-label="Verified evaluation ID"
            value={evaluationId}
            onChange={(event) => onEvaluationIdChange(event.target.value)}
            placeholder="Evaluation ID"
          />
        </label>
      </div>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </WorkspaceCard>
  );
}
