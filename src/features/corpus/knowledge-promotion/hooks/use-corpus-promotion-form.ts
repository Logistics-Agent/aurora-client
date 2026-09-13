"use client";

import { type FormEvent, useState } from "react";

import { useCorpusUploadMutation } from "@/hooks/mutations/corpus/use-corpus-upload-mutation";

import { DEFAULT_KNOWLEDGE_CATEGORY } from "../constants/knowledge-promotion.constants";

export function useCorpusPromotionForm() {
  const [title, setTitle] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadCorpus = useCorpusUploadMutation();
  const promote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !sourceReference.trim() || !file) return;
    setUploadProgress(0);
    await uploadCorpus.mutateAsync({
      file,
      onProgress: setUploadProgress,
      intake: {
        purpose: "KNOWLEDGE_CORPUS",
        idempotencyKey: crypto.randomUUID(),
        title: title.trim(),
        category: DEFAULT_KNOWLEDGE_CATEGORY,
        sourceReference: sourceReference.trim(),
        languageCode: "vi",
        versionLabel: "1.0",
      },
    });
    setTitle("");
    setSourceReference("");
    setFile(null);
  };
  return {
    title,
    setTitle,
    sourceReference,
    setSourceReference,
    file,
    setFile,
    uploadProgress,
    promote,
    uploadCorpus,
  };
}
