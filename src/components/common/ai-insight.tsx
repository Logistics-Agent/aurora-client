import { Sparkles } from "lucide-react";

export type AiInsightProps = {
  result: string;
  confidence: number;
  reason: string;
  sources: string[];
  timestamp: string;
  suggestedAction: string;
  onReview?: () => void;
};

export function AiInsight({
  result,
  confidence,
  reason,
  sources,
  timestamp,
  suggestedAction,
  onReview,
}: AiInsightProps) {
  return (
    <section
      className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/70 p-4"
      aria-label="AI insight"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
        <Sparkles className="size-3.5" />
        AI insight · {confidence}% confidence
      </div>
      <p className="font-semibold text-foreground">{result}</p>
      <p className="text-sm text-muted-foreground">Why: {reason}</p>
      <p className="text-xs text-slate-500">
        Sources: {sources.join(" · ")} · {timestamp}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-200 pt-3">
        <p className="text-sm font-medium text-primary">
          Suggested action: {suggestedAction}
        </p>
        {onReview && (
          <button
            type="button"
            onClick={onReview}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Human review
          </button>
        )}
      </div>
    </section>
  );
}
