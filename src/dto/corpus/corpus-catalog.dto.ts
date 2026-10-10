import { z } from "zod";

const dateDto = z.string().refine((value) => !Number.isNaN(Date.parse(value)));
const nullableDateDto = dateDto.nullable();
const corpusStatusDto = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "PENDING_OCR",
  "UNKNOWN",
]);

const corpusVersionStatusDto = z.object({
  id: z.string().min(1).nullable(),
  versionLabel: z.string().min(1).nullable(),
  status: corpusStatusDto,
  chunkCount: z.number().int().nonnegative(),
  embeddedChunkCount: z.number().int().nonnegative(),
  fileName: z.string().min(1).nullable(),
  mimeType: z.string().min(1).nullable(),
  sizeBytes: z.number().int().nonnegative(),
  contentSha256: z.string().nullable(),
  createdAt: nullableDateDto,
  updatedAt: nullableDateDto,
  completedAt: nullableDateDto,
  failedAt: nullableDateDto,
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
});

const regulatorySourceDto = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  authority: z.string().min(1),
  jurisdictionCode: z.string().min(1),
  regulationType: z.string().min(1),
  languageCode: z.string().min(1),
  visibility: z.string().min(1),
  createdAt: dateDto,
  latestVersion: corpusVersionStatusDto.nullable(),
});

const knowledgeDocumentDto = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  sourceReference: z.string().min(1),
  languageCode: z.string().min(1),
  visibility: z.string().min(1),
  createdAt: dateDto,
  latestVersion: corpusVersionStatusDto.nullable(),
});

const catalogPageDto = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalCount: z.number().int().nonnegative(),
  });

const regulatorySourceDetailsDto = z.object({
  summary: regulatorySourceDto,
  versions: z.array(corpusVersionStatusDto),
});

const knowledgeDocumentDetailsDto = z.object({
  summary: knowledgeDocumentDto,
  versions: z.array(corpusVersionStatusDto),
});

export type CorpusStatus = z.infer<typeof corpusStatusDto>;
export type CorpusVersionStatus = z.infer<typeof corpusVersionStatusDto>;
export type RegulatorySource = z.infer<typeof regulatorySourceDto>;
export type KnowledgeDocument = z.infer<typeof knowledgeDocumentDto>;
export type RegulatorySourcePage = z.infer<
  ReturnType<typeof catalogPageDto<typeof regulatorySourceDto>>
>;
export type KnowledgeDocumentPage = z.infer<
  ReturnType<typeof catalogPageDto<typeof knowledgeDocumentDto>>
>;
export type RegulatorySourceDetails = z.infer<typeof regulatorySourceDetailsDto>;
export type KnowledgeDocumentDetails = z.infer<typeof knowledgeDocumentDetailsDto>;

export function parseRegulatorySourcePage(value: unknown): RegulatorySourcePage {
  return catalogPageDto(regulatorySourceDto).parse(value);
}

export function parseRegulatorySourceDetails(value: unknown): RegulatorySourceDetails {
  return regulatorySourceDetailsDto.parse(value);
}

export function parseKnowledgeDocumentPage(value: unknown): KnowledgeDocumentPage {
  return catalogPageDto(knowledgeDocumentDto).parse(value);
}

export function parseKnowledgeDocumentDetails(value: unknown): KnowledgeDocumentDetails {
  return knowledgeDocumentDetailsDto.parse(value);
}

export function parseCorpusVersionStatus(value: unknown): CorpusVersionStatus {
  return corpusVersionStatusDto.parse(value);
}
