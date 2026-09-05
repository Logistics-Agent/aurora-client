export type MailQueueScope = "unassigned" | "mine" | "all" | "drafts";

export type MailThreadStatus =
  | "unassigned"
  | "in_progress"
  | "waiting_customer"
  | "resolved";

export type MailPriority = "low" | "normal" | "high" | "urgent";

export type MailMessageDirection = "inbound" | "outbound";
export type MailDeliveryStatus = "pending" | "delivered" | "failed";

export type MailFixtureScenario =
  | "success"
  | "THREAD_ALREADY_ASSIGNED"
  | "CROSS_STAFF_REPLY_FORBIDDEN"
  | "OUTBOUND_DELIVERY_FAILED";

export interface MailAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface MailMessage {
  id: string;
  direction: MailMessageDirection;
  authorId: string | null;
  authorName: string;
  senderAddress: string;
  bodyText: string;
  attachments: readonly MailAttachment[];
  sentAt: string;
  deliveryStatus: MailDeliveryStatus;
}

export interface AssignmentEvent {
  id: string;
  type: "claim" | "reassign" | "unassign";
  actorId: string;
  targetUserId: string | null;
  reason: string | null;
  occurredAt: string;
}

export interface AiDraftSuggestion {
  confidence: "low" | "medium" | "high";
  evidenceLabels: readonly string[];
  commercialParameters: Readonly<Record<string, string>>;
  proposedWording: string;
}

export interface MailParticipant {
  name: string;
  email: string;
}

export interface MailDraft {
  body: string;
  updatedAt: string;
}

export interface MailThread {
  id: string;
  version: number;
  mailboxId: string;
  subject: string;
  participants: readonly MailParticipant[];
  assigneeId: string | null;
  status: MailThreadStatus;
  priority: MailPriority;
  unreadCount: number;
  preview: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: readonly MailMessage[];
  assignmentHistory: readonly AssignmentEvent[];
  draft: MailDraft | null;
  aiDraftSuggestion: AiDraftSuggestion | null;
  fixtureScenario: MailFixtureScenario;
}

export interface MailMailbox {
  id: string;
  displayName: string;
  senderAddress: string;
}

export interface MailResourceScope {
  accessibleMailboxIds: readonly string[];
  permissions: readonly string[];
}

export interface MailListFilters {
  queue: MailQueueScope;
  mailboxId?: string;
  status?: MailThreadStatus;
  priority?: MailPriority;
  search?: string;
}

export interface MailPersonaFixture {
  userId: string;
  name: string;
  email: string;
  role: "STAFF" | "MANAGER";
  permissions: readonly string[];
  resourceScope: MailResourceScope;
}
