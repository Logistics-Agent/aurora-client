import { beforeEach, describe, expect, it, vi } from "vitest";

type FakeAxiosInstance = {
  defaults: { headers: { common: Record<string, string> } };
  interceptors: {
    request: { use: ReturnType<typeof vi.fn> };
    response: { use: ReturnType<typeof vi.fn> };
  };
  request: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

const instances: FakeAxiosInstance[] = [];

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  const create = vi.fn(() => {
    const instance: FakeAxiosInstance = {
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      request: vi.fn(),
      post: vi.fn(),
    };
    instances.push(instance);
    return instance;
  });

  return {
    ...actual,
    default: { ...actual.default, create },
    create,
  };
});

describe("HttpClient cookie session refresh", () => {
  beforeEach(() => {
    instances.length = 0;
    vi.clearAllMocks();
  });

  it("refreshes the HttpOnly cookie session after a 401 without an in-memory token", async () => {
    const { HttpClient } = await import("@/lib/api");
    const client = new HttpClient("https://api.example.test");
    void client;
    const apiInstance = instances[0];
    const refreshInstance = instances[1];
    const responseReject = apiInstance.interceptors.response.use.mock.calls[0][1] as (
      error: unknown,
    ) => Promise<unknown>;
    const requestConfig = {
      _retry: false,
      headers: {},
      method: "GET",
      url: "api/v1/assistant/query",
    };

    refreshInstance.post.mockResolvedValue({ data: { expiresIn: 3600 } });
    apiInstance.request.mockResolvedValue({ data: { answer: "ok" } });

    const retried = await responseReject({
      config: requestConfig,
      response: { status: 401 },
    });

    expect(refreshInstance.post).toHaveBeenCalledWith("api/v1/auth/refresh");
    expect(apiInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        _retry: true,
        url: "api/v1/assistant/query",
      }),
    );
    expect(retried).toEqual({ data: { answer: "ok" } });
  });
});
