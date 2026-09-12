import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { assistantService, type AssistantQueryResponse } from "@/api/services/assistant.service";
import { ApiError } from "@/lib/api-error";

import { AiAssistantPage } from "./index";

vi.mock("@/api/services/assistant.service", async () => {
  const actual = await vi.importActual<typeof import("@/api/services/assistant.service")>(
    "@/api/services/assistant.service",
  );
  return { ...actual, assistantService: { query: vi.fn() } };
});

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("AiAssistantPage", () => {
  afterEach(cleanup);

  it("renders the canonical composer and submits a grounded question", async () => {
    const mockResponse: AssistantQueryResponse = {
      query: "What is cold chain SOP?",
      answer: "Pharma cold chain requires 2 to 8 C storage.",
      regulatoryCitations: [],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: false,
      missingInformation: [],
      governance: {
        decisionId: "decision-1",
        automationLevel: "ASSISTED",
        requiresApproval: false,
        capabilityCode: "assistant.query",
        totalTokens: 12,
      },
      retrievalTraceId: "trace-1",
      context: {
        shipmentId: "shipment-1",
        evaluationId: "evaluation-1",
        freshness: "STALE",
        snapshotHash: "snapshot-1",
      },
    };
    vi.mocked(assistantService.query).mockResolvedValueOnce(mockResponse);

    renderWithClient(<AiAssistantPage />);

    expect(screen.getByRole("heading", { name: "AI Assistant", level: 1 })).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Ask a grounded compliance question");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "What is cold chain SOP?" } });
    fireEvent.change(screen.getByLabelText("Assistant mode"), {
      target: { value: "REGULATORY" },
    });
    fireEvent.change(screen.getByLabelText("Assistant jurisdiction"), {
      target: { value: "US" },
    });
    fireEvent.change(screen.getByLabelText("Verified shipment ID"), {
      target: { value: "shipment-1" },
    });
    fireEvent.change(screen.getByLabelText("Verified evaluation ID"), {
      target: { value: "evaluation-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask assistant" }));

    await waitFor(() =>
      expect(assistantService.query).toHaveBeenCalledWith({
        query: "What is cold chain SOP?",
        mode: "REGULATORY",
        jurisdictionCode: "US",
        context: {
          shipmentId: "shipment-1",
          evaluationId: "evaluation-1",
        },
        topK: 5,
        minimumScore: 0.6,
      }),
    );
    expect(
      await screen.findByText("Pharma cold chain requires 2 to 8 C storage."),
    ).toBeInTheDocument();
  });

  it("presents provider unavailability separately from insufficient evidence", async () => {
    vi.mocked(assistantService.query).mockRejectedValueOnce(
      new ApiError({
        code: "AI_SERVICE_UNAVAILABLE",
        message: "Assistant provider unavailable.",
        status: 503,
      }),
    );
    renderWithClient(<AiAssistantPage />);

    fireEvent.change(screen.getByLabelText("AI assistant question"), {
      target: { value: "What is the compliance risk?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask assistant" }));

    expect(await screen.findByText(/assistant provider is unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/insufficient evidence/i)).not.toBeInTheDocument();
  });
});
