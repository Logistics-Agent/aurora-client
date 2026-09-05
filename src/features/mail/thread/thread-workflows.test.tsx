import { useMemo } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { createMailThreadFixture } from "../mock/factories";
import { createMailMockRepository } from "../mock/mail-repository";
import { useMailWorkspace } from "../hooks/use-mail-workspace";
import type { MailMailbox, MailThread } from "../types";
import { MailThreadPanel } from "./index";

afterEach(cleanup);

describe("MailThreadPanel", () => {
  it("does not resolve an unscoped direct-route id from full mail fixtures", () => {
    render(<MailThreadPanel initialThreadId="thread-success-01" />);

    expect(screen.getByText("No conversation selected")).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Booking confirmation" })).not.toBeInTheDocument();
  });

  it("does not render an inaccessible workspace route id even when the fixture catalog has that id", async () => {
    const repository = createMailMockRepository([
      createMailThreadFixture({
        id: "thread-success-01",
        mailboxId: "mailbox-finance",
        subject: "Finance-only conversation",
      }),
    ]);
    render(
      <WorkspaceThreadPanel
        repository={repository}
        initialThreadId="thread-success-01"
        accessibleMailboxIds={["mailbox-operations"]}
      />,
    );

    expect(await screen.findByText("No conversation selected")).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Finance-only conversation" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Booking confirmation" })).not.toBeInTheDocument();
  });

  it("renders sender, recipients, mailbox, version, safe timeline text, and attachment interactions", async () => {
    const user = userEvent.setup();
    const openedAttachments: string[] = [];
    const thread = createMailThreadFixture({
      subject: "Urgent booking request",
      assigneeId: "staff-01",
      status: "in_progress",
      priority: "high",
      messages: [
        {
          id: "inbound-1",
          direction: "inbound",
          authorId: null,
          authorName: "Jordan Lee",
          senderAddress: "jordan@example.test",
          bodyText: "<script>unsafe message</script>",
          attachments: [
            {
              id: "attachment-1",
              fileName: "booking.pdf",
              contentType: "application/pdf",
              sizeBytes: 1200,
            },
          ],
          sentAt: "2026-09-04T08:00:00.000Z",
          deliveryStatus: "delivered",
        },
        {
          id: "outbound-1",
          direction: "outbound",
          authorId: "staff-01",
          authorName: "Avery Staff",
          senderAddress: "operations@example.test",
          bodyText: "The booking is confirmed.",
          attachments: [],
          sentAt: "2026-09-04T09:00:00.000Z",
          deliveryStatus: "delivered",
        },
      ],
    });

    render(
      <ThreadPanel
        thread={thread}
        mailbox={operationsMailbox}
        currentUserId="staff-01"
        permissions={ownThreadPermissions}
        onAttachmentOpen={(attachment) => openedAttachments.push(attachment.id)}
      />,
    );

    expect(screen.getByRole("heading", { name: "Urgent booking request" })).toBeVisible();
    expect(screen.getByText("Shared sender: operations@example.test")).toBeVisible();
    expect(screen.getByText("Recipient: Jordan Lee <jordan.lee@example.test>")).toBeVisible();
    expect(screen.getByText("Version 1")).toBeVisible();
    expect(screen.getByText("<script>unsafe message</script>")).toBeVisible();
    expect(screen.getByText("Authenticated author: Avery Staff")).toBeVisible();
    expect(screen.getByText("2026-09-04T08:00:00.000Z", { selector: "time" }))
      .toHaveAttribute("dateTime", "2026-09-04T08:00:00.000Z");
    expect(screen.getByText("2026-09-04T09:00:00.000Z", { selector: "time" }))
      .toHaveAttribute("dateTime", "2026-09-04T09:00:00.000Z");

    await user.click(screen.getByRole("button", { name: "Open booking.pdf" }));
    expect(openedAttachments).toEqual(["attachment-1"]);
  });

  it("emits priority and resolution intents only for the current assignee", async () => {
    const user = userEvent.setup();
    const priorityChanges: string[] = [];
    let resolved = false;
    const thread = createMailThreadFixture({ assigneeId: "staff-01", status: "in_progress" });

    render(
      <ThreadPanel
        thread={thread}
        mailbox={operationsMailbox}
        currentUserId="staff-01"
        permissions={ownThreadPermissions}
        onPriorityChange={(priority) => {
          priorityChanges.push(priority);
        }}
        onResolve={() => {
          resolved = true;
        }}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Priority"), "urgent");
    await user.click(screen.getByRole("button", { name: "Mark resolved" }));

    expect(priorityChanges).toEqual(["urgent"]);
    expect(resolved).toBe(true);
  });

  it("keeps a colleague-owned thread read-only for ordinary staff while showing supervisory controls to direct permission holders", () => {
    const colleagueThread = createMailThreadFixture({
      assigneeId: "staff-02",
      status: "in_progress",
    });
    const { rerender } = render(
      <ThreadPanel
        thread={colleagueThread}
        mailbox={operationsMailbox}
        currentUserId="staff-01"
        permissions={noSupervisoryPermissions}
      />,
    );

    expect(screen.getByText("Read-only: assigned to staff-02")).toBeVisible();
    expect(screen.getByLabelText("Priority")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Mark resolved" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Reassign thread" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Release to unassigned" })).not.toBeInTheDocument();

    rerender(
      <ThreadPanel
        thread={colleagueThread}
        mailbox={operationsMailbox}
        currentUserId="staff-01"
        permissions={{ ...noSupervisoryPermissions, canReassign: true, canUnassign: true }}
      />,
    );

    expect(screen.getByRole("button", { name: "Reassign thread" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Release to unassigned" })).toBeVisible();
  });

  it("validates supervisory reassignment, submits a reason, and restores focus after close", async () => {
    const user = userEvent.setup();
    let reassignment: { targetUserId: string; reason: string } | undefined;
    render(
      <ThreadPanel
        thread={createMailThreadFixture({ assigneeId: "staff-02", status: "in_progress" })}
        mailbox={operationsMailbox}
        currentUserId="manager-01"
        permissions={{ ...noSupervisoryPermissions, canReassign: true }}
        assignees={[{ userId: "staff-03", name: "Kai Operator" }]}
        onReassign={(targetUserId, reason) => {
          reassignment = { targetUserId, reason };
        }}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Reassign thread" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Confirm reassignment" }));
    expect(screen.getByText("Choose a staff member to continue.")).toBeVisible();
    expect(screen.getByText("Provide a business reason to continue.")).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Assign to"), "staff-03");
    await user.type(screen.getByLabelText("Business reason"), "Coverage for the late shift");
    await user.click(screen.getByRole("button", { name: "Confirm reassignment" }));

    await waitFor(() => expect(reassignment).toEqual({
      targetUserId: "staff-03",
      reason: "Coverage for the late shift",
    }));
    expect(trigger).toHaveFocus();
  });

  it("requires a reason before releasing a thread and presents newest assignment history first", async () => {
    const user = userEvent.setup();
    const releaseReasons: string[] = [];
    render(
      <ThreadPanel
        thread={createMailThreadFixture({
          assigneeId: "staff-02",
          status: "in_progress",
          assignmentHistory: [
            {
              id: "assignment-2",
              type: "reassign",
              actorId: "manager-01",
              targetUserId: "staff-02",
              reason: "Balance workload",
              occurredAt: "2026-09-04T09:00:00.000Z",
            },
            {
              id: "assignment-1",
              type: "claim",
              actorId: "staff-02",
              targetUserId: "staff-02",
              reason: null,
              occurredAt: "2026-09-04T08:00:00.000Z",
            },
          ],
        })}
        mailbox={operationsMailbox}
        currentUserId="manager-01"
        permissions={{ ...noSupervisoryPermissions, canUnassign: true }}
        onUnassign={(reason) => {
          releaseReasons.push(reason);
        }}
      />,
    );

    const historyTrigger = screen.getByRole("button", { name: "View assignment history" });
    await user.click(historyTrigger);
    const history = screen.getByRole("dialog", { name: "Assignment history" });
    expect(history.textContent?.indexOf("Reassigned")).toBeLessThan(
      history.textContent?.indexOf("Claimed") ?? -1,
    );
    const historyTimes = Array.from(history.querySelectorAll("time"));
    expect(historyTimes.map((item) => item.dateTime)).toEqual([
      "2026-09-04T09:00:00.000Z",
      "2026-09-04T08:00:00.000Z",
    ]);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(historyTrigger).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Release to unassigned" }));
    await user.click(screen.getByRole("button", { name: "Release thread" }));
    expect(screen.getByText("Provide a business reason to continue.")).toBeVisible();
    await user.type(screen.getByLabelText("Release reason"), "Shift handover");
    await user.click(screen.getByRole("button", { name: "Release thread" }));
    await waitFor(() => expect(releaseReasons).toEqual(["Shift handover"]));
  });

  it("recovers from a real concurrent claim conflict by refreshing into a read-only colleague-owned thread", async () => {
    const user = userEvent.setup();
    const thread = createMailThreadFixture({ id: "race-thread", subject: "Concurrent booking" });
    const repository = createMailMockRepository([thread]);
    render(<WorkspaceThreadPanel repository={repository} initialThreadId={thread.id} />);

    const claim = await screen.findByRole("button", { name: "Take thread" });
    await repository.reassignThread(thread.id, 1, "manager-01", "staff-02", "Coverage");
    await user.click(claim);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Assignment refreshed. This thread is now read-only.",
    );
    expect(screen.getByText("Read-only: assigned to staff-02")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Take thread" })).not.toBeInTheDocument();
  });

  it("persists supervisory reassignment, assignee priority and resolution, and release through the workspace repository", async () => {
    const user = userEvent.setup();
    const thread = createMailThreadFixture({
      id: "supervisory-thread",
      assigneeId: "staff-02",
      status: "in_progress",
      priority: "normal",
    });
    const repository = createMailMockRepository([thread]);
    render(
      <WorkspaceThreadPanel
        repository={repository}
        initialThreadId={thread.id}
        user={managerUser}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Reassign thread" }));
    await user.selectOptions(screen.getByLabelText("Assign to"), "manager-01");
    await user.type(screen.getByLabelText("Business reason"), "Own the customer escalation");
    await user.click(screen.getByRole("button", { name: "Confirm reassignment" }));
    await waitFor(() => expect(screen.getByText("Assignee: manager-01")).toBeVisible());

    await user.selectOptions(screen.getByLabelText("Priority"), "urgent");
    await user.click(screen.getByRole("button", { name: "Mark resolved" }));
    await user.click(screen.getByRole("button", { name: "Release to unassigned" }));
    await user.type(screen.getByLabelText("Release reason"), "Escalation complete");
    await user.click(screen.getByRole("button", { name: "Release thread" }));

    const updated = await repository.getThread(thread.id);
    expect(updated).toMatchObject({
      assigneeId: null,
      status: "unassigned",
      priority: "urgent",
      version: 5,
    });
    expect(updated?.assignmentHistory.map((event) => ({
      type: event.type,
      targetUserId: event.targetUserId,
      reason: event.reason,
    }))).toEqual([
      {
        type: "reassign",
        targetUserId: "manager-01",
        reason: "Own the customer escalation",
      },
      {
        type: "unassign",
        targetUserId: null,
        reason: "Escalation complete",
      },
    ]);
  });

  it("saves and sends a selected shared mailbox reply through the real workspace repository adapter", async () => {
    const user = userEvent.setup();
    const thread = createMailThreadFixture({
      id: "composer-workspace-thread",
      assigneeId: "staff-01",
      status: "in_progress",
    });
    const repository = createMailMockRepository([thread]);
    render(<ComposerWorkspaceThreadPanel repository={repository} initialThreadId={thread.id} />);

    await user.selectOptions(await screen.findByLabelText("From shared mailbox"), "mailbox-support");
    await user.type(screen.getByLabelText("Reply message"), "The pickup is scheduled for Tuesday.");
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(async () =>
      expect(await repository.getThread(thread.id)).toMatchObject({
        draft: { body: "The pickup is scheduled for Tuesday." },
      }),
    );

    await user.click(screen.getByRole("button", { name: "Send outbound" }));
    await waitFor(async () =>
      expect((await repository.getThread(thread.id))?.messages.at(-1)).toMatchObject({
        senderAddress: "support@example.test",
        authorId: "staff-01",
        authorName: "Avery Staff",
        bodyText: "The pickup is scheduled for Tuesday.",
        deliveryStatus: "delivered",
      }),
    );
    expect((await repository.getThread(thread.id))?.draft).toBeNull();
  });
});

const operationsMailbox: MailMailbox = {
  id: "mailbox-operations",
  displayName: "Operations",
  senderAddress: "operations@example.test",
};

const supportMailbox: MailMailbox = {
  id: "mailbox-support",
  displayName: "Customer Support",
  senderAddress: "support@example.test",
};

const ownThreadPermissions = {
  canClaim: false,
  canSetPriority: true,
  canResolve: true,
  canReassign: false,
  canUnassign: false,
};

const noSupervisoryPermissions = {
  canClaim: false,
  canSetPriority: false,
  canResolve: false,
  canReassign: false,
  canUnassign: false,
};

const managerUser = {
  userId: "manager-01",
  tenantId: "tenant-01",
  email: "manager@example.test",
  name: "Riley Manager",
  role: "MANAGER" as const,
  permissions: [
    "mail:read",
    "mail:thread:reassign",
    "mail:thread:unassign",
  ],
  isAuthenticated: true,
};

type RichThreadPanelProps = {
  thread?: MailThread | null;
  mailbox?: MailMailbox;
  currentUserId?: string;
  permissions?: typeof ownThreadPermissions;
  assignees?: readonly { userId: string; name: string }[];
  error?: unknown;
  onClaim?: () => Promise<void> | void;
  onPriorityChange?: (priority: MailThread["priority"]) => Promise<void> | void;
  onResolve?: () => Promise<void> | void;
  onReassign?: (targetUserId: string, reason: string) => Promise<void> | void;
  onUnassign?: (reason: string) => Promise<void> | void;
  onAttachmentOpen?: (attachment: { id: string }) => void;
};

const ThreadPanel = MailThreadPanel as unknown as (
  props: RichThreadPanelProps,
) => React.JSX.Element;

function WorkspaceThreadPanel({
  repository,
  initialThreadId,
  user: suppliedUser,
  accessibleMailboxIds = ["mailbox-operations"],
}: {
  repository: ReturnType<typeof createMailMockRepository>;
  initialThreadId: string;
  user?: typeof managerUser;
  accessibleMailboxIds?: readonly string[];
}) {
  const user = useMemo(
    () => suppliedUser ?? ({
      userId: "staff-01",
      tenantId: "tenant-01",
      email: "avery.staff@example.test",
      name: "Avery Staff",
      role: "STAFF" as const,
      permissions: ["mail:read", "mail:thread:claim"],
      isAuthenticated: true,
    }),
    [suppliedUser],
  );
  const workspace = useMailWorkspace({
    user,
    resourceScope: {
      accessibleMailboxIds,
      permissions: user.permissions,
    },
    initialThreadId,
    repository,
  });

  if (workspace.isLoading) return <p>Loading thread</p>;

  if (!workspace.selectedThread) {
    return <MailThreadPanel initialThreadId={initialThreadId} />;
  }

  return (
    <ThreadPanel
      thread={workspace.selectedThread}
      mailbox={operationsMailbox}
      currentUserId={user.userId}
      permissions={workspace.selectedThreadPermissions}
      assignees={[{ userId: "manager-01", name: "Riley Manager" }]}
      error={workspace.error}
      onClaim={() => workspace.claimThread(workspace.selectedThread!.id).then(() => undefined)}
      onPriorityChange={(priority) =>
        workspace.setPriority(workspace.selectedThread!.id, priority).then(() => undefined)
      }
      onResolve={() => workspace.markResolved(workspace.selectedThread!.id).then(() => undefined)}
      onReassign={(targetUserId, reason) =>
        workspace.reassignThread(workspace.selectedThread!.id, targetUserId, reason).then(() => undefined)
      }
      onUnassign={(reason) =>
        workspace.unassignThread(workspace.selectedThread!.id, reason).then(() => undefined)
      }
    />
  );
}

function ComposerWorkspaceThreadPanel({
  repository,
  initialThreadId,
}: {
  repository: ReturnType<typeof createMailMockRepository>;
  initialThreadId: string;
}) {
  const user = useMemo(
    () => ({
      userId: "staff-01",
      tenantId: "tenant-01",
      email: "avery.staff@example.test",
      name: "Avery Staff",
      role: "STAFF" as const,
      permissions: ["mail:read", "mail:draft:create", "mail:send"],
      isAuthenticated: true,
    }),
    [],
  );
  const workspace = useMailWorkspace({
    user,
    resourceScope: {
      accessibleMailboxIds: ["mailbox-operations", "mailbox-support"],
      permissions: user.permissions,
    },
    initialThreadId,
    repository,
  });

  if (workspace.isLoading || !workspace.selectedThread) return <p>Loading thread</p>;

  return (
    <MailThreadPanel
      thread={workspace.selectedThread}
      mailbox={operationsMailbox}
      currentUserId={user.userId}
      permissions={workspace.selectedThreadPermissions}
      composerMailboxes={[operationsMailbox, supportMailbox]}
      canCreateDraft={workspace.selectedThreadPermissions.canCreateDraft}
      canSend={workspace.selectedThreadPermissions.canSend}
      onSaveDraft={(body) => workspace.saveDraft(workspace.selectedThread!.id, body).then(() => undefined)}
      onSendMessage={(message) =>
        workspace.sendMessage(workspace.selectedThread!.id, message).then(() => undefined)
      }
    />
  );
}
