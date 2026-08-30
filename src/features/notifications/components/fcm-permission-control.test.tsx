import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FcmPermissionControl } from "./fcm-permission-control";

const mockEnable = vi.fn();
const mockDisable = vi.fn();
let mockState: "idle" | "enabled" | "denied" | "error" = "idle";

vi.mock("../hooks/use-fcm-notification", () => ({
  useFcmNotification: () => ({
    state: mockState,
    errorMessage:
      mockState === "error" ? "Unable to enable browser notifications." : null,
    enable: mockEnable,
    disable: mockDisable,
    deviceId: null,
    refreshToken: vi.fn(),
  }),
}));

describe("FcmPermissionControl", () => {
  it("enables browser notifications from an explicit user action", async () => {
    const user = userEvent.setup();
    render(<FcmPermissionControl />);

    await user.click(
      screen.getByRole("button", { name: /enable browser notifications/i }),
    );

    expect(mockEnable).toHaveBeenCalledTimes(1);
  });

  it("shows enabled state and supports explicit disable", async () => {
    mockState = "enabled";
    const user = userEvent.setup();
    render(<FcmPermissionControl />);

    expect(
      screen.getByText(/notifications enabled/i),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /disable browser notifications/i }),
    );
    expect(mockDisable).toHaveBeenCalledTimes(1);
    mockState = "idle";
  });

  it("shows a safe error without exposing provider details", () => {
    mockState = "error";
    render(<FcmPermissionControl />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to enable browser notifications.",
    );
    expect(screen.queryByText(/token|private|firebase/i)).not.toBeInTheDocument();
    mockState = "idle";
  });
});
