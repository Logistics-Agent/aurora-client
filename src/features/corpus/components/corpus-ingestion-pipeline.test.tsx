import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CorpusIngestionPipeline } from "./corpus-ingestion-pipeline";

afterEach(() => cleanup());

describe("CorpusIngestionPipeline", () => {
  it("shows the active pending step and future processing steps", () => {
    render(
      <CorpusIngestionPipeline
        version={{
          status: "PENDING_OCR",
          chunkCount: 0,
          embeddedChunkCount: 0,
          errorMessage: null,
        }}
      />,
    );

    expect(screen.getByRole("list", { name: "Corpus ingestion pipeline" })).toBeInTheDocument();
    expect(screen.getByText("Pending")).toHaveAttribute("data-state", "active");
    expect(screen.getByText("OCR")).toHaveAttribute("data-state", "upcoming");
    expect(screen.getByText("Ready")).toHaveAttribute("data-state", "upcoming");
  });

  it("marks all steps complete when embeddings are ready", () => {
    render(
      <CorpusIngestionPipeline
        version={{
          status: "COMPLETED",
          chunkCount: 4,
          embeddedChunkCount: 4,
          errorMessage: null,
        }}
      />,
    );

    expect(
      screen.getAllByText("Ready").find((element) => element.dataset.state === "complete"),
    ).toBeInTheDocument();
    expect(screen.getByText("4/4 embedded")).toBeInTheDocument();
  });

  it("shows embedding as active after chunks are available", () => {
    render(
      <CorpusIngestionPipeline
        version={{
          status: "PROCESSING",
          chunkCount: 4,
          embeddedChunkCount: 1,
          errorMessage: null,
        }}
      />,
    );

    expect(screen.getByText("Chunking")).toHaveAttribute("data-state", "complete");
    expect(screen.getByText("Embedding")).toHaveAttribute("data-state", "active");
    expect(screen.getByText("1/4 embedded")).toBeInTheDocument();
  });

  it("shows a terminal error without hiding the pipeline", () => {
    render(
      <CorpusIngestionPipeline
        version={{
          status: "FAILED",
          chunkCount: 0,
          embeddedChunkCount: 0,
          errorMessage: "OCR produced empty text content.",
        }}
      />,
    );

    expect(screen.getByText("Status: FAILED")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("OCR produced empty text content.");
  });
});
