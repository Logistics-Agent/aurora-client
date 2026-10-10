import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { documentsService } from "@/api/services/documents.service";

import { useDocumentsQuery } from "./use-documents-query";

afterEach(() => vi.restoreAllMocks());

describe("useDocumentsQuery", () => {
  it("owns document list server state and uses normalized query params", async () => {
    vi.spyOn(documentsService, "listDocuments").mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useDocumentsQuery(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(documentsService.listDocuments).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
    expect(result.current.data?.items).toEqual([]);
  });
});
