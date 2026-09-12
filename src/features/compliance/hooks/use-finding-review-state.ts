"use client";

import { type FormEvent, useState } from "react";

import type { GroundedAnswer } from "@/dto/assistant/assistant.dto";
import { useComplianceMutations } from "@/hooks/mutations/compliance/use-compliance-mutations";
import { useComplianceEvaluationQuery } from "@/hooks/queries/compliance/use-compliance-evaluation-query";

import { COMPLIANCE_COPILOT_DEFAULTS } from "../constants/compliance.constants";

export function useFindingReviewState(initialEvaluationId: string) {
  const [evaluationId, setEvaluationId] = useState(initialEvaluationId);
  const [inputValue, setInputValue] = useState(initialEvaluationId);
  const [selectedFindingId, setSelectedFindingId] = useState<string>();
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState<GroundedAnswer>();
  const evaluationQuery = useComplianceEvaluationQuery(evaluationId || undefined);
  const { startEvaluation, askCopilot } = useComplianceMutations();
  const evaluation = evaluationQuery.data;
  const selectedFinding = evaluation?.findings.find(
    (finding) => finding.findingId === (selectedFindingId ?? evaluation.findings[0]?.findingId),
  );

  const loadEvaluation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCopilotAnswer(undefined);
    setSelectedFindingId(undefined);
    setEvaluationId(inputValue.trim());
  };

  const ask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = copilotQuery.trim();
    if (!query || !evaluation) return;
    setCopilotAnswer(await askCopilot.mutateAsync({ query, ...COMPLIANCE_COPILOT_DEFAULTS }));
  };

  const reEvaluate = async () => {
    if (!evaluation?.externalShipmentId) return;

    const nextEvaluation = await startEvaluation.mutateAsync({
      shipmentId: evaluation.externalShipmentId,
      request: { idempotencyKey: crypto.randomUUID() },
    });
    setEvaluationId(nextEvaluation.evaluationId);
    setInputValue(nextEvaluation.evaluationId);
    setSelectedFindingId(undefined);
    setCopilotAnswer(undefined);
  };

  return {
    evaluationId,
    evaluation,
    evaluationQuery,
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
  };
}
