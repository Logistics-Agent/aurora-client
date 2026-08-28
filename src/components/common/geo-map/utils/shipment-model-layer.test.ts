import { describe, expect, it, vi } from "vitest";
import { canRenderShipmentModel } from "./shipment-model-layer";

describe("canRenderShipmentModel", () => {
  it("requires WebGL2 for the Three.js shipment model", () => {
    const canvas = {
      getContext: vi.fn((contextId: string) =>
        contextId === "webgl2"
          ? ({ contextId } as unknown as WebGL2RenderingContext)
          : null,
      ),
    } as unknown as HTMLCanvasElement;

    expect(canRenderShipmentModel(canvas)).toBe(true);
    expect(canvas.getContext).toHaveBeenCalledWith("webgl2");
  });

  it("keeps the vector map running when only WebGL1 is available", () => {
    const canvas = {
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;

    expect(canRenderShipmentModel(canvas)).toBe(false);
  });

  it("handles a rejected WebGL2 context without crashing the map", () => {
    const canvas = {
      getContext: vi.fn(() => {
        throw new Error("GPU context rejected");
      }),
    } as unknown as HTMLCanvasElement;

    expect(canRenderShipmentModel(canvas)).toBe(false);
  });
});
