import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UserProfile } from "@/types/auth.types";
import { createMailMockRepository } from "./mock/mail-repository";
import { createMailThreadFixture } from "./mock/factories";
import { mailPersonaFixtures, mailThreadFixtures } from "./mock/fixtures";
import type { MailResourceScope } from "./types";
import { MailWorkspace } from "./components/mail-workspace";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/mail");
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
});

beforeEach(() => setViewport(1440));

function profile(index: number): UserProfile {
  const fixture = mailPersonaFixtures[index];
  return {
    userId: fixture.userId,
    tenantId: "tenant-01",
    name: fixture.name,
    email: fixture.email,
    role: fixture.role,
    permissions: [...fixture.permissions],
    isAuthenticated: true,
  };
}

function scope(index: number): MailResourceScope {
  return mailPersonaFixtures[index].resourceScope;
}

function setViewport(width: number): void {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
}

describe("MailWorkspace", () => {
  it("clearly discloses that the workspace is using non-production mock mail data", async () => {
    render(
      <MailWorkspace
        user={profile(0)}
        resourceScope={scope(0)}
        repository={createMailMockRepository(mailThreadFixtures)}
      />,
    );

    const disclosure = await screen.findByRole("status", { name: "Mail data source" });
    expect(disclosure).toBeVisible();
    expect(disclosure).toHaveTextContent("UI-only demo");
    expect(disclosure).toHaveTextContent("not connected to live mail");
  });

  it("composes scoped Staff mail into desktop queue, list, and conversation landmarks", async () => {
    const thread = mailThreadFixtures[0];
    render(
      <MailWorkspace
        user={profile(0)}
        resourceScope={scope(0)}
        initialThreadId={thread.id}
        repository={createMailMockRepository(mailThreadFixtures)}
      />,
    );

    expect(await screen.findByRole("heading", { name: thread.subject })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Mail queues" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Mail inbox" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Mail thread" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: /All Threads/ })).not.toBeInTheDocument();
  });

  it("keeps restricted managers on the same workspace while gating supervisory queues and actions", async () => {
    const thread = mailThreadFixtures[0];
    render(
      <MailWorkspace
        user={profile(1)}
        resourceScope={scope(1)}
        initialThreadId={thread.id}
        repository={createMailMockRepository(mailThreadFixtures)}
      />,
    );

    expect(await screen.findByRole("heading", { name: thread.subject })).toBeVisible();
    expect(screen.queryByRole("tab", { name: /All Threads/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reassign thread" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Release to unassigned" })).not.toBeInTheDocument();
  });

  it("exposes fully capable manager supervision from direct permissions", async () => {
    render(
      <MailWorkspace
        user={profile(2)}
        resourceScope={scope(2)}
        initialThreadId="thread-forbidden-03"
        repository={createMailMockRepository(mailThreadFixtures)}
      />,
    );

    expect(await screen.findByRole("tab", { name: /All Threads/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Reassign thread" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Release to unassigned" })).toBeVisible();
  });

  it("does not leak a direct thread ID outside the mailbox resource scope", async () => {
    const privateThread = createMailThreadFixture({
      id: "thread-private-direct",
      mailboxId: "mailbox-finance",
      subject: "Finance-only thread must stay hidden",
    });
    render(
      <MailWorkspace
        user={profile(0)}
        resourceScope={scope(0)}
        initialThreadId={privateThread.id}
        repository={createMailMockRepository([privateThread])}
      />,
    );

    expect(await screen.findByText("No conversation selected")).toBeVisible();
    expect(screen.queryByText(privateThread.subject)).not.toBeInTheDocument();
    expect(screen.queryByText(privateThread.messages[0].bodyText)).not.toBeInTheDocument();
  });

  it("renders access states without reading records for stale unauthenticated or forbidden profiles", async () => {
    const baseRepository = createMailMockRepository(mailThreadFixtures);
    const listThreads = vi.fn(baseRepository.listThreads);
    const repository = { ...baseRepository, listThreads };
    render(
      <MailWorkspace
        user={{ ...profile(0), isAuthenticated: false }}
        resourceScope={scope(0)}
        repository={repository}
      />,
    );
    expect(screen.getByText("Sign in to access Mail")).toBeVisible();
    expect(listThreads).not.toHaveBeenCalled();

    cleanup();
    render(
      <MailWorkspace
        user={{ ...profile(0), permissions: [], isAuthenticated: true }}
        resourceScope={scope(0)}
        repository={repository}
      />,
    );
    expect(screen.getByText("Mail access denied")).toBeVisible();
    expect(screen.queryByText(mailThreadFixtures[0].subject)).not.toBeInTheDocument();
    expect(listThreads).not.toHaveBeenCalled();
  });

  it.each([1024, 1100, 1279])("uses an explicit two-pane list/detail layout at %i pixels", async (width) => {
    setViewport(width);
    render(
      <MailWorkspace
        user={profile(0)}
        resourceScope={scope(0)}
        initialThreadId={mailThreadFixtures[0].id}
        repository={createMailMockRepository(mailThreadFixtures)}
      />,
    );

    const workspace = await screen.findByTestId("mail-workspace-layout");
    expect(workspace).toHaveAttribute("data-mail-viewport", "mid");
    expect(workspace).toHaveAttribute("data-mail-layout", "two-pane");
    expect(workspace.className).toContain("grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]");
    expect(screen.getByRole("region", { name: "Mail inbox" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Mail thread" })).toBeVisible();
    expect(screen.queryByRole("navigation", { name: "Mail queues" })).not.toBeInTheDocument();
  });

  it("uses single-pane mobile navigation with explicit back behavior", async () => {
    setViewport(800);
    const user = userEvent.setup();
    render(
      <MailWorkspace
        user={profile(0)}
        resourceScope={scope(0)}
        repository={createMailMockRepository(mailThreadFixtures)}
      />,
    );

    expect(await screen.findByRole("region", { name: "Mail inbox" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Mail thread" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open mail queues" }));
    expect(screen.getByRole("navigation", { name: "Mail queues" })).toBeVisible();
    expect(screen.queryByRole("list", { name: "Mail threads" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to threads" }));
    expect(screen.getByRole("list", { name: "Mail threads" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Select Booking confirmation" }));
    expect(await screen.findByRole("region", { name: "Mail thread" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Back to threads" }));
    expect(screen.getByRole("region", { name: "Mail inbox" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Mail thread" })).not.toBeInTheDocument();
    expect(window.location.pathname).toBe("/mail");
  });

  it("pushes thread routes and follows popstate back to an empty selection", async () => {
    const user = userEvent.setup();
    render(
      <MailWorkspace
        user={profile(0)}
        resourceScope={scope(0)}
        repository={createMailMockRepository(mailThreadFixtures)}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Select Booking confirmation" }));
    expect(window.location.pathname).toBe("/mail/thread-success-01");
    window.history.replaceState({}, "", "/mail");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(await screen.findByText("No conversation selected")).toBeVisible();
  });

  it("wires an explicit claim through the repository and announces the mutation", async () => {
    const user = userEvent.setup();
    const thread = createMailThreadFixture({ id: "thread-claim-workspace", assigneeId: null });
    const repository = createMailMockRepository([thread]);
    render(
      <MailWorkspace
        user={profile(0)}
        resourceScope={scope(0)}
        initialThreadId={thread.id}
        repository={repository}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Take thread" }));
    await waitFor(async () =>
      expect(await repository.getThread(thread.id)).toMatchObject({ assigneeId: "staff-01" }),
    );
    expect(screen.getByText("Thread claimed.")).toBeVisible();
  });
});
