import { api } from "@/lib/api";

export type ThreadSummaryApiDto = {
  threadId: string;
  mailboxId: string;
  subject: string;
  participants: string[];
  lastMessageAt: string;
  messageCount: number;
  draftCount: number;
  hasUnread: boolean;
  snippet: string;
  primaryAssigneeUserId?: string | null;
  assignedAt?: string | null;
  status?: string | null;
  priority?: string | null;
};

export type ThreadListApiResponse = {
  threads: ThreadSummaryApiDto[];
  nextPageToken?: string | null;
  hasMore?: boolean;
};

export type ThreadMessageApiDto = {
  messageId: string;
  direction: string;
  senderAddress: string;
  recipientAddresses: string[];
  subject: string;
  bodyText: string;
  bodyPreview: string;
  replyToMessageId?: string;
  receivedAt: string;
  sentAt: string;
};

export type DraftApiDto = {
  draftId: string;
  draftRootId: string;
  revisionNumber: number;
  isLatestRevision: boolean;
  source: string;
  status: string;
  mailboxId: string;
  assignedStaffId?: string | null;
  subject: string;
  body: string;
  contentHash: string;
  createdAt: string;
  to?: string[];
  threadId?: string | null;
  replyToMessageId?: string | null;
};

export type ThreadAssignmentHistoryApiDto = {
  id: string;
  threadId: string;
  fromUserId: string;
  toUserId: string;
  action: string;
  actorUserId: string;
  reason: string;
  createdAt: string;
};

export type ThreadDetailApiResponse = {
  threadId: string;
  mailboxId: string;
  subject: string;
  participants: string[];
  messages: ThreadMessageApiDto[];
  drafts: DraftApiDto[];
  createdAt: string;
  updatedAt: string;
  primaryAssigneeUserId?: string | null;
  assignedAt?: string | null;
  status?: string | null;
  priority?: string | null;
  assignmentHistory?: ThreadAssignmentHistoryApiDto[];
};

export type CreateDraftApiRequest = {
  mailboxId: string;
  assignedStaffId?: string;
  subject: string;
  body: string;
  sourceType?: string;
  sourceId?: string;
  idempotencyKey?: string;
  to?: string[];
  threadId?: string;
  replyToMessageId?: string;
};

export type SubmitOutboundMessageApiRequest = {
  senderAddress: string;
  recipientAddresses: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    contentBase64: string;
  }>;
  idempotencyKey?: string;
  draftRootId?: string;
  threadId?: string;
  replyToMessageId?: string;
};

export type SubmitOutboundMessageApiResponse = {
  processedMessageId: string;
  stalwartQueueId: string;
  submittedAt: string;
};

export const mailService = {
  // Threads
  listThreads: async (params?: {
    mailboxId?: string;
    pageSize?: number;
    pageToken?: string;
    scope?: string;
    status?: string;
    search?: string;
  }): Promise<ThreadListApiResponse> => {
    return api.get<ThreadListApiResponse>("/api/v1/mail/threads", { params });
  },

  getThread: async (id: string): Promise<ThreadDetailApiResponse> => {
    return api.get<ThreadDetailApiResponse>(`/api/v1/mail/threads/${id}`);
  },

  claimThread: async (id: string): Promise<{
    success: boolean;
    threadId: string;
    primaryAssigneeUserId: string;
    assignedAt: string;
    status: string;
  }> => {
    return api.post(`/api/v1/mail/threads/${id}/claim`);
  },

  reassignThread: async (
    id: string,
    targetUserId: string,
    reason?: string,
  ): Promise<{
    success: boolean;
    threadId: string;
    primaryAssigneeUserId: string;
    assignedAt: string;
    status: string;
  }> => {
    return api.post(`/api/v1/mail/threads/${id}/reassign`, {
      targetUserId,
      reason,
    });
  },

  unassignThread: async (
    id: string,
    reason?: string,
  ): Promise<{
    success: boolean;
    threadId: string;
    status: string;
  }> => {
    return api.post(`/api/v1/mail/threads/${id}/unassign`, { reason });
  },

  getThreadAssignmentHistory: async (
    id: string,
  ): Promise<{
    threadId: string;
    history: ThreadAssignmentHistoryApiDto[];
  }> => {
    return api.get(`/api/v1/mail/threads/${id}/assignment-history`);
  },

  // Drafts
  createDraft: async (payload: CreateDraftApiRequest): Promise<DraftApiDto> => {
    return api.post<DraftApiDto>("/api/v1/mail/drafts", payload);
  },

  listDrafts: async (params?: {
    mailboxId?: string;
    status?: string;
    pageSize?: number;
    pageToken?: string;
  }): Promise<{ drafts: DraftApiDto[]; nextPageToken?: string }> => {
    return api.get("/api/v1/mail/drafts", { params });
  },

  getDraft: async (id: string): Promise<DraftApiDto> => {
    return api.get<DraftApiDto>(`/api/v1/mail/drafts/${id}`);
  },

  // Outbound
  submitOutboundMessage: async (
    payload: SubmitOutboundMessageApiRequest,
  ): Promise<SubmitOutboundMessageApiResponse> => {
    return api.post<SubmitOutboundMessageApiResponse>(
      "/api/v1/mail/messages/outbound",
      payload,
    );
  },

  // Processed Messages
  listProcessedMessages: async (params?: {
    direction?: string;
    emailCategory?: string;
    pipelineStatus?: string;
    pageSize?: number;
    pageToken?: string;
  }): Promise<any> => {
    return api.get("/api/v1/mail/messages", { params });
  },

  getProcessedMessage: async (id: string): Promise<any> => {
    return api.get(`/api/v1/mail/messages/${id}`);
  },

  // Quarantine
  listQuarantine: async (params?: {
    status?: string;
    pageSize?: number;
    pageToken?: string;
  }): Promise<any> => {
    return api.get("/api/v1/mail/quarantine", { params });
  },

  releaseQuarantine: async (id: string): Promise<any> => {
    return api.post(`/api/v1/mail/quarantine/${id}/release`);
  },
};
