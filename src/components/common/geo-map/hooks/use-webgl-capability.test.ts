import { describe, expect, it, vi } from "vitest";
import { detectWebglCapability } from "./use-webgl-capability";

describe("detectWebglCapability", () => {
  it("rejects legacy WebGL because MapLibre v6 requires WebGL2", () => {
    const canvas = {
      getContext: vi.fn((contextId: string) =>
        contextId === "webgl" ? {} : null,
      ),
    } as unknown as HTMLCanvasElement;

    expect(detectWebglCapability(canvas)).toBe(false);
    expect(canvas.getContext).toHaveBeenCalledWith("webgl2");
    expect(canvas.getContext).not.toHaveBeenCalledWith("webgl");
  });

  it("accepts a working WebGL2 context", () => {
    const canvas = {
      getContext: vi.fn(() => ({})),
    } as unknown as HTMLCanvasElement;

    expect(detectWebglCapability(canvas)).toBe(true);
  });

  it("treats context creation errors as unsupported", () => {
    const canvas = {
      getContext: vi.fn(() => {
        throw new Error("GPU process unavailable");
      }),
    } as unknown as HTMLCanvasElement;

    expect(detectWebglCapability(canvas)).toBe(false);
  });
});
