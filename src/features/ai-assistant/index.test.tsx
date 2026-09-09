import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { assistantService } from "@/api/services/assistant.service";

import { AiAssistantPage } from "./index";

vi.mock("@/api/services/assistant.service", async () => {
  const actual = await vi.importActual<typeof import("@/api/services/assistant.service")>(
    "@/api/services/assistant.service",
  );
  return { ...actual, assistantService: { query: vi.fn() } };
});

describe("AiAssistantPage", () => {
  it("renders the grounded response and refusal metadata from the API", async () => {
    vi.mocked(assistantService.query).mockResolvedValue({
      query: "What is the compliance risk?",
      answer: "I cannot determine that from the available evidence.",
      regulatoryCitations: [],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: true,
      missingInformation: ["verified shipment document"],
      governance: {
        decisionId: "decision-1",
        automationLevel: "ASSISTED",
        requiresApproval: true,
        capabilityCode: "assistant.query",
        totalTokens: 20,
      },
      retrievalTraceId: "trace-1",
    });
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AiAssistantPage />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("AI assistant question"), {
      target: { value: "What is the compliance risk?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask assistant" }));

    await waitFor(() =>
      expect(
        screen.getByText("I cannot determine that from the available evidence."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/insufficient evidence/i)).toBeInTheDocument();
    expect(screen.getByText("verified shipment document")).toBeInTheDocument();
    expect(screen.queryByText(/Prepared locally|Ask mock question/)).not.toBeInTheDocument();
  });
});
