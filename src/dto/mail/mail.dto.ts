import { z } from "zod";

const timestamp = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Expected a valid timestamp");

const nullableTimestamp = timestamp.nullable();
const nullableString = z.string().nullable();

const mailboxDto = z.object({
  mailboxId: z.string().min(1),
  domainId: z.string().min(1),
  domainName: z.string().min(1),
  localPart: z.string().min(1),
  fullAddress: z.string().email(),
  status: z.string().min(1),
  createdAt: timestamp,
});

const threadSummaryDto = z.object({
  threadId: z.string().min(1),
  mailboxId: z.string().min(1),
  subject: z.string(),
  participants: z.array(z.string()),
  lastMessageAt: timestamp,
  messageCount: z.number().int().nonnegative(),
  draftCount: z.number().int().nonnegative(),
  hasUnread: z.boolean(),
  snippet: z.string(),
  primaryAssigneeUserId: nullableString.optional(),
  assignedAt: nullableTimestamp.optional(),
  status: nullableString.optional(),
  priority: nullableString.optional(),
});

const threadAttachmentDto = z.object({
  id: z.string(),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number(),
  url: z.string().optional().nullable(),
});

const threadMessageDto = z.object({
  messageId: z.string().min(1),
  direction: z.string().min(1),
  senderAddress: z.string().min(1),
  recipientAddresses: z.array(z.string().min(1)),
  subject: z.string(),
  bodyText: z.string(),
  bodyHtml: nullableString.optional(),
  bodyPreview: z.string(),
  replyToMessageId: nullableString.optional(),
  receivedAt: nullableTimestamp,
  sentAt: nullableTimestamp,
  attachments: z.array(threadAttachmentDto).optional().nullable(),
});

const draftDto = z.object({
  draftId: z.string().min(1),
  draftRootId: z.string().min(1),
  revisionNumber: z.number().int().nonnegative(),
  isLatestRevision: z.boolean(),
  source: z.string().min(1),
  status: z.string().min(1),
  mailboxId: z.string().min(1),
  assignedStaffId: nullableString.optional(),
  subject: z.string(),
  body: z.string(),
  contentHash: z.string(),
  createdAt: timestamp,
  to: z.array(z.string()).optional(),
  threadId: nullableString.optional(),
  replyToMessageId: nullableString.optional(),
});

const assignmentHistoryDto = z.object({
  id: z.string().min(1),
  threadId: z.string().min(1),
  fromUserId: nullableString,
  toUserId: nullableString,
  action: z.string().min(1),
  actorUserId: z.string().min(1),
  reason: nullableString,
  createdAt: timestamp,
});

const threadDetailDto = z.object({
  threadId: z.string().min(1),
  mailboxId: z.string().min(1),
  subject: z.string(),
  participants: z.array(z.string()),
  messages: z.array(threadMessageDto),
  drafts: z.array(draftDto),
  createdAt: timestamp,
  updatedAt: timestamp,
  primaryAssigneeUserId: nullableString.optional(),
  assignedAt: nullableTimestamp.optional(),
  status: nullableString.optional(),
  priority: nullableString.optional(),
  assignmentHistory: z.array(assignmentHistoryDto).optional(),
});

const threadAssignmentHistoryListDto = z.object({
  threadId: z.string().min(1),
  history: z.array(assignmentHistoryDto),
});

const threadAssignmentActionDto = z.object({
  success: z.boolean(),
  threadId: z.string().min(1),
  primaryAssigneeUserId: z.string().min(1).optional(),
  assignedAt: nullableTimestamp.optional(),
  status: z.string().min(1),
});

const securityCheckDto = z.object({
  stage: z.string().min(1),
  result: z.string().min(1),
  detailJson: z.string().nullable(),
  durationMs: z.number().int().nonnegative(),
});

const processedMessageDto = z.object({
  processedMessageId: z.string().min(1),
  messageId: z.string().min(1),
  direction: z.string().min(1),
  senderAddress: z.string().min(1),
  recipientAddresses: z.array(z.string().min(1)),
  subject: z.string(),
  receivedAt: nullableTimestamp,
  processedAt: nullableTimestamp,
  emailCategory: nullableString,
  pipelineStatus: z.string().min(1),
  spamScore: z.number().min(0).max(1).nullable(),
  phishingScore: z.number().min(0).max(1).nullable(),
  isQuarantined: z.boolean(),
  r2RawEmlPath: nullableString,
  securityChecks: z.array(securityCheckDto),
});

