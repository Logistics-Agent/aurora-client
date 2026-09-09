"use client";

import { type FormEvent, useState } from "react";

import { useCorpusMutations } from "@/hooks/mutations/corpus/use-corpus-mutations";

import { DEFAULT_KNOWLEDGE_CATEGORY } from "../constants/corpus.constants";

export function useCorpusPromotionForm() {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [storageReference, setStorageReference] = useState("");
  const { promoteGeneral } = useCorpusMutations();
  const promote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id.trim() || !title.trim() || !storageReference.trim()) return;
    await promoteGeneral.mutateAsync({
      id: id.trim(),
      input: {
        title: title.trim(),
        category: DEFAULT_KNOWLEDGE_CATEGORY,
        storageReference: storageReference.trim(),
      },
    });
  };
  return {
    id,
    setId,
    title,
    setTitle,
    storageReference,
    setStorageReference,
    promote,
    promoteGeneral,
  };
}
