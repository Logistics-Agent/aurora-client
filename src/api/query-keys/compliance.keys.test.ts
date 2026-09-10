import { describe, expect, it } from "vitest";

import { complianceKeys } from "./compliance.keys";

describe("compliance query keys", () => {
  it("keeps evaluation data under one invalidation root", () => {
    expect(complianceKeys.all).toEqual(["logistics-control-tower", "compliance"]);
    expect(complianceKeys.evaluation("evaluation-1")).toEqual([
      "logistics-control-tower",
      "compliance",
      "evaluation",
      "evaluation-1",
    ]);
  });
});
