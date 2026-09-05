import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/mail", () => ({
  MailPage: ({ initialThreadId }: { initialThreadId?: string }) => (
    <output data-testid="mail-page" data-thread-id={initialThreadId ?? ""} />
  ),
}));

const projectRoot = process.cwd();

afterEach(cleanup);

async function loadRoute(routeFile: string, modulePath: string) {
  expect(existsSync(resolve(projectRoot, routeFile))).toBe(true);

  return import(modulePath);
}

describe("Mail route adapters", () => {
  it("renders the canonical Mail workspace route", async () => {
    const route = await loadRoute(
      "src/app/(staff)/mail/page.tsx",
      "./page",
    );

    render(route.default());

    expect(screen.getByTestId("mail-page")).toHaveAttribute(
      "data-thread-id",
      "",
    );
  });

  it("awaits the canonical thread parameter before opening Mail", async () => {
    const route = await loadRoute(
      "src/app/(staff)/mail/[threadId]/page.tsx",
      "./[threadId]/page",
    );

    render(
      await route.default({
        params: Promise.resolve({ threadId: "thread-success-01" }),
      }),
    );

    expect(screen.getByTestId("mail-page")).toHaveAttribute(
      "data-thread-id",
      "thread-success-01",
    );
  });
});
