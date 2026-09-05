import type {
  MailListFilters,
  MailMailbox,
  MailQueueScope,
  MailThread,
} from "../../types";

export type MailQueueCounts = Record<MailQueueScope, number>;

export interface MailInboxProps {
  canClaim: boolean;
  currentUserId: string;
  error: unknown;
  filters: MailListFilters;
  isLoading: boolean;
  mailboxes: readonly MailMailbox[];
  onClaim: (threadId: string) => void;
  onFiltersChange: (filters: MailListFilters) => void;
  onRetry: () => void;
  onThreadSelect: (threadId: string) => void;
  queueCounts: MailQueueCounts;
  selectedThreadId?: string;
  showAllThreads: boolean;
  showQueueNavigation?: boolean;
  showThreadList?: boolean;
  threads: readonly MailThread[];
}
