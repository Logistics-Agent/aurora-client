"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

import { useFindingReviewState } from "../hooks/use-finding-review-state";
import type { FindingReviewProps } from "../types/finding-review.types";
import { ComplianceCopilotForm } from "./compliance-copilot-form";
import { CopilotAnswer } from "./copilot-answer";
import { EvaluationLoader } from "./evaluation-loader";
import { EvaluationSummary } from "./evaluation-summary";
import { FindingDetails } from "./finding-details";
import { FindingList } from "./finding-list";

export function FindingReview({ initialEvaluationId = "" }: FindingReviewProps) {
  const {
    evaluation,
    evaluationQuery,
    evaluationId,
    selectedFinding,
    inputValue,
    setInputValue,
    setSelectedFindingId,
    copilotQuery,
    setCopilotQuery,
    copilotAnswer,
    askCopilot,
    loadEvaluation,
    ask,
  } = useFindingReviewState(initialEvaluationId);

  return (
    <div className="space-y-4">
      <EvaluationLoader
        value={inputValue}
        loading={evaluationQuery.isFetching}
        onChange={setInputValue}
        onSubmit={loadEvaluation}
      />
      {evaluationQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Loading evaluation…</p>
      )}
      {evaluationQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(evaluationQuery.error)}
        </p>
      )}
      {!evaluationId && !evaluationQuery.isLoading && (
        <p className="text-sm text-muted-foreground">
          Enter an evaluation id to inspect persisted compliance findings.
        </p>
      )}
      {evaluation && (
        <>
          <EvaluationSummary evaluation={evaluation} />
          {evaluation.externalShipmentId && (
            <Button asChild variant="outline">
              <Link
                href={`/assistant?shipmentId=${encodeURIComponent(evaluation.externalShipmentId)}&evaluationId=${encodeURIComponent(evaluation.evaluationId)}`}
              >
                Ask AI about this evaluation
              </Link>
            </Button>
          )}
          <FindingList
            findings={evaluation.findings}
            selectedFindingId={selectedFinding?.findingId}
            onSelect={setSelectedFindingId}
          />
          {selectedFinding && <FindingDetails finding={selectedFinding} />}
          <ComplianceCopilotForm
            query={copilotQuery}
            pending={askCopilot.isPending}
            errorMessage={askCopilot.isError ? getApiErrorMessage(askCopilot.error) : undefined}
            onChange={setCopilotQuery}
            onSubmit={ask}
          />
          {copilotAnswer && <CopilotAnswer answer={copilotAnswer} />}
        </>
      )}
    </div>
  );
}
