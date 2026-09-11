import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { assistantService, type AssistantQueryResponse } from "@/api/services/assistant.service";

import { AiAssistantPage } from "./index";

vi.mock("@/api/services/assistant.service", () => ({
  assistantService: {
    query: vi.fn(),
  },
}));

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
    };
    vi.mocked(assistantService.query).mockResolvedValueOnce(mockResponse);

    renderWithClient(<AiAssistantPage />);

    expect(screen.getByRole("heading", { name: "AI Assistant", level: 1 })).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Ask a grounded compliance question");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "What is cold chain SOP?" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask assistant" }));

    await waitFor(() =>
      expect(assistantService.query).toHaveBeenCalledWith({
        query: "What is cold chain SOP?",
        mode: "ALL",
        topK: 5,
        minimumScore: 0.6,
      }),
    );
    expect(
      await screen.findByText("Pharma cold chain requires 2 to 8 C storage."),
    ).toBeInTheDocument();
  });
});
