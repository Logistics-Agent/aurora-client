"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout";

import { ComplianceEvaluationList } from "../components/compliance-evaluation-list";
import { FindingReview } from "../components/finding-review";

export function ComplianceCenterPage() {
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>();

  return (
    <>
      <PageHeader
        title="Compliance Center"
        description="Inspect persisted evaluation findings with evidence and governance metadata."
      />
      <ComplianceEvaluationList onSelect={setSelectedEvaluationId} />
      <FindingReview
        key={selectedEvaluationId ?? "no-evaluation"}
        initialEvaluationId={selectedEvaluationId ?? ""}
      />
    </>
  );
}
