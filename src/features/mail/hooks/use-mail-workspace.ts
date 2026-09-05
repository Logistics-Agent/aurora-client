"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { hasPermission, type UserProfile } from "@/types/auth.types";
import type { MailMockRepository, SendMailMessageInput } from "../mock/mail-repository";
import type {
  MailListFilters,
  MailPriority,
  MailResourceScope,
  MailThread,
} from "../types";
import { selectVisibleThreads } from "../utils/thread-selectors";

const DEFAULT_FILTERS: MailListFilters = { queue: "unassigned" };

export interface UseMailWorkspaceOptions {
  user: UserProfile | null;
  resourceScope: MailResourceScope;
  initialThreadId?: string;
  repository: MailMockRepository;
}

export interface MailWorkspacePermissions {
  canRead: boolean;
  canReadAll: boolean;
  canClaim: boolean;
  canReassign: boolean;
  canUnassign: boolean;
  canCreateDraft: boolean;
  canSend: boolean;
}

export interface SelectedMailThreadPermissions {
  canClaim: boolean;
  canReassign: boolean;
  canUnassign: boolean;
  canSetPriority: boolean;
  canResolve: boolean;
  canCreateDraft: boolean;
  canSend: boolean;
}

export interface MailWorkspace {
  filters: MailListFilters;
  setFilters: (filters: MailListFilters) => void;
  visibleThreads: readonly MailThread[];
  queueCounts: Record<MailListFilters["queue"], number>;
  selectedThread: MailThread | null;
  selectThread: (threadId: string | undefined) => void;
  isLoading: boolean;
  error: unknown;
  permissions: MailWorkspacePermissions;
  selectedThreadPermissions: SelectedMailThreadPermissions;
  refresh: () => Promise<void>;
  claimThread: (threadId: string) => Promise<MailThread>;
  reassignThread: (
    threadId: string,
    targetUserId: string,
    reason: string,
  ) => Promise<MailThread>;
  unassignThread: (threadId: string, reason: string) => Promise<MailThread>;
  setPriority: (threadId: string, priority: MailPriority) => Promise<MailThread>;
  markResolved: (threadId: string) => Promise<MailThread>;
  saveDraft: (threadId: string, body: string) => Promise<MailThread>;
  sendMessage: (
    threadId: string,
    message: Omit<SendMailMessageInput, "authorId" | "authorName">,
  ) => Promise<MailThread>;
}

