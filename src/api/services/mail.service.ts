import { CONTROLLERS } from "@/configs/api";
import {
  type CreateDraftApiRequest,
  type DraftApiDto,
  type DraftListResponse,
  type DraftListParams,
  type MailboxListParams,
  type Mailbox,
  type MailListParams,
  type ProcessedMessageListParams,
  type ProcessedMessageListResponse,
  type ProcessedMessageResponse,
  type QuarantineListParams,
  type QuarantineListResponse,
  type QuarantineRecordResponse,
  type ReleaseQuarantineResponse,
  type SubmitOutboundMessageApiRequest,
  type SubmitOutboundMessageApiResponse,
  type ThreadAssignmentActionResponse,
  type ThreadAssignmentHistoryListResponse,
  type ThreadDetailApiResponse,
  type ThreadListApiResponse,
  parseDraftDto,
  parseDraftListResponseDto,
  parseMailboxListResponseDto,
  parseOutboundMessageResponseDto,
  parseProcessedMessageDto,
  parseProcessedMessageListResponseDto,
  parseQuarantineListResponseDto,
  parseQuarantineRecordResponseDto,
  parseReleaseQuarantineResponseDto,
  parseThreadAssignmentActionResponseDto,
  parseThreadAssignmentHistoryListResponseDto,
  parseThreadDetailResponseDto,
  parseThreadListResponseDto,
} from "@/dto/mail/mail.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export type ReassignThreadRequest = {
  targetUserId: string;
  reason?: string;
};

export type UnassignThreadRequest = {
  reason?: string;
};

function parseResponse<T>(response: unknown, parser: (value: unknown) => T): T {
  try {
    return parser(response);
  } catch (error) {
    throw new ApiError({
      message: "Mail service returned an invalid response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

export const mailService = {
  listMailboxes: async (
    params?: MailboxListParams,
  ): Promise<{
    mailboxes: Mailbox[];
    nextPageToken: string | null;
  }> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.mailboxes, { params });
    return parseResponse(response, parseMailboxListResponseDto);
  },

  listThreads: async (params?: MailListParams): Promise<ThreadListApiResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.threads, { params });
    return parseResponse(response, parseThreadListResponseDto);
  },

  getThread: async (id: string): Promise<ThreadDetailApiResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.thread(id));
    return parseResponse(response, parseThreadDetailResponseDto);
  },

  claimThread: async (id: string): Promise<ThreadAssignmentActionResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.mail.threadClaim(id));
    return parseResponse(response, parseThreadAssignmentActionResponseDto);
  },

  reassignThread: async (
    id: string,
    payload: ReassignThreadRequest | string,
    reason?: string,
  ): Promise<ThreadAssignmentActionResponse> => {
    const request: ReassignThreadRequest =
      typeof payload === "string" ? { targetUserId: payload, reason } : payload;
    const response = await api.post<unknown>(CONTROLLERS.mail.threadReassign(id), request);
    return parseResponse(response, parseThreadAssignmentActionResponseDto);
  },

  unassignThread: async (
    id: string,
    payload: UnassignThreadRequest | string = {},
  ): Promise<ThreadAssignmentActionResponse> => {
    const request: UnassignThreadRequest =
      typeof payload === "string" ? { reason: payload } : payload;
    const response = await api.post<unknown>(CONTROLLERS.mail.threadUnassign(id), request);
    return parseResponse(response, parseThreadAssignmentActionResponseDto);
  },

  getThreadAssignmentHistory: async (id: string): Promise<ThreadAssignmentHistoryListResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.threadAssignmentHistory(id));
    return parseResponse(response, parseThreadAssignmentHistoryListResponseDto);
  },

  createDraft: async (payload: CreateDraftApiRequest): Promise<DraftApiDto> => {
    const response = await api.post<unknown>(CONTROLLERS.mail.drafts, payload);
    return parseResponse(response, parseDraftDto);
  },

  listDrafts: async (params?: DraftListParams): Promise<DraftListResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.drafts, { params });
    return parseResponse(response, parseDraftListResponseDto);
  },

  getDraft: async (id: string): Promise<DraftApiDto> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.draft(id));
    return parseResponse(response, parseDraftDto);
  },

  submitOutboundMessage: async (
    payload: SubmitOutboundMessageApiRequest,
  ): Promise<SubmitOutboundMessageApiResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.mail.outboundMessages, payload);
    return parseResponse(response, parseOutboundMessageResponseDto);
  },

  listProcessedMessages: async (
    params?: ProcessedMessageListParams,
  ): Promise<ProcessedMessageListResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.messages, { params });
    return parseResponse(response, parseProcessedMessageListResponseDto);
  },

  getProcessedMessage: async (id: string): Promise<ProcessedMessageResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.message(id));
    return parseResponse(response, parseProcessedMessageDto);
  },

  listQuarantine: async (params?: QuarantineListParams): Promise<QuarantineListResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.quarantine, { params });
    return parseResponse(response, parseQuarantineListResponseDto);
  },

  getQuarantineRecord: async (id: string): Promise<QuarantineRecordResponse> => {
    const response = await api.get<unknown>(CONTROLLERS.mail.quarantineRecord(id));
    return parseResponse(response, parseQuarantineRecordResponseDto);
  },

  releaseQuarantine: async (id: string): Promise<ReleaseQuarantineResponse> => {
    const response = await api.post<unknown>(CONTROLLERS.mail.quarantineRelease(id));
    return parseResponse(response, parseReleaseQuarantineResponseDto);
  },
};
