"use client";

import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";

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
    startEvaluation,
    loadEvaluation,
    ask,
    reEvaluate,
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
          {(evaluation.freshness === "STALE" || evaluation.status === "FAILED") && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={startEvaluation.isPending}
                onClick={() => void reEvaluate()}
              >
                {startEvaluation.isPending ? "Starting…" : "Re-evaluate"}
              </Button>
            </div>
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
