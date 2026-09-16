import type {
  DraftListParams,
  MailboxListParams,
  MailListParams,
  ProcessedMessageListParams,
  QuarantineListParams,
} from "@/dto/mail/mail.dto";

import { rootQueryKeys } from "./root.keys";

export const mailKeys = {
  all: [...rootQueryKeys.all, "mail"] as const,
  mailboxes: (params?: MailboxListParams) => [...mailKeys.all, "mailboxes", params] as const,
  threads: () => [...mailKeys.all, "threads"] as const,
  threadList: (params?: MailListParams) => [...mailKeys.threads(), params] as const,
  thread: (id: string) => [...mailKeys.threads(), id] as const,
  assignmentHistory: (id: string) => [...mailKeys.thread(id), "assignment-history"] as const,
  drafts: (params?: DraftListParams) => [...mailKeys.all, "drafts", params] as const,
  draft: (id: string) => [...mailKeys.all, "draft", id] as const,
  messages: (params?: ProcessedMessageListParams) => [...mailKeys.all, "messages", params] as const,
  message: (id: string) => [...mailKeys.all, "message", id] as const,
  quarantine: (params?: QuarantineListParams) => [...mailKeys.all, "quarantine", params] as const,
  quarantineRecord: (id: string) => [...mailKeys.all, "quarantine-record", id] as const,
} as const;
