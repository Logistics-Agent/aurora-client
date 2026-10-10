import { describe, expect, it } from "vitest";

import { documentsKeys } from "./documents.keys";

describe("document query keys", () => {
  it("exposes one document root and stable list/detail keys", () => {
    expect(documentsKeys.all).toEqual(["logistics-control-tower", "documents"]);
    expect(documentsKeys.list({ page: 1, pageSize: 20 })).toEqual([
      "logistics-control-tower",
      "documents",
      "list",
      { page: 1, pageSize: 20 },
    ]);
    expect(documentsKeys.detail("job-123")).toEqual([
      "logistics-control-tower",
      "documents",
      "detail",
      "job-123",
    ]);
  });
});
