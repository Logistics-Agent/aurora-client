"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { complianceKeys } from "@/api/query-keys/compliance.keys";
import {
  type AskCopilotRequest,
  type StartComplianceEvaluationRequest,
  complianceService,
} from "@/api/services/compliance.service";

export function useComplianceMutations() {
  const queryClient = useQueryClient();

  const startEvaluation = useMutation({
    mutationFn: ({
      shipmentId,
      request,
    }: {
      shipmentId: string;
      request: StartComplianceEvaluationRequest;
    }) => complianceService.startEvaluation(shipmentId, request),
    onSuccess: (evaluation) => {
      queryClient.setQueryData(complianceKeys.evaluation(evaluation.evaluationId), evaluation);
      void queryClient.invalidateQueries({ queryKey: complianceKeys.all });
    },
  });

  const askCopilot = useMutation({
    mutationFn: (input: AskCopilotRequest) => complianceService.askComplianceCopilot(input),
  });

  return { startEvaluation, askCopilot };
}
