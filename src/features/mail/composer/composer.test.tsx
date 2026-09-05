import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { createMailThreadFixture } from "../mock/factories";
import type { MailMailbox } from "../types";
import { ReplyComposer } from "./components/reply-composer";

afterEach(cleanup);

const mailboxes: readonly MailMailbox[] = [
  { id: "mailbox-operations", displayName: "Operations", senderAddress: "operations@example.test" },
  { id: "mailbox-support", displayName: "Customer Support", senderAddress: "support@example.test" },
];

describe("ReplyComposer", () => {
  it("lets a permitted staff member select a shared sender, insert and edit AI wording, then explicitly save and send", async () => {
    const user = userEvent.setup();
    const savedDrafts: string[] = [];
    const sentDrafts: string[] = [];
    render(
      <ReplyComposer
        thread={createMailThreadFixture({
          assigneeId: "staff-01",
          status: "in_progress",
          aiDraftSuggestion: {
            confidence: "high",
            evidenceLabels: ["Validated rate"],
            commercialParameters: { rate: "USD 1,250" },
            proposedWording: "We can offer USD 1,250 for this shipment.",
          },
        })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim={false}
        onSave={async (draft) => {
          savedDrafts.push(`${draft.senderMailboxId}:${draft.body}`);
        }}
        onSend={async (draft) => {
          sentDrafts.push(`${draft.senderMailboxId}:${draft.body}`);
        }}
      />,
    );

    await user.selectOptions(screen.getByLabelText("From shared mailbox"), "mailbox-support");
    await user.click(screen.getByRole("button", { name: "Insert AI suggestion" }));
    const body = screen.getByLabelText("Reply message");
    expect(body).toHaveValue("We can offer USD 1,250 for this shipment.");
    await user.type(body, " Please confirm.");
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(savedDrafts).toEqual([
        "mailbox-support:We can offer USD 1,250 for this shipment. Please confirm.",
      ]),
    );
    expect(sentDrafts).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Send outbound" }));
    await waitFor(() =>
      expect(sentDrafts).toEqual([
        "mailbox-support:We can offer USD 1,250 for this shipment. Please confirm.",
      ]),
    );
  });

  it("never saves or sends when AI wording is inserted", async () => {
    const user = userEvent.setup();
    let saved = false;
    let sent = false;
    render(
      <ReplyComposer
        thread={createMailThreadFixture({
          assigneeId: "staff-01",
          status: "in_progress",
          aiDraftSuggestion: {
            confidence: "medium",
            evidenceLabels: ["Customer request"],
            commercialParameters: {},
            proposedWording: "AI suggestion only.",
          },
        })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim={false}
        onSave={() => {
          saved = true;
        }}
        onSend={() => {
          sent = true;
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Insert AI suggestion" }));

    expect(screen.getByLabelText("Reply message")).toHaveValue("AI suggestion only.");
    expect(saved).toBe(false);
    expect(sent).toBe(false);
  });

  it("includes a visibly added mock attachment in the saved draft", async () => {
    const user = userEvent.setup();
    let savedAttachmentIds: readonly string[] = [];
    render(
      <ReplyComposer
        thread={createMailThreadFixture({ assigneeId: "staff-01", status: "in_progress" })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim={false}
        onSave={(draft) => {
          savedAttachmentIds = draft.attachmentIds;
        }}
        onSend={() => undefined}
      />,
    );

    await user.type(screen.getByLabelText("Reply message"), "Please see the attached document.");
    await user.click(screen.getByRole("button", { name: "Add mock attachment" }));
    expect(screen.getByText("1 mock attachment ready")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(savedAttachmentIds).toEqual(["mock-attachment-1"]));
  });

  it("disables compose controls without direct draft and send permissions", () => {
    render(
      <ReplyComposer
        thread={createMailThreadFixture({ assigneeId: "staff-01", status: "in_progress" })}
        mailboxes={mailboxes}
        canCreateDraft={false}
        canSend={false}
        canClaim={false}
        onSave={() => undefined}
        onSend={() => undefined}
      />,
    );

    expect(screen.getByLabelText("From shared mailbox")).toBeDisabled();
    expect(screen.getByLabelText("Reply message")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send outbound" })).toBeDisabled();
    expect(screen.getByText("You do not have permission to compose replies for this thread.")).toBeVisible();
  });

  it("requires an explicit claim before it enables an unassigned reply", async () => {
    const user = userEvent.setup();
    let claimed = false;
    const { rerender } = render(
      <ReplyComposer
        thread={createMailThreadFixture({ assigneeId: null, status: "unassigned" })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim
        onClaim={() => {
          claimed = true;
        }}
        onSave={() => undefined}
        onSend={() => undefined}
      />,
    );

    expect(screen.getByLabelText("Reply message")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Take thread to reply" }));
    expect(claimed).toBe(true);

    rerender(
      <ReplyComposer
        thread={createMailThreadFixture({ assigneeId: "staff-01", status: "in_progress" })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim={false}
        onSave={() => undefined}
        onSend={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Reply message")).toBeEnabled();
  });

  it("disables the explicit claim action while a deferred claim is pending", async () => {
    const user = userEvent.setup();
    let completeClaim: (() => void) | undefined;
    let claimAttempts = 0;
    render(
      <ReplyComposer
        thread={createMailThreadFixture({ assigneeId: null, status: "unassigned" })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim
        onClaim={() => {
          claimAttempts += 1;
          return new Promise<void>((resolve) => {
            completeClaim = resolve;
          });
        }}
        onSave={() => undefined}
        onSend={() => undefined}
      />,
    );

    const claim = screen.getByRole("button", { name: "Take thread to reply" });
    await user.click(claim);
    expect(claim).toBeDisabled();
    expect(claimAttempts).toBe(1);
    await user.click(claim);
    expect(claimAttempts).toBe(1);

    completeClaim?.();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Thread claimed. You can now compose a reply.",
    );
    expect(claim).toBeEnabled();
  });

  it("shows deferred draft saving state and preserves an editable reply after a save rejection", async () => {
    const user = userEvent.setup();
    let completeSave: (() => void) | undefined;
    let saveAttempts = 0;
    render(
      <ReplyComposer
        thread={createMailThreadFixture({ assigneeId: "staff-01", status: "in_progress" })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim={false}
        onSave={() => {
          saveAttempts += 1;
          if (saveAttempts === 1) {
            return new Promise<void>((resolve) => {
              completeSave = resolve;
            });
          }
          return Promise.reject(new Error("Draft service unavailable"));
        }}
        onSend={() => undefined}
      />,
    );

    const body = screen.getByLabelText("Reply message");
    await user.type(body, "Keep this customer-ready reply.");
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(screen.getByRole("button", { name: "Saving draft…" })).toBeDisabled();
    expect(body).toBeDisabled();
    expect(screen.getByLabelText("From shared mailbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add mock attachment" })).toBeDisabled();

    completeSave?.();
    expect(await screen.findByRole("status")).toHaveTextContent("Draft saved.");
    expect(body).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save your draft. Please try again.",
    );
    expect(body).toHaveValue("Keep this customer-ready reply.");
    expect(screen.getByRole("button", { name: "Save draft" })).toBeEnabled();
  });

  it("keeps the entered reply available after deterministic delivery failure", async () => {
    const user = userEvent.setup();
    render(
      <ReplyComposer
        thread={createMailThreadFixture({ assigneeId: "staff-01", status: "in_progress" })}
        mailboxes={mailboxes}
        canCreateDraft
        canSend
        canClaim={false}
        onSave={() => undefined}
        onSend={() => Promise.reject({ status: 502, code: "OUTBOUND_DELIVERY_FAILED" })}
      />,
    );

    await user.type(screen.getByLabelText("Reply message"), "Please retry this reply.");
    await user.click(screen.getByRole("button", { name: "Send outbound" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Delivery failed. Your draft is still available to retry.",
    );
    expect(screen.getByLabelText("Reply message")).toHaveValue("Please retry this reply.");
  });
});
