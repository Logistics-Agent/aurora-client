import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useLiveMapStore } from "./stores/use-live-map-store";
import { LiveMapPage } from "./index";

describe("LiveMapPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    useLiveMapStore.setState({
      selectedShipmentId: "",
      selectedMarkerId: "",
      realtimeState: "live",
      mapAvailability: "available",
    });
  });

  it("opens one selected shipment popup from the shipment card", () => {
    render(<LiveMapPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Select shipment SHP-129" }),
    );

    expect(
      screen.queryByRole("complementary", {
        name: /selected shipment details/i,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("SHP-129 · Delayed")).toBeInTheDocument();
    expect(screen.getByText("SHP-2026-00129")).toBeInTheDocument();
    expect(screen.getByText("VietLink")).toBeInTheDocument();
    expect(screen.getByText("Road")).toBeInTheDocument();
    expect(screen.getByText("SEA")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("filters the fixture queue without rendering debug controls", () => {
    render(<LiveMapPage />);

    expect(screen.queryByText(/simulated current/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /cycle signal/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Risk" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "High" }));
    expect(
      screen.getByRole("button", { name: "Select shipment SHP-129" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select shipment SHP-128" }),
    ).not.toBeInTheDocument();
  });

  it("opens the complete shipment queue from one mobile menu trigger", () => {
    render(<LiveMapPage />);

    const queueTrigger = screen.getByRole("button", {
      name: "Open shipment queue",
    });

    expect(screen.queryByRole("dialog", { name: /shipment queue/i })).not.toBeInTheDocument();
    fireEvent.click(queueTrigger);

    const dialog = screen.getByRole("dialog", { name: /shipment queue/i });
    expect(within(dialog).getByText("Active shipments")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Select shipment SHP-128" }),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Status" }));
    expect(
      screen.getByRole("checkbox", { name: "In transit" }),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Mode" }));
    expect(screen.getByRole("checkbox", { name: "Ocean" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Ocean" }));
    expect(within(dialog).getByRole("button", { name: "Mode: Ocean" })).toHaveTextContent("Ocean");
  });

  it("preserves shipment controls while the map is loading", () => {
    useLiveMapStore.setState({ mapAvailability: "loading" });
    render(<LiveMapPage />);

    expect(screen.getByText("Loading map context")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", {
        name: /search shipment, customer, hub or document/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", {
        name: /selected shipment details/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders the map as a full-screen workspace with a top search", () => {
    render(<LiveMapPage />);

    expect(screen.getByLabelText("Interactive shipment GPS map")).toHaveClass(
      "!h-full",
    );
    expect(
      screen.getByRole("textbox", {
        name: /search shipment, customer, hub or document/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Live Operations Map")).not.toBeInTheDocument();
  });

  it("does not let the empty toolbar area block map dragging", () => {
    render(<LiveMapPage />);

    const shipmentPanel = screen
      .getByText("Active shipments")
      .closest("section");
    const toolbar = shipmentPanel?.parentElement;

    expect(toolbar).toHaveClass("pointer-events-none");
    expect(shipmentPanel).toHaveClass("pointer-events-auto");
    expect(toolbar?.querySelector(".pointer-events-auto")).not.toBeNull();
  });

  it("keeps a long shipment queue inside a scrollable map panel", () => {
    render(<LiveMapPage />);

    const shipmentPanel = screen
      .getByText("Active shipments")
      .closest("section");
    const header = screen.getByText("Active shipments").parentElement;
    const shipmentList = screen
      .getByRole("button", { name: "Select shipment SHP-128" })
      .parentElement;

    expect(shipmentPanel).toHaveClass(
      "flex",
      "max-h-[min(32rem,100%)]",
      "min-h-0",
      "flex-col",
      "overflow-hidden",
      "max-w-[20rem]",
    );
    expect(header).toHaveClass("shrink-0");
    expect(header?.querySelector(".flex-wrap")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Status" })).toHaveTextContent(
      "Status",
    );
    expect(shipmentList).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(shipmentPanel?.parentElement).toHaveClass("bottom-4", "min-h-0");
  });

  it("does not render the redundant realtime banner below the full-screen map", () => {
    render(<LiveMapPage />);

    expect(
      screen.queryByText(/simulated gps snapshot · updated 18 sec ago/i),
    ).not.toBeInTheDocument();
  });

  it("withholds current movement when the fleet signal is stale or offline", () => {
    useLiveMapStore.setState({ realtimeState: "stale" });
    const { rerender } = render(<LiveMapPage />);

    expect(screen.queryByText(/54 km\/h/)).not.toBeInTheDocument();
    expect(
      screen.getAllByText(/last update 18 mins ago/i).length,
    ).toBeGreaterThanOrEqual(1);

    useLiveMapStore.setState({ realtimeState: "offline" });
    rerender(<LiveMapPage />);
    expect(screen.queryByText(/54 km\/h/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/gps unavailable/i).length).toBeGreaterThan(0);
  });

  it("applies filters to markers and closes a filtered-out drawer", () => {
    render(<LiveMapPage />);

    expect(
      screen.getByRole("button", { name: /shp-128.*in transit/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", {
        name: /selected shipment details/i,
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Risk" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "High" }));

    expect(
      screen.queryByRole("button", { name: /shp-128.*in transit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", {
        name: /selected shipment details/i,
      }),
    ).not.toBeInTheDocument();
  });
});
