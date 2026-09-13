import type { AssistantMode } from "@/dto/assistant/assistant.dto";

export const ASSISTANT_MODE_OPTIONS: ReadonlyArray<{ value: AssistantMode; label: string }> = [
  { value: "ALL", label: "All verified sources" },
  { value: "REGULATORY", label: "Regulatory sources" },
  { value: "KNOWLEDGE", label: "Knowledge sources" },
];

export const ASSISTANT_JURISDICTION_OPTIONS = [
  { value: "VN", label: "Vietnam (VN)" },
  { value: "US", label: "United States (US)" },
  { value: "EU", label: "European Union (EU)" },
  { value: "GLOBAL", label: "Global" },
] as const;

export const ASSISTANT_QUERY_DEFAULTS = {
  mode: "ALL",
  jurisdictionCode: "VN",
  topK: 5,
  minimumScore: 0.6,
} as const;
