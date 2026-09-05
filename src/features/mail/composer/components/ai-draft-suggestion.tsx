import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AiDraftSuggestion as AiDraftSuggestionData } from "../../types";

export interface AiDraftSuggestionProps {
  suggestion: AiDraftSuggestionData;
  disabled?: boolean;
  onInsert: (text: string) => void;
}

export function AiDraftSuggestion({
  suggestion,
  disabled = false,
  onInsert,
}: AiDraftSuggestionProps): React.JSX.Element {
  return (
    <aside aria-label="AI draft suggestion" className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles aria-hidden="true" className="size-4 text-primary" />
        AI suggestion
        <span className="text-muted-foreground">Confidence: {suggestion.confidence}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm text-foreground">{suggestion.proposedWording}</p>
      {suggestion.evidenceLabels.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Evidence: {suggestion.evidenceLabels.join(", ")}
        </p>
      ) : null}
      <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => onInsert(suggestion.proposedWording)}>
        Insert AI suggestion
      </Button>
      <p className="text-xs text-muted-foreground">Review and edit before saving or sending.</p>
    </aside>
  );
}
