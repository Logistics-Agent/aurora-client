import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("merges conditional and conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4", false && "hidden", "text-sm")).toBe(
      "px-4 text-sm",
    );
  });
});
