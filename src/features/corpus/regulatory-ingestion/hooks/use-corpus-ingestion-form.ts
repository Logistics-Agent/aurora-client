"use client";

import { type FormEvent, useState } from "react";

import { useCorpusMutations } from "@/hooks/mutations/corpus/use-corpus-mutations";

import { DEFAULT_REGULATION_TYPE } from "../constants/corpus.constants";

export function useCorpusIngestionForm() {
  const [authority, setAuthority] = useState("");
  const [title, setTitle] = useState("");
  const [canonicalSourceUri, setCanonicalSourceUri] = useState("");
  const [contentReference, setContentReference] = useState("");
  const [rawText, setRawText] = useState("");
  const { ingestRegulatory } = useCorpusMutations();
  const ingest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !authority.trim() ||
      !title.trim() ||
      !canonicalSourceUri.trim() ||
      !contentReference.trim() ||
      !rawText.trim()
    )
      return;
    await ingestRegulatory.mutateAsync({
      authority: authority.trim(),
      title: title.trim(),
      canonicalSourceUri: canonicalSourceUri.trim(),
      contentReference: contentReference.trim(),
      regulationType: DEFAULT_REGULATION_TYPE,
      rawText: rawText.trim(),
    });
    setAuthority("");
    setTitle("");
    setCanonicalSourceUri("");
    setContentReference("");
    setRawText("");
  };
  return {
    authority,
    setAuthority,
    title,
    setTitle,
    canonicalSourceUri,
    setCanonicalSourceUri,
    contentReference,
    setContentReference,
    rawText,
    setRawText,
    ingest,
    ingestRegulatory,
  };
}
