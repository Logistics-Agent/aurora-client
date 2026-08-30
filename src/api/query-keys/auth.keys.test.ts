import { describe, expect, it } from "vitest";
import { authKeys } from "./auth.keys";

describe("authKeys", () => {
  it("builds current-user keys from the auth all key", () => {
    expect(authKeys.all).toEqual(["logistics-control-tower", "auth"]);
    expect(authKeys.currentUser()).toEqual([
      ...authKeys.all,
      "current-user",
    ]);
  });
});
