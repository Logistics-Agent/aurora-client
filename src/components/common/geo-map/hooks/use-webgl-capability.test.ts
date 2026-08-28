import { describe, expect, it, vi } from "vitest";
import { detectWebglCapability } from "./use-webgl-capability";

describe("detectWebglCapability", () => {
  it("accepts legacy WebGL when WebGL2 is unavailable", () => {
    const canvas = {
      getContext: vi.fn((contextId: string) =>
        contextId === "webgl" ? {} : null,
      ),
    } as unknown as HTMLCanvasElement;

    expect(detectWebglCapability(canvas)).toBe(true);
    expect(canvas.getContext).toHaveBeenCalledWith("webgl2");
    expect(canvas.getContext).toHaveBeenCalledWith("webgl");
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
