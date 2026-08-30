import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MapPointerCoordinates } from "./map-pointer-coordinates";

describe("MapPointerCoordinates", () => {
  afterEach(cleanup);

  it("shows readable and exact coordinates for the current pointer", () => {
    render(
      <MapPointerCoordinates
        coordinates={{ latitude: 10.77, longitude: 106.7 }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("10° 46.20' N");
    expect(screen.getByRole("status")).toHaveTextContent("106° 42.00' E");
    expect(screen.getByRole("status")).toHaveTextContent("(10.770000, 106.700000)");
    expect(screen.getByRole("status")).toHaveClass(
      "bottom-7",
      "right-14",
      "min-w-40",
      "text-xs",
    );
  });

  it("stays hidden before the pointer enters the map", () => {
    render(<MapPointerCoordinates coordinates={null} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
