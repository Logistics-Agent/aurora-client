import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Page from "./page";

vi.mock("@/features/mail", () => ({
  MailQuarantinePage: () => <div>Mail quarantine page</div>,
}));

describe("Mail quarantine route adapter", () => {
  it("renders the quarantine workflow", () => {
    render(<Page />);

    expect(screen.getByText("Mail quarantine page")).toBeInTheDocument();
  });
});
