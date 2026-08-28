"use client";

import { useState } from "react";
import { AiInsight, EmptyState, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { assistantAnswerMock } from "./mock";

export function AiAssistantPage() {
  const [asked, setAsked] = useState(false);

  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Ask about visible shipment context; sensitive actions require human review."
      />
      <WorkspaceCard title="Shipment context">
        <div className="min-h-52 rounded-xl border border-border bg-secondary p-4">
          {asked ? (
            <AiInsight {...assistantAnswerMock} timestamp="Prepared locally" />
          ) : (
            <EmptyState
              title="Ask a logistics question"
              description="Try: What is the current risk for SHP-2026-00128?"
            />
          )}
        </div>
        <Button className="mt-4" onClick={() => setAsked(true)}>
          Ask mock question
        </Button>
      </WorkspaceCard>
    </>
  );
}
