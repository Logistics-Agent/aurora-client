"use client";

import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout";

import { FindingReview } from "../components/finding-review";

export function ComplianceCenterPage() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || searchParams.get("evaluationId") || "";

  return (
    <>
      <PageHeader
        title="Compliance Center"
        description="Inspect persisted evaluation findings with evidence and governance metadata."
      />
      <FindingReview initialEvaluationId={initialId} />
    </>
  );
}
