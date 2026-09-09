"use client";

import { type FormEvent, useState } from "react";

import type { RegulatoryQueryInput } from "@/api/services/corpus.service";
import { useRegulatoryCorpusQuery } from "@/hooks/queries/corpus/use-corpus-queries";

import { CORPUS_QUERY_DEFAULTS } from "../constants/regulatory-search.constants";

export function useCorpusSearch() {
  const [query, setQuery] = useState("");
  const [submittedInput, setSubmittedInput] = useState<RegulatoryQueryInput>();
  const queryRegulatory = useRegulatoryCorpusQuery(submittedInput);
  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) setSubmittedInput({ query: trimmedQuery, ...CORPUS_QUERY_DEFAULTS });
  };
  return { query, setQuery, search, queryRegulatory };
}
