import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { authService } from "@/api/services/auth.service";
import { LoginPage } from "./index";
import { ApiError } from "@/lib/api-error";

vi.mock("next/navigation", () => ({ useRouter: () => ({}), useSearchParams: () => new URLSearchParams() }));
vi.mock("@/api/services/auth.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/services/auth.service")>();
  return {
    ...actual,
    authService: { identify: vi.fn(), login: vi.fn(), completeInvitation: vi.fn() },
  };
});
vi.mock("./components/login-frame", () => ({ LoginFrame: ({ children }: { children: ReactNode }) => <main>{children}</main> }));

async function identify() {
  vi.mocked(authService.identify).mockResolvedValue({ exists: true, tenantCode: "ACME", userType: "STAFF" });
  fireEvent.change(screen.getByLabelText("Work Email"), { target: { value: "staff@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await screen.findByLabelText("Password");
}

describe("Login presentation preserves authentication", () => {
  afterEach(cleanup);
  beforeEach(() => vi.resetAllMocks());
  it("disables empty submissions and identifies using the entered email", async () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    await identify();
    expect(authService.identify).toHaveBeenCalledWith("staff@example.com");
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDisabled();
  });
  it("preserves tenant payload, password visibility and invalid-credential feedback", async () => {
    vi.mocked(authService.login).mockRejectedValue(new ApiError({ message: "Unauthorized", status: 401 }));
    render(<LoginPage />);
    await identify();
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect password");
    expect(authService.login).toHaveBeenCalledWith({ email: "staff@example.com", password: "wrong-password", tenantCode: "ACME" });
  });
  it("retains invitation challenge, validation and completion payload", async () => {
    vi.mocked(authService.login).mockRejectedValue(new ApiError({ message: "Complete invitation", status: 409, details: { requiresInvitationCompletion: true, session: "challenge" } }));
    vi.mocked(authService.completeInvitation).mockRejectedValue(new Error("Server unavailable"));
    render(<LoginPage />);
    await identify();
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "temporary" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    await screen.findByLabelText("New Password");
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "permanent-password" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: "Set Password & Sign In" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match");
    expect(authService.completeInvitation).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "permanent-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Set Password & Sign In" }));
    await waitFor(() => expect(authService.completeInvitation).toHaveBeenCalledWith({ email: "staff@example.com", newPassword: "permanent-password", confirmationCode: "challenge" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Server unavailable");
  });
});
