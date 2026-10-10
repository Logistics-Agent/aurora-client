import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MailboxIdentity } from "./mailbox-identity";

describe("MailboxIdentity", () => {
  afterEach(cleanup);

  it("presents a labelled default active mailbox", () => {
    render(
      <MailboxIdentity
        address="support@aurora.test"
        label="Customer Support"
        isDefault
        status="active"
      />,
    );

    expect(
      screen.getByRole("group", { name: "Customer Support mailbox" }),
    ).toBeInTheDocument();
    expect(screen.getByText("support@aurora.test")).toBeInTheDocument();
    expect(screen.getByText("Customer Support")).toBeInTheDocument();
    expect(screen.getByText("DEFAULT")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("omits optional mailbox details when they are absent", () => {
    render(<MailboxIdentity address="ops@aurora.test" />);

    expect(
      screen.getByRole("group", { name: "ops@aurora.test mailbox" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("DEFAULT")).not.toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
    expect(screen.queryByText("Suspended")).not.toBeInTheDocument();
  });

  it("uses the address as the group name when the label is empty", () => {
    render(<MailboxIdentity address="ops@aurora.test" label="" />);

    expect(
      screen.getByRole("group", { name: "ops@aurora.test mailbox" }),
    ).toBeInTheDocument();
  });
});
