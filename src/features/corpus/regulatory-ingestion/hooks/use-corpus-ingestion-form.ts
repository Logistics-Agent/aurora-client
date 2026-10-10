"use client";

import { type FormEvent, useState } from "react";

import { useCorpusUploadMutation } from "@/hooks/mutations/corpus/use-corpus-upload-mutation";

import { DEFAULT_REGULATION_TYPE } from "../constants/corpus.constants";

export function useCorpusIngestionForm() {
  const [authority, setAuthority] = useState("");
  const [title, setTitle] = useState("");
  const [canonicalSourceUri, setCanonicalSourceUri] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadCorpus = useCorpusUploadMutation();
  const ingest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authority.trim() || !title.trim() || !canonicalSourceUri.trim() || !file) return;
    setUploadProgress(0);
    await uploadCorpus.mutateAsync({
      file,
      onProgress: setUploadProgress,
      intake: {
        purpose: "REGULATORY_CORPUS",
        idempotencyKey: crypto.randomUUID(),
        authority: authority.trim(),
        title: title.trim(),
        canonicalSourceUri: canonicalSourceUri.trim(),
        jurisdictionCode: "VN",
        regulationType: DEFAULT_REGULATION_TYPE,
        category: 1,
        languageCode: "vi",
        versionLabel: "1.0",
      },
    });
    setAuthority("");
    setTitle("");
    setCanonicalSourceUri("");
    setFile(null);
  };
  return {
    authority,
    setAuthority,
    title,
    setTitle,
    canonicalSourceUri,
    setCanonicalSourceUri,
    file,
    setFile,
    uploadProgress,
    ingest,
    uploadCorpus,
  };
}
