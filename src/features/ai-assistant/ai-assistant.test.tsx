import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiAssistantPage } from "./index";
import { assistantService } from "@/api/services/assistant.service";
import type { AssistantQueryResponse } from "@/dto/assistant/assistant.dto";

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
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("AiAssistantPage", () => {
  it("renders page header and query input", () => {
    renderWithClient(<AiAssistantPage />);
    expect(screen.getByRole("heading", { name: "AI Assistant", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Ask about compliance rules, customs requirements/i),
    ).toBeInTheDocument();
  });

  it("submits query to assistantService when clicking Query Assistant", async () => {
    const mockResponse: AssistantQueryResponse = {
      query: "What is cold chain SOP?",
      answer: "Pharma cold chain requires 2°C to 8°C storage.",
      regulatoryCitations: [
        {
          evidenceId: "ev-1",
          sourceId: "src-1",
          documentVersionId: "ver-1",
          chunkId: "chk-1",
          title: "ASEAN Pharma Transport Guidelines",
          authority: "ASEAN Health Authority",
          jurisdiction: "ASEAN",
          regulationType: "HEALTH_DIRECTIVE",
          section: "Sec 4.2",
          page: "12",
          excerpt: "Temperature loggers must record hourly.",
          canonicalSourceUri: "https://asean.org/pharma-guidelines",
          score: 0.94,
        },
      ],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: false,
      missingInformation: [],
      governance: {
        decisionId: "dec-101",
        automationLevel: "ASSISTED",
        requiresApproval: false,
        capabilityCode: "compliance.answer",
        totalTokens: 150,
      },
      retrievalTraceId: "trace-999",
    };

    vi.mocked(assistantService.query).mockResolvedValueOnce(mockResponse);

    renderWithClient(<AiAssistantPage />);

    const input = screen.getByPlaceholderText(/Ask about compliance rules, customs requirements/i);
    fireEvent.change(input, { target: { value: "What is cold chain SOP?" } });

    const queryBtn = screen.getByRole("button", { name: /Query Assistant/i });
    fireEvent.click(queryBtn);

    expect(assistantService.query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "What is cold chain SOP?",
        mode: "ALL",
      }),
    );

    const answer = await screen.findByText(/Pharma cold chain requires 2°C to 8°C storage/i);
    expect(answer).toBeInTheDocument();
    expect(screen.getByText(/ASEAN Pharma Transport Guidelines/i)).toBeInTheDocument();
  });
});