export function useMailWorkspace({
  user,
  resourceScope,
  initialThreadId,
  repository,
}: UseMailWorkspaceOptions): MailWorkspace {
  const [threads, setThreads] = useState<readonly MailThread[]>([]);
  const [filters, setFilters] = useState<MailListFilters>(DEFAULT_FILTERS);
  const [selection, setSelection] = useState({
    routeThreadId: initialThreadId,
    threadId: initialThreadId,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestGenerationRef = useRef(0);
  const repositoryIdentityRef = useRef(repository);
  const selectedThreadId =
    selection.routeThreadId === initialThreadId
      ? selection.threadId
      : initialThreadId;

  useLayoutEffect(() => {
    repositoryIdentityRef.current = repository;
  }, [repository]);

  const permissions = useMemo<MailWorkspacePermissions>(
    () => ({
      canRead: hasPermission(user, "mail:read"),
      canReadAll: hasPermission(user, "mail:thread:read_all"),
      canClaim: hasPermission(user, "mail:thread:claim"),
      canReassign: hasPermission(user, "mail:thread:reassign"),
      canUnassign: hasPermission(user, "mail:thread:unassign"),
      canCreateDraft: hasPermission(user, "mail:draft:create"),
      canSend: hasPermission(user, "mail:send"),
    }),
    [user],
  );
  const hasAuthenticatedUser = user?.isAuthenticated ?? false;

  const refresh = useCallback(async () => {
    const refreshRepository = repository;
    const generation = requestGenerationRef.current + 1;
    requestGenerationRef.current = generation;
    if (repositoryIdentityRef.current !== refreshRepository) return;
    setIsLoading(true);
    setError(null);
    try {
      const nextThreads = await refreshRepository.listThreads();
      if (
        repositoryIdentityRef.current === refreshRepository &&
        requestGenerationRef.current === generation
      ) {
        setThreads(nextThreads);
      }
    } catch (nextError) {
      if (
        repositoryIdentityRef.current === refreshRepository &&
        requestGenerationRef.current === generation
      ) {
        setError(nextError);
      }
    } finally {
      if (
        repositoryIdentityRef.current === refreshRepository &&
        requestGenerationRef.current === generation
      ) {
        setIsLoading(false);
      }
    }
  }, [repository]);

  useEffect(() => {
    let isCurrent = true;
    const generation = requestGenerationRef.current + 1;
    requestGenerationRef.current = generation;
    if (!hasAuthenticatedUser || !permissions.canRead) {
      return () => {
        isCurrent = false;
      };
    }

    const pendingThreads = repository.listThreads();

    void Promise.resolve().then(() => {
      if (
        isCurrent &&
        repositoryIdentityRef.current === repository &&
        requestGenerationRef.current === generation
      ) {
        setIsLoading(true);
        setError(null);
      }
    });

    void pendingThreads
      .then((nextThreads) => {
        if (
          isCurrent &&
          repositoryIdentityRef.current === repository &&
          requestGenerationRef.current === generation
        ) {
          setThreads(nextThreads);
        }
      })
      .catch((nextError: unknown) => {
        if (
          isCurrent &&
          repositoryIdentityRef.current === repository &&
          requestGenerationRef.current === generation
        ) {
          setError(nextError);
        }
      })
      .finally(() => {
        if (
          isCurrent &&
          repositoryIdentityRef.current === repository &&
          requestGenerationRef.current === generation
        ) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      if (requestGenerationRef.current === generation) {
        requestGenerationRef.current += 1;
      }
    };
  }, [hasAuthenticatedUser, permissions.canRead, repository]);

  const selectedThread = useMemo(() => {
    if (!selectedThreadId || !permissions.canRead) return null;
    return (
      threads.find(
        (thread) =>
          thread.id === selectedThreadId &&
          resourceScope.accessibleMailboxIds.includes(thread.mailboxId),
      ) ?? null
    );
  }, [permissions.canRead, resourceScope.accessibleMailboxIds, selectedThreadId, threads]);

  const visibleThreads = useMemo(() => {
    if (!permissions.canRead) return [];
    if (filters.queue === "all" && !permissions.canReadAll) return [];
    return selectVisibleThreads(threads, filters, user?.userId ?? "", resourceScope);
  }, [filters, permissions.canRead, permissions.canReadAll, resourceScope, threads, user?.userId]);

  const queueCounts = useMemo(
    () => {
      const queues: MailListFilters["queue"][] = ["unassigned", "mine", "all", "drafts"];
      return queues.reduce<Record<MailListFilters["queue"], number>>(
        (counts, queue) => {
          counts[queue] =
            permissions.canRead && (queue !== "all" || permissions.canReadAll)
              ? selectVisibleThreads(
                  threads,
                  { queue },
                  user?.userId ?? "",
                  resourceScope,
                ).length
              : 0;
          return counts;
        },
        { unassigned: 0, mine: 0, all: 0, drafts: 0 },
      );
    },
    [permissions.canRead, permissions.canReadAll, resourceScope, threads, user?.userId],
  );

  const selectedThreadPermissions = useMemo<SelectedMailThreadPermissions>(
    () => ({
      canClaim:
        permissions.canClaim && selectedThread?.assigneeId === null,
      canReassign: permissions.canReassign && selectedThread !== null,
      canUnassign: permissions.canUnassign && selectedThread?.assigneeId !== null,
      canSetPriority: selectedThread?.assigneeId === user?.userId,
      canResolve: selectedThread?.assigneeId === user?.userId,
      canCreateDraft:
        permissions.canCreateDraft &&
        (selectedThread?.assigneeId === user?.userId || permissions.canReassign),
      canSend:
        permissions.canSend &&
        (selectedThread?.assigneeId === user?.userId || permissions.canReassign),
    }),
    [permissions, selectedThread, user?.userId],
  );

  const mutateThread = useCallback(
    async (
      threadId: string,
      operation: (thread: MailThread) => Promise<MailThread>,
    ): Promise<MailThread> => {
      requireCapability(permissions.canRead, "mail:read");
      const thread = threads.find(
        (item) =>
          item.id === threadId &&
          resourceScope.accessibleMailboxIds.includes(item.mailboxId),
      );
      if (!thread) throw new Error(`Mail thread ${threadId} is unavailable.`);

      const operationRepository = repository;
      const operationGeneration = requestGenerationRef.current;
      setError(null);
      try {
        const updated = await operation(thread);
        if (
          repositoryIdentityRef.current !== operationRepository ||
          requestGenerationRef.current !== operationGeneration
        ) {
          return updated;
        }
        requestGenerationRef.current += 1;
        setThreads((current) =>
          current.map((item) => (item.id === threadId ? updated : item)),
        );
        return updated;
      } catch (nextError) {
        if (
          repositoryIdentityRef.current !== operationRepository ||
          requestGenerationRef.current !== operationGeneration
        ) {
          throw nextError;
        }
        if (isClaimConflict(nextError)) {
          const generation = requestGenerationRef.current + 1;
          requestGenerationRef.current = generation;
          try {
            const reconciledThreads = await operationRepository.listThreads();
            if (
              repositoryIdentityRef.current === operationRepository &&
              requestGenerationRef.current === generation
            ) {
              setThreads(reconciledThreads);
            }
          } catch {
            // Preserve the mutation error because it is the user-action outcome.
          }
        }
        if (repositoryIdentityRef.current === operationRepository) {
          setError(nextError);
        }
        throw nextError;
      }
    },
    [permissions.canRead, repository, resourceScope.accessibleMailboxIds, threads],
  );

  const claimThread = useCallback(
    async (threadId: string) => {
      return mutateThread(threadId, (thread) => {
        requireCapability(permissions.canClaim, "mail:thread:claim");
        requireCapability(Boolean(user), "authenticated session");
        return repository.claimThread(threadId, thread.version, user!.userId);
      });
    },
    [mutateThread, permissions.canClaim, repository, user],
  );

  const reassignThread = useCallback(
    async (threadId: string, targetUserId: string, reason: string) => {
      return mutateThread(threadId, (thread) => {
        requireCapability(permissions.canReassign, "mail:thread:reassign");
        return repository.reassignThread(
          threadId,
          thread.version,
          user!.userId,
          targetUserId,
          reason,
        );
      });
    },
    [mutateThread, permissions.canReassign, repository, user],
  );

  const unassignThread = useCallback(
    async (threadId: string, reason: string) => {
      return mutateThread(threadId, (thread) => {
        requireCapability(permissions.canUnassign, "mail:thread:unassign");
        return repository.unassignThread(threadId, thread.version, user!.userId, reason);
      });
    },
    [mutateThread, permissions.canUnassign, repository, user],
  );

  const setPriority = useCallback(
    async (threadId: string, priority: MailPriority) => {
      return mutateThread(threadId, (thread) => {
        requireCapability(Boolean(user) && thread.assigneeId === user?.userId, "mail:thread:update");
        return repository.setPriority(threadId, thread.version, priority);
      });
    },
    [mutateThread, repository, user],
  );

  const markResolved = useCallback(
    async (threadId: string) => {
      return mutateThread(threadId, (thread) => {
        requireCapability(Boolean(user) && thread.assigneeId === user?.userId, "mail:thread:update");
        return repository.markResolved(threadId, thread.version);
      });
    },
    [mutateThread, repository, user],
  );

  const saveDraft = useCallback(
    async (threadId: string, body: string) => {
      return mutateThread(threadId, (thread) => {
        requireCapability(permissions.canCreateDraft, "mail:draft:create");
        requireCapability(
          Boolean(user) && (thread.assigneeId === user?.userId || permissions.canReassign),
          "mail:thread:update",
        );
        return repository.saveDraft(threadId, thread.version, body);
      });
    },
    [
      mutateThread,
      permissions.canCreateDraft,
      permissions.canReassign,
      repository,
      user,
    ],
  );

  const sendMessage = useCallback(
    async (
      threadId: string,
      message: Omit<SendMailMessageInput, "authorId" | "authorName">,
    ) => {
      return mutateThread(threadId, (thread) => {
        requireCapability(permissions.canSend, "mail:send");
        requireCapability(
          Boolean(user) && (thread.assigneeId === user?.userId || permissions.canReassign),
          "mail:thread:update",
        );
        return repository.sendMessage(threadId, thread.version, {
          ...message,
          authorId: user!.userId,
          authorName: user!.name,
        });
      });
    },
    [
      mutateThread,
      permissions.canReassign,
      permissions.canSend,
      repository,
      user,
    ],
  );

  const selectThread = useCallback(
    (threadId: string | undefined) =>
      setSelection({ routeThreadId: initialThreadId, threadId }),
    [initialThreadId],
  );

  return {
    filters,
    setFilters,
    visibleThreads,
    queueCounts,
    selectedThread,
    selectThread,
    isLoading: hasAuthenticatedUser && permissions.canRead && isLoading,
    error,
    permissions,
    selectedThreadPermissions,
    refresh,
    claimThread,
    reassignThread,
    unassignThread,
    setPriority,
    markResolved,
    saveDraft,
    sendMessage,
  };
}

function requireCapability(isAllowed: boolean, permission: string): void {
  if (!isAllowed) {
    throw new Error(`Missing required permission: ${permission}.`);
  }
}

function isClaimConflict(error: unknown): error is { status: 409; code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "code" in error &&
    error.status === 409 &&
    error.code === "THREAD_ALREADY_ASSIGNED"
  );
}
