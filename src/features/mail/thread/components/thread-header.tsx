import type { RefObject } from "react";
import { User, Users, ShieldAlert, History, UserCheck, CheckCircle2 } from "lucide-react";

import { StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { MailMailbox, MailPriority, MailThread } from "../../types";

export interface ThreadHeaderPermissions {
  canClaim: boolean;
  canSetPriority: boolean;
  canResolve: boolean;
  canReassign: boolean;
  canUnassign: boolean;
}

export interface ThreadHeaderProps {
  thread: MailThread;
  mailbox?: MailMailbox;
  currentUserId?: string;
  permissions: ThreadHeaderPermissions;
  onClaim?: () => void;
  onPriorityChange?: (priority: MailPriority) => void;
  onResolve?: () => void;
  onReassign?: () => void;
  onUnassign?: () => void;
  onHistory?: () => void;
  reassignButtonRef?: RefObject<HTMLButtonElement | null>;
  unassignButtonRef?: RefObject<HTMLButtonElement | null>;
  historyButtonRef?: RefObject<HTMLButtonElement | null>;
}

const statusIntent = {
  unassigned: "neutral",
  in_progress: "info",
  waiting_customer: "warning",
  resolved: "success",
} as const;

const priorityStyles: Record<MailPriority, { container: string; dot: string; label: string; text: string }> = {
  urgent: {
    container: "bg-rose-50 border-rose-300 text-rose-900",
    dot: "bg-rose-500",
    label: "Urgent",
    text: "text-rose-900 font-bold",
  },
  high: {
    container: "bg-amber-50 border-amber-300 text-amber-900",
    dot: "bg-amber-500",
    label: "High",
    text: "text-amber-900 font-bold",
  },
  normal: {
    container: "bg-sky-50 border-sky-300 text-sky-900",
    dot: "bg-sky-500",
    label: "Normal",
    text: "text-sky-900 font-medium",
  },
  low: {
    container: "bg-slate-100 border-slate-300 text-slate-800",
    dot: "bg-slate-400",
    label: "Low",
    text: "text-slate-800 font-medium",
  },
};

export function ThreadHeader({
  thread,
  mailbox,
  currentUserId,
  permissions,
  onClaim,
  onPriorityChange,
  onResolve,
  onReassign,
  onUnassign,
  onHistory,
  reassignButtonRef,
  unassignButtonRef,
  historyButtonRef,
}: ThreadHeaderProps): React.JSX.Element {
  const isSelfAssigned = Boolean(thread.assigneeId) && thread.assigneeId === currentUserId;
  const readOnly = Boolean(thread.assigneeId) && !isSelfAssigned && !permissions.canReassign;
  const currentPriority = priorityStyles[thread.priority] || priorityStyles.normal;

  return (
    <header className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 p-4 shadow-2xs space-y-3.5">
      {/* Subject & Version */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{thread.subject}</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
              v{thread.version}
            </span>
          </div>
          {mailbox && (
            <p className="text-xs text-slate-500 font-medium">
              Mailbox: <span className="font-semibold text-slate-700">{mailbox.displayName || mailbox.senderAddress}</span> ({mailbox.senderAddress})
            </p>
          )}
        </div>

        {/* Priority & Status Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={thread.status.replaceAll("_", " ")} intent={statusIntent[thread.status]} />

          {/* Color-Coded Priority Selector */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs shadow-3xs transition-colors ${currentPriority.container}`}
          >
            <span className={`size-2 rounded-full ${currentPriority.dot}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">Priority</span>
            <select
              id={`thread-${thread.id}-priority`}
              value={thread.priority}
              disabled={!permissions.canSetPriority}
              onChange={(event) => onPriorityChange?.(event.target.value as MailPriority)}
              className={`bg-transparent outline-none cursor-pointer text-xs pr-1 disabled:cursor-not-allowed disabled:opacity-60 ${currentPriority.text}`}
              aria-label="Change thread priority"
            >
              <option value="low" className="bg-white text-slate-800">Low (Thấp)</option>
              <option value="normal" className="bg-white text-sky-800">Normal (Bình thường)</option>
              <option value="high" className="bg-white text-amber-800 font-semibold">High (Cao)</option>
              <option value="urgent" className="bg-white text-rose-800 font-bold">Urgent (Khẩn cấp)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participants & Assignee Row (Clean compact chip layout) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/70 text-xs">
        {/* Participants Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Users className="size-3.5 text-slate-400 mr-0.5 shrink-0" />
          <span className="text-slate-500 text-[11px] font-medium mr-1">Participants:</span>
          {thread.participants.map((p) => (
            <span
              key={p.email}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200/90 text-slate-700 font-medium shadow-3xs"
              title={p.email}
            >
              <span className="text-[11px]">{p.name || p.email}</span>
              {p.name && p.name !== p.email && (
                <span className="text-[10px] text-slate-400 font-mono">&lt;{p.email}&gt;</span>
              )}
            </span>
          ))}
        </div>

        {/* Assignee Badge */}
        <div className="flex items-center gap-1.5">
          <User className="size-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 text-[11px]">Assignee:</span>
          {thread.assigneeId ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold text-[11px]">
              <UserCheck className="size-3 text-blue-600" />
              {isSelfAssigned ? "Assigned to You" : thread.assigneeId}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-medium text-[11px]">
              Unassigned
            </span>
          )}
          {readOnly && (
            <span className="text-[10px] text-amber-700 flex items-center gap-0.5" title="Read only: Assigned to another staff member">
              <ShieldAlert className="size-3" />
              (Read-only)
            </span>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canClaim && (
            <Button
              size="sm"
              onClick={onClaim}
              className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-1.5 shadow-2xs"
            >
              <UserCheck className="size-3.5" />
              Take thread
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={!permissions.canResolve}
            onClick={onResolve}
            className="text-xs font-semibold gap-1.5"
          >
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Mark resolved
          </Button>
          {permissions.canReassign && (
            <Button
              ref={reassignButtonRef}
              size="sm"
              variant="outline"
              onClick={onReassign}
              className="text-xs font-semibold"
            >
              Reassign thread
            </Button>
          )}
          {permissions.canUnassign && (
            <Button
              ref={unassignButtonRef}
              size="sm"
              variant="outline"
              onClick={onUnassign}
              className="text-xs font-semibold text-slate-600"
            >
              Release to unassigned
            </Button>
          )}
        </div>

        <Button
          ref={historyButtonRef}
          size="sm"
          variant="ghost"
          onClick={onHistory}
          className="text-xs text-slate-500 hover:text-slate-800 gap-1"
        >
          <History className="size-3.5" />
          Assignment history
        </Button>
      </div>
    </header>
  );
}
