import { api } from "@/lib/api";

export interface CreateNegotiationMailDraftRequest {
  mailboxId: string;
  idempotencyKey?: string;
}

export interface NegotiationMailDraftResponse {
  draftId: string;
  threadId: string;
  subject?: string;
  body?: string;
  isExisting?: boolean;
}

export const negotiationService = {
  async createMailDraft(
    negotiationId: string,
    mailboxId: string,
  ): Promise<NegotiationMailDraftResponse> {
    return api.post<NegotiationMailDraftResponse>(
      `/api/v1/negotiations/${encodeURIComponent(negotiationId)}/mail-draft`,
      { mailboxId },
    );
  },
};
