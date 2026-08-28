import { describe, expect, it } from "vitest";
import { authenticateMock } from "@/features/auth/mock";
import { nextRealtimeState } from "@/features/route-tracking/utils/fixture-state";
import { documentMocks, approveDocument } from "@/features/documents/mock";
import {
  complianceFindingMocks,
  resolveFinding,
} from "@/features/compliance/mock";
import {
  notificationMocks,
  markNotificationRead,
} from "@/features/notifications/mock";

describe("feature mock transitions", () => {
  it("accepts only the documented local credentials", () => {
    expect(authenticateMock("ops@acmelogistics.com", "password")).toBe(
      "success",
    );
    expect(authenticateMock("wrong@example.com", "password")).toBe("error");
  });

  it("cycles honest realtime states without pretending stale is live", () => {
    expect(nextRealtimeState("live")).toBe("stale");
    expect(nextRealtimeState("stale")).toBe("offline");
    expect(nextRealtimeState("offline")).toBe("disconnected");
    expect(nextRealtimeState("disconnected")).toBe("reconnecting");
    expect(nextRealtimeState("reconnecting")).toBe("live");
  });

  it("transitions review mocks to approved/resolved states", () => {
    expect(approveDocument(documentMocks[1]).state).toBe("Verified");
    expect(resolveFinding(complianceFindingMocks[0]).state).toBe("Resolved");
    expect(markNotificationRead(notificationMocks[0]).read).toBe(true);
  });
});