const quarantineRecordDto = z.object({
  quarantineId: z.string().min(1),
  processedMessageId: z.string().min(1),
  messageId: z.string().min(1),
  quarantineReason: z.string().min(1),
  quarantinedAt: timestamp,
  status: z.string().min(1),
  reviewedBy: nullableString,
  reviewedAt: nullableTimestamp,
});

const mailboxListResponseDto = z.object({
  mailboxes: z.array(mailboxDto),
  nextPageToken: nullableString,
});

const threadListResponseDto = z.object({
  threads: z.array(threadSummaryDto),
  nextPageToken: nullableString.optional(),
  hasMore: z.boolean().optional(),
});

const processedMessageListResponseDto = z.object({
  messages: z.array(processedMessageDto),
  nextPageToken: nullableString,
});

const quarantineListResponseDto = z.object({
  records: z.array(quarantineRecordDto),
  nextPageToken: nullableString,
});

const draftListResponseDto = z.object({
  drafts: z.array(draftDto),
  nextPageToken: nullableString,
});

const releaseQuarantineResponseDto = z.object({
  success: z.boolean(),
  releasedAt: timestamp,
});

const outboundMessageResponseDto = z.object({
  processedMessageId: z.string().min(1),
  stalwartQueueId: z.string().min(1),
  submittedAt: timestamp,
});

export type Mailbox = z.infer<typeof mailboxDto>;
export type ThreadSummaryApiDto = z.infer<typeof threadSummaryDto>;
export type ThreadListApiResponse = z.infer<typeof threadListResponseDto>;
export type ThreadMessageApiDto = z.infer<typeof threadMessageDto>;
export type DraftApiDto = z.infer<typeof draftDto>;
export type ThreadAssignmentHistoryApiDto = z.infer<typeof assignmentHistoryDto>;
export type ThreadDetailApiResponse = z.infer<typeof threadDetailDto>;
export type ThreadAssignmentHistoryListResponse = z.infer<typeof threadAssignmentHistoryListDto>;
export type ThreadAssignmentActionResponse = z.infer<typeof threadAssignmentActionDto>;
export type DraftListResponse = z.infer<typeof draftListResponseDto>;
export type ProcessedMessageResponse = z.infer<typeof processedMessageDto>;
export type ProcessedMessageListResponse = z.infer<typeof processedMessageListResponseDto>;
export type QuarantineRecordResponse = z.infer<typeof quarantineRecordDto>;
export type QuarantineListResponse = z.infer<typeof quarantineListResponseDto>;
export type ReleaseQuarantineResponse = z.infer<typeof releaseQuarantineResponseDto>;

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

export type MailListParams = {
  mailboxId?: string;
  pageSize?: number;
  pageToken?: string;
  scope?: string;
  status?: string;
  search?: string;
};

export type MailboxListParams = Pick<MailListParams, "pageSize" | "pageToken">;
export type DraftListParams = Pick<
  MailListParams,
  "mailboxId" | "status" | "pageSize" | "pageToken"
>;
export type ProcessedMessageListParams = Pick<
  MailListParams,
  "pageSize" | "pageToken" | "status"
> & {
  direction?: string;
  emailCategory?: string;
  pipelineStatus?: string;
};
export type QuarantineListParams = Pick<MailListParams, "pageSize" | "pageToken" | "status">;

export function parseMailboxListResponseDto(value: unknown) {
  return mailboxListResponseDto.parse(value);
}

export function parseThreadListResponseDto(value: unknown) {
  return threadListResponseDto.parse(value);
}

export function parseThreadDetailResponseDto(value: unknown) {
  return threadDetailDto.parse(value);
}

export function parseThreadAssignmentHistoryListResponseDto(value: unknown) {
  return threadAssignmentHistoryListDto.parse(value);
}

export function parseThreadAssignmentActionResponseDto(value: unknown) {
  return threadAssignmentActionDto.parse(value);
}

export function parseDraftListResponseDto(value: unknown) {
  return draftListResponseDto.parse(value);
}

export function parseProcessedMessageListResponseDto(value: unknown) {
  return processedMessageListResponseDto.parse(value);
}

export function parseQuarantineListResponseDto(value: unknown) {
  return quarantineListResponseDto.parse(value);
}

export function parseQuarantineRecordResponseDto(value: unknown) {
  return quarantineRecordDto.parse(value);
}

export function parseReleaseQuarantineResponseDto(value: unknown) {
  return releaseQuarantineResponseDto.parse(value);
}

export function parseOutboundMessageResponseDto(value: unknown) {
  return outboundMessageResponseDto.parse(value);
}

export function parseDraftDto(value: unknown) {
  return draftDto.parse(value);
}

export function parseProcessedMessageDto(value: unknown) {
  return processedMessageDto.parse(value);
}
