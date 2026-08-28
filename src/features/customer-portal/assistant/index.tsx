"use client";

import { useState } from "react";
import { Bot, LockKeyhole, Send } from "lucide-react";
import { AiInsight, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerPageHeading } from "../components/customer-page-heading";
import { customerAssistantMock } from "../mock";
import { useCustomerPortalStore } from "../stores/use-customer-portal-store";

export function AssistantPage() {
  const [question, setQuestion] = useState(customerAssistantMock.question);
  const [reviewRequested, setReviewRequested] = useState(false);
  const questionAsked = useCustomerPortalStore((state) => state.questionAsked);
  const askQuestion = useCustomerPortalStore((state) => state.askQuestion);

  return (
    <>
      <CustomerPageHeading
        title="AI Assistant"
        description="Ask questions about shipment information available to your organization."
      />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <WorkspaceCard>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="size-5 text-violet-700" /> Ask about your shipment
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                aria-label="Question for AI assistant"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
              <Button
                onClick={askQuestion}
                disabled={!question.trim()}
                aria-label="Ask assistant"
              >
                <Send className="size-4" /> Ask
              </Button>
            </div>
          </WorkspaceCard>
          {questionAsked && (
            <AiInsight
              result={customerAssistantMock.result}
              confidence={customerAssistantMock.confidence}
              reason={customerAssistantMock.reason}
              sources={customerAssistantMock.sources}
              timestamp={customerAssistantMock.timestamp}
              suggestedAction={customerAssistantMock.suggestedAction}
              onReview={() => setReviewRequested(true)}
            />
          )}
          {reviewRequested && (
            <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              Human review requested locally. No ticket has been submitted.
            </p>
          )}
        </div>
        <WorkspaceCard title="Assistant access">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-emerald-700">Can access</p>
              <p className="mt-1 text-muted-foreground">
                Your shipments, shared documents, invoices and carrier-visible
                milestones.
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-medium text-slate-700">
                <LockKeyhole className="size-4" /> Restricted
              </p>
              <p className="mt-1 text-muted-foreground">
                Internal operations, tenant administration and commercial
                controls.
              </p>
            </div>
            <p className="border-t border-border pt-4 text-xs text-muted-foreground">
              AI does not change shipment or commercial data. Review sources
              before acting.
            </p>
          </div>
        </WorkspaceCard>
      </div>
    </>
  );
}
