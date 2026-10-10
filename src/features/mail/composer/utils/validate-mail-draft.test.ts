import { describe, expect, it } from "vitest";

import { validateMailDraft } from "./validate-mail-draft";

describe("validateMailDraft", () => {
  it("rejects a blank reply body", () => {
    expect(
      validateMailDraft(
        { senderMailboxId: "mailbox-operations", body: "   ", attachmentIds: [] },
        ["mailbox-operations"],
      ),
    ).toEqual({ valid: false, error: "Write a reply before continuing." });
  });

  it("rejects a sender mailbox outside the accessible scope", () => {
    expect(
      validateMailDraft(
        { senderMailboxId: "mailbox-finance", body: "Confirmed.", attachmentIds: [] },
        ["mailbox-operations"],
      ),
    ).toEqual({ valid: false, error: "Choose an accessible shared mailbox." });
  });

  it("accepts a nonblank draft from an accessible shared mailbox", () => {
    expect(
      validateMailDraft(
        {
          senderMailboxId: "mailbox-operations",
          body: "The booking is confirmed.",
          attachmentIds: ["mock-attachment-1"],
        },
        ["mailbox-operations"],
      ),
    ).toEqual({ valid: true });
  });
});
