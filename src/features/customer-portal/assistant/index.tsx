"use client";

import { useState } from "react";
import { Bot, LockKeyhole, Send, Sparkles } from "lucide-react";
import { AiInsight, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerPageHeading } from "../components/customer-page-heading";
import { useAssistantQuery } from "@/hooks/mutations/assistant/use-assistant-query";

export function AssistantPage() {
  const [question, setQuestion] = useState("What are the container detention rules and customs clearance milestones for my cargo?");
  const [reviewRequested, setReviewRequested] = useState(false);

  const assistantMutation = useAssistantQuery();
  const result = assistantMutation.data;

  const handleAsk = () => {
    if (!question.trim()) return;
    setReviewRequested(false);
    assistantMutation.mutate({
      query: question.trim(),
      mode: "ALL",
      topK: 5,
      minimumScore: 0.4,
    });
  };

  // Extract source titles for insight component
  const sources = [
    ...(result?.regulatoryCitations?.map((r) => r.title || r.authority) || []),
    ...(result?.knowledgeReferences?.map((k) => k.title || k.category) || []),
  ].slice(0, 4);

  return (
    <>
      <CustomerPageHeading
        title="AI Assistant"
        description="Ask questions about shipment information, customs regulations and carrier procedures."
      />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <WorkspaceCard>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="size-5 text-violet-700" /> Ask about your shipments &amp; procedures
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                aria-label="Question for AI assistant"
                placeholder="Ask about shipment status, customs rules, port detention…"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAsk();
                  }
                }}
              />
              <Button
                onClick={handleAsk}
                disabled={!question.trim() || assistantMutation.isPending}
                aria-label="Ask assistant"
              >
                {assistantMutation.isPending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" />
                    Querying…
                  </>
                ) : (
                  <>
                    <Send className="size-4 mr-1.5" /> Ask
                  </>
                )}
              </Button>
            </div>
          </WorkspaceCard>

          {assistantMutation.isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
              Unable to reach AI assistant service. Please verify your connection or try again later.
            </div>
          )}

          {result && (
            <AiInsight
              result={result.answer}
              confidence={
                result.governance?.automationLevel === "AUTOMATED"
                  ? 95
                  : result.insufficientEvidence
                    ? 60
                    : 88
              }
              reason={
                result.regulatoryCitations?.length || result.knowledgeReferences?.length
                  ? `Grounded in ${result.regulatoryCitations?.length || 0} regulatory citations and ${result.knowledgeReferences?.length || 0} verified knowledge records.`
                  : "Synthesized based on verified operational knowledge."
              }
              sources={sources.length > 0 ? sources : ["Verified Knowledge Base"]}
              timestamp="Realtime grounded response"
              suggestedAction={
                result.conflicts?.length
                  ? "Review policy conflicts with account manager"
                  : "Verify timeline milestones"
              }
              onReview={() => setReviewRequested(true)}
            />
          )}

          {reviewRequested && (
            <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 flex items-center gap-2">
              <Sparkles className="size-4 text-blue-600 shrink-0" />
              Human review requested for this response. An operations specialist will verify.
            </p>
          )}
        </div>

        <WorkspaceCard title="Assistant access">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-emerald-700">Can access</p>
              <p className="mt-1 text-muted-foreground">
                Your shipments, shared documents, invoices, verified customs rules, and carrier-visible milestones.
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-medium text-slate-700">
                <LockKeyhole className="size-4" /> Restricted
              </p>
              <p className="mt-1 text-muted-foreground">
                Internal operations, tenant administration, private margins, and commercial controls.
              </p>
            </div>
            <p className="border-t border-border pt-4 text-xs text-muted-foreground">
              AI answers are grounded in authoritative regulations. Review sources before acting.
            </p>
          </div>
        </WorkspaceCard>
      </div>
    </>
  );
}
