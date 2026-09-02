import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShipmentNotificationSubscription } from "./shipment-notification-subscription";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock("@/hooks/mutations/notifications/use-notification-mutations", () => ({
  useNotificationMutations: () => ({
    subscribeShipment: {
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    },
  }),
}));

describe("ShipmentNotificationSubscription", () => {
  afterEach(() => {
    cleanup();
    mocks.mutateAsync.mockReset();
  });

  it("subscribes the current user to shipment notifications", async () => {
    mocks.mutateAsync.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();

    render(
      <ShipmentNotificationSubscription shipmentId="shipment-123" />,
    );

    await user.click(
      screen.getByRole("button", { name: "Follow shipment notifications" }),
    );

    expect(mocks.mutateAsync).toHaveBeenCalledWith("shipment-123");
    expect(
      await screen.findByText("Following shipment notifications"),
    ).toBeInTheDocument();
  });

  it("exposes the action before Auth integration is available", () => {
    render(
      <ShipmentNotificationSubscription shipmentId="shipment-123" />,
    );

    expect(screen.getByRole("button", { name: /follow shipment notifications/i }))
      .toBeInTheDocument();
  });

  it("shows a safe error when subscription fails", async () => {
    mocks.mutateAsync.mockRejectedValueOnce(new Error("provider secret"));
    const user = userEvent.setup();

    render(
      <ShipmentNotificationSubscription shipmentId="shipment-123" />,
    );

    await user.click(
      screen.getByRole("button", { name: "Follow shipment notifications" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to subscribe to shipment notifications.",
    );
    expect(screen.queryByText("provider secret")).not.toBeInTheDocument();
  });
});
