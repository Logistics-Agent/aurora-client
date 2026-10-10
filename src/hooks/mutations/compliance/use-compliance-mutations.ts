"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { complianceKeys } from "@/api/query-keys/compliance.keys";
import {
  type AskCopilotRequest,
  type ComplianceEvaluationRequest,
  complianceService,
} from "@/api/services/compliance.service";

export function useComplianceMutations() {
  const queryClient = useQueryClient();

  const evaluate = useMutation({
    mutationFn: (input: ComplianceEvaluationRequest) => complianceService.evaluateCompliance(input),
    onSuccess: (evaluation) => {
      queryClient.setQueryData(complianceKeys.evaluation(evaluation.evaluationId), evaluation);
      void queryClient.invalidateQueries({ queryKey: complianceKeys.all });
    },
  });

  const askCopilot = useMutation({
    mutationFn: (input: AskCopilotRequest) => complianceService.askComplianceCopilot(input),
  });

  return { evaluate, askCopilot };
}
