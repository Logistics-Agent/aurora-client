"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mailKeys } from "@/api/query-keys/mail.keys";
import {
  mailService,
  type ReassignThreadRequest,
  type UnassignThreadRequest,
} from "@/api/services/mail.service";
import type { CreateDraftApiRequest, SubmitOutboundMessageApiRequest } from "@/dto/mail/mail.dto";

export function useMailMutations() {
  const queryClient = useQueryClient();

  const invalidateThread = (threadId?: string) => {
    void queryClient.invalidateQueries({ queryKey: mailKeys.threads() });
    if (threadId) {
      void queryClient.invalidateQueries({ queryKey: mailKeys.thread(threadId) });
      void queryClient.invalidateQueries({ queryKey: mailKeys.assignmentHistory(threadId) });
    }
  };

  const claimThread = useMutation({
    mutationFn: (threadId: string) => mailService.claimThread(threadId),
    onSuccess: (_, threadId) => invalidateThread(threadId),
  });

  const reassignThread = useMutation({
    mutationFn: ({ threadId, payload }: { threadId: string; payload: ReassignThreadRequest }) =>
      mailService.reassignThread(threadId, payload),
    onSuccess: (_, variables) => invalidateThread(variables.threadId),
  });

  const unassignThread = useMutation({
    mutationFn: ({ threadId, payload }: { threadId: string; payload?: UnassignThreadRequest }) =>
      mailService.unassignThread(threadId, payload),
    onSuccess: (_, variables) => invalidateThread(variables.threadId),
  });

  const createDraft = useMutation({
    mutationFn: (payload: CreateDraftApiRequest) => mailService.createDraft(payload),
    onSuccess: (draft) => {
      void queryClient.invalidateQueries({ queryKey: mailKeys.drafts() });
      if (draft.threadId) invalidateThread(draft.threadId);
    },
  });

  const submitOutboundMessage = useMutation({
    mutationFn: (payload: SubmitOutboundMessageApiRequest) =>
      mailService.submitOutboundMessage(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: mailKeys.messages() });
      void queryClient.invalidateQueries({ queryKey: mailKeys.threads() });
      if (payload.threadId) invalidateThread(payload.threadId);
    },
  });

  const releaseQuarantine = useMutation({
    mutationFn: (quarantineId: string) => mailService.releaseQuarantine(quarantineId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailKeys.quarantine() });
      void queryClient.invalidateQueries({ queryKey: mailKeys.messages() });
    },
  });

  return {
    claimThread,
    reassignThread,
    unassignThread,
    createDraft,
    submitOutboundMessage,
    releaseQuarantine,
  };
}
