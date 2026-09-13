# AI/RAG Corpus Upload Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the tenant-safe corpus path so a verified file uploaded through the existing Documents upload-session flow is OCR-processed, chunked, embedded, visible in the corpus catalog, and usable by grounded AI answers.

**Architecture:** Keep Documents/OCR responsible for upload verification, R2 object access, OCR, and typed OCR events. Keep RegulatoryCompliance responsible for corpus metadata/version state, chunking, embeddings, retrieval, evaluation freshness, and grounded-answer policy. Add only additive contracts at the BFF/gRPC boundaries; do not expose raw storage keys or raw document text as the staff primary workflow.

**Tech Stack:** ASP.NET Core/.NET 10, gRPC protobuf, EF Core/PostgreSQL/pgvector, MassTransit events, Next.js App Router, TypeScript, Zod, TanStack Query, Vitest, xUnit.

**Spec:** `docs/superpowers/specs/three-service-integration/phase-03-corpus-assistant.md`

## Global Constraints

- BE worktree is based on fresh `origin/stagging-prod`; FE worktree is based on fresh `origin/develop`.
- Work only within Documents/OCR, RegulatoryCompliance, Staff BFF, and the AI/RAG feature; do not refactor unrelated services.
- Reuse the existing upload-session contract; clients send `uploadId`, metadata, and typed purpose, never raw storage keys or raw text as the primary flow.
- Accepted corpus purposes are `REGULATORY_CORPUS` and `KNOWLEDGE_CORPUS`; shipment/general documents must not enter RAG.
- All corpus reads and writes are tenant-scoped; platform sources remain readable only through the existing platform visibility rules.
- R2 credentials are runtime configuration/Key Vault secrets only; never commit access keys, secret keys, signed URLs, or connection strings.
- Existing R2/download implementation and existing assistant/RAG commits remain intact; new changes must be additive and rollback-friendly.
- No database migration is required unless the final model diff introduces a new persisted column/table; read-only catalog and existing status fields must not generate a migration.
- Every vertical slice must have focused tests, build/typecheck evidence, `git diff --check`, an atomic commit, and a pushed feature branch.

---

### Task 1: Add typed corpus-intake contracts and pending-OCR state

**Files:**

- Modify: `/home/kaito/project/aurora/aurora-server-ai/protos/regulatory_compliance.proto`
- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Application/Ingestion/RegulatoryIngestionModels.cs`
- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Application/Ingestion/RegulatoryIngestionService.cs`
- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Application/Ingestion/KnowledgeIngestionModels.cs`
- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Application/Ingestion/KnowledgeIngestionService.cs`
- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/GrpcServices/RegulatoryComplianceGrpcService.cs`
- Test: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Tests/RegulatoryIngestionTests.cs`
- Test: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Tests/KnowledgeIngestionTests.cs`
- Test: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Tests/RegulatoryComplianceContractTests.cs`

**Interfaces:**

- Add gRPC operations `CreateRegulatoryCorpusVersion` and `CreateKnowledgeCorpusVersion`.
- Each request contains idempotency key, corpus metadata, verified content reference, filename, MIME type, size, SHA-256, and typed tenant visibility; it contains no document bytes.
- Each operation returns the existing ingestion response shape with a new version ID and `PENDING_OCR` status.
- Add `CreatePendingOcrAsync` application methods that are idempotent by tenant scope and ingestion key.

- [x] Step 1: Add failing tests proving a valid metadata request creates a version in `PendingOcr`, replay returns the same IDs, and a different payload with the same idempotency key is rejected.

- [x] Step 2: Run focused tests and verify they fail before implementation:

```bash
rtk dotnet test src/dotnet/RegulatoryCompliance/Tests/RegulatoryCompliance.Tests.csproj --filter FullyQualifiedName~RegulatoryIngestionTests --verbosity minimal
rtk dotnet test src/dotnet/RegulatoryCompliance/Tests/RegulatoryCompliance.Tests.csproj --filter FullyQualifiedName~KnowledgeIngestionTests --verbosity minimal
```

- [x] Step 3: Add the two protobuf requests/RPCs and preserve numeric enum compatibility, including `PENDING_OCR = 5`.

- [x] Step 4: Implement metadata validation and idempotent pending-version creation using the existing aggregate factories and tenant query filters. Validate HTTPS provenance for regulatory sources, approved corpus storage-key shape, positive size, lowercase 64-character SHA-256, allowed MIME types, and tenant context.

- [x] Step 5: Map gRPC exceptions consistently: invalid metadata to `INVALID_ARGUMENT`, missing tenant to `UNAUTHENTICATED`, permission failures to `PERMISSION_DENIED`, and idempotency conflicts to `ALREADY_EXISTS`.

- [x] Step 6: Run the focused tests and build:

```bash
rtk dotnet test src/dotnet/RegulatoryCompliance/Tests/RegulatoryCompliance.Tests.csproj --filter FullyQualifiedName~RegulatoryIngestionTests --verbosity minimal
rtk dotnet test src/dotnet/RegulatoryCompliance/Tests/RegulatoryCompliance.Tests.csproj --filter FullyQualifiedName~KnowledgeIngestionTests --verbosity minimal
rtk dotnet build src/dotnet/RegulatoryCompliance/Tests/RegulatoryCompliance.Tests.csproj --no-restore --verbosity minimal -m:1
```

- [x] Step 7: Run `rtk git diff --check`, commit as `feat(rag): create typed corpus ocr intake`, and push `feat/grounded-assistant-context`.

---

### Task 2: Make corpus OCR produce full text and resume the typed version

**Files:**

- Modify: `/home/kaito/project/aurora/aurora-server/src/dotnet/DocumentOcr/Application/Intake/DocumentIntakeService.cs`
- Modify: `/home/kaito/project/aurora/aurora-server/src/dotnet/DocumentOcr/GrpcServices/DocumentOcrGrpcService.cs` only if the extraction mode must be exposed in the intake input
- Modify: `/home/kaito/project/aurora/aurora-server/src/dotnet/DocumentOcr/Application/Jobs/DocumentOcrOutboxFactory.cs` only if the event currently drops full text for corpus purposes
- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Application/Events/DocumentOcrIntegrationConsumer.cs`
- Test: `/home/kaito/project/aurora/aurora-server/src/dotnet/DocumentOcr/Tests/DocumentIntakeServiceTests.cs`
- Test: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/RegulatoryCompliance/Tests/DocumentOcrIntegrationConsumerTests.cs`

**Interfaces:**

- Corpus intake must use `OcrExtractionMode.FullText` or `Both`; shipment documents retain their current structured extraction behavior.
- The OCR completion event must carry a typed `Purpose`, the corpus version ID in `ExternalContextId`, tenant ID, and either full text or a durable artifact reference.
- RegulatoryCompliance must resume only the version identified by `ExternalContextId` and `TenantId`; unknown/mismatched IDs are ignored or dead-lettered without cross-tenant access.

- [x] Step 1: Add failing tests for corpus purpose selecting full-text extraction and for an OCR completion event moving the exact tenant version from `PendingOcr` to `Completed` with chunks and embeddings.

- [x] Step 2: Run the two focused test files and verify the new assertions fail.

- [x] Step 3: Make DocumentOcr choose full-text extraction for the two corpus purposes while preserving structured mode for shipment/general documents.

- [x] Step 4: Prefer the durable full-text event/artifact contract. The existing local artifact reader remains only as a bounded development fallback; it uses the verified tenant-owned storage reference and never accepts an arbitrary external URL or another tenant’s path.

- [x] Step 5: Keep the existing chunker and embedding provider, but process corpus text only after validating the typed purpose, tenant, version ID, and pending status. Preserve idempotent handling of duplicate completion events.

- [x] Step 6: Run focused tests and builds for DocumentOcr and RegulatoryCompliance, then commit as `feat(rag): resume corpus ingestion from ocr`.

---

### Task 3: Add one BFF vertical endpoint for verified corpus upload

**Files:**

- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/BFF/Staff.Bff/Controllers/DocumentsController.cs`
- Modify: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/BFF/Staff.Bff/Services/DocumentProblemContracts.cs` if new problem codes are required
- Test: `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/BFF/Staff.Bff.Tests/ComplianceControllerContractTests.cs`
- Test: add `/home/kaito/project/aurora/aurora-server-ai/src/dotnet/BFF/Staff.Bff.Tests/CorpusUploadContractTests.cs`

**Interfaces:**

- Add `POST /api/v1/documents/corpus-intakes`.
- Request:

```json
{
  "uploadId": "uuid",
  "purpose": "REGULATORY_CORPUS",
  "idempotencyKey": "string",
  "title": "string",
  "authority": "string",
  "canonicalSourceUri": "https://source.example/rule",
  "jurisdictionCode": "VN",
  "regulationType": 1,
  "category": 1,
  "languageCode": "vi",
  "versionLabel": "1.0"
}
```

- The endpoint verifies the upload session through DocumentOcr, creates the pending corpus version through RegulatoryCompliance, then calls DocumentOcr `CreateDocumentIntake` with the version ID as `externalReference` and the typed corpus purpose.
- Response contains corpus version ID, OCR job ID, file metadata, and normalized status; it does not expose a raw R2 key, signed URL, or document text.

- [x] Step 1: Add contract tests for invalid purpose, missing tenant, unverified upload, idempotency replay, and successful regulatory/knowledge requests.

- [x] Step 2: Run the BFF contract tests and verify the new endpoint tests fail.

- [x] Step 3: Implement the endpoint with strict UUID/metadata validation, permission `documents:ingest`, tenant context, and typed purpose mapping. Map upstream failures to the existing ProblemDetails contract.

- [x] Step 4: Add compensation-safe behavior: if OCR intake fails after the Compliance version is created, return a retryable error with the same idempotency key and leave the version in a visible failed/retryable state; never create a second version on retry.

- [x] Step 5: Build and run focused BFF tests, then commit as `feat(rag): add verified corpus intake endpoint`.

---

### Task 4: Replace the FE raw-text corpus workflow with file upload

**Files:**

- Modify: `/home/kaito/project/aurora-client-ai/src/configs/api.ts`
- Modify: `/home/kaito/project/aurora-client-ai/src/dto/documents/document-upload.dto.ts`
- Create: `/home/kaito/project/aurora-client-ai/src/dto/corpus/corpus-upload.dto.ts`
- Create: `/home/kaito/project/aurora-client-ai/src/api/services/corpus-upload.service.ts`
- Create: `/home/kaito/project/aurora-client-ai/src/hooks/mutations/corpus/use-corpus-upload-mutation.ts`
- Modify: `/home/kaito/project/aurora-client-ai/src/features/corpus/regulatory-ingestion/components/corpus-ingestion-form.tsx`
- Modify: `/home/kaito/project/aurora-client-ai/src/features/corpus/regulatory-ingestion/hooks/use-corpus-ingestion-form.ts`
- Modify: `/home/kaito/project/aurora-client-ai/src/features/corpus/knowledge-promotion/components/corpus-promotion-form.tsx`
- Modify: `/home/kaito/project/aurora-client-ai/src/features/corpus/knowledge-promotion/hooks/use-corpus-promotion-form.ts`
- Create: `/home/kaito/project/aurora-client-ai/src/features/corpus/components/corpus-upload-status.tsx`
- Test: `/home/kaito/project/aurora-client-ai/src/api/services/corpus-upload.service.test.ts`
- Test: `/home/kaito/project/aurora-client-ai/src/features/corpus/regulatory-ingestion/components/corpus-ingestion-form.test.tsx`

**Interfaces:**

- FE calls the existing `documentUploadService.createUploadSession`, uploads the selected `File` with `uploadObject`, then calls `POST /documents/corpus-intakes`.
- The mutation accepts `File` plus typed metadata and returns `{ corpusVersionId, ocrJobId, status }`.
- Regulatory and knowledge forms must not ask for `rawText`, `contentReference`, or a manually entered `storageReference`; the server owns storage references.
- Poll the existing OCR job/status and invalidate corpus catalog queries when OCR completes.

- [x] Step 1: Add DTO/service tests for upload-session creation, object upload, corpus intake, and failure mapping.

- [x] Step 2: Run the focused Vitest tests and verify they fail.

- [x] Step 3: Implement the upload mutation with a new idempotency key per intake, abort support, progress reporting, and no production mock.

- [x] Step 4: Replace the raw-text/manual-storage-reference forms with file selection and metadata fields for both regulatory and knowledge corpus intake. Show upload progress, OCR/chunk/embedding/ready stages, retryable errors, and the resulting corpus version ID.

- [x] Step 5: Preserve the existing regulatory search and catalog workspace; invalidate `corpusKeys.all` after successful intake.

- [x] Step 6: Run focused Vitest, ESLint, Prettier, and typecheck. Record unrelated existing typecheck failures separately.

- [x] Step 7: Commit as `feat(corpus): upload files through verified intake` and push the FE branch.

---

### Task 5: Wire compliance-detail handoff into grounded assistant

**Files:**

- Modify: `/home/kaito/project/aurora-client-ai/src/features/compliance` files that own the evaluation detail action
- Modify: `/home/kaito/project/aurora-client-ai/src/features/ai-assistant/hooks/use-assistant-workspace.ts`
- Modify: `/home/kaito/project/aurora-client-ai/src/features/ai-assistant/index.tsx`
- Test: existing compliance detail tests
- Test: `/home/kaito/project/aurora-client-ai/src/features/ai-assistant/ai-assistant.test.tsx`

**Interfaces:**

- Compliance detail action navigates to `/assistant?shipmentId=<uuid>&evaluationId=<uuid>`.
- Assistant reads both IDs from the URL, validates UUID format client-side, displays the verified context, and sends the nested `context` object already defined by the BE contract.
- The assistant must show `CURRENT`, `STALE`, `UNKNOWN`, context mismatch, unavailable evaluation, insufficient evidence, and provider-unavailable states distinctly.

- [x] Step 1: Add failing tests for URL handoff and nested context payload.

- [x] Step 2: Implement the handoff using the existing App Router conventions and query/mutation ownership rules.

- [x] Step 3: Run assistant/compliance focused tests, lint, and formatting, then commit as `feat(assistant): connect compliance evaluation handoff`.

## Implementation ledger

- BE branch: `feat/grounded-assistant-context`, based on `origin/stagging-prod`.
- FE branch: `feat/grounded-assistant-context`, based on `origin/develop`.
- BE commits: `e30054f`, `2767f9e`, `74d61ba`, `a8c4a8b`, `457fcdf`, `c954861`.
- FE commits: `2026d62`, `bf1203f`, `75eb373`, plus the knowledge-upload UI follow-up pending commit.
- Focused BE tests pass: RegulatoryCompliance 72/72 (non-integration), DocumentOcr 116/116 (non-integration), BFF 103/103. FE focused corpus/assistant/compliance tests pass; ESLint, Prettier, and `git diff --check` pass.
- FE full typecheck is blocked only by six pre-existing errors in route-tracking and shipment-detail; no new errors are reported in the changed files.
- DocumentOcr and RegulatoryCompliance integration tests require unavailable local PostgreSQL/RabbitMQ; staging runtime proof, Key Vault/Kubernetes readiness, and shared-branch merge remain gated until deployment evidence is captured.

---

### Task 6: Runtime proof, documentation, and merge gate

**Files:**

- Create or modify: `/home/kaito/project/aurora-client-ai/docs/superpowers/plans/three-service-integration/2026-09-13-phase-ai-rag-upload-completion.md`
- Modify: `/home/kaito/project/aurora-client-ai/docs/integration/03-documents-compliance.md`
- Modify: `/home/kaito/project/aurora-client-ai/docs/integration/09-verification.md`

**Interfaces:**

- Runtime proof must use a real tenant account and a non-sensitive test PDF/Markdown file.
- The evidence chain must record upload ID, corpus version ID, OCR job ID, final status, chunk count, embedded chunk count, assistant retrieval trace ID, and at least one validated citation.
- Secrets are configured by an administrator in the correct Key Vault and mounted through deployment configuration; no secret values are written to logs or docs.

- [ ] Step 1: Run BE builds/tests and FE focused tests from clean worktrees; run `git diff --check`.

- [ ] Step 2: Confirm the R2/Key Vault runtime configuration exists without printing secret values:

```bash
rtk az keyvault secret list --vault-name kv-aurora-shared-demo --query "[].name" -o tsv
rtk kubectl --context aks-ai-demo -n aurora-ai get pods
rtk kubectl --context aks-ai-demo -n aurora-ai logs deploy/document-ocr --tail=200
```

- [ ] Step 3: Deploy the pushed feature images/manifests, wait for `document-ocr`, `regulatory-compliance`, and `staff-bff` to be `Ready`, and capture only status/trace IDs.

- [ ] Step 4: Execute the real flow with a test tenant:

```text
POST /documents/uploads
PUT signed upload target
POST /documents/corpus-intakes
poll OCR/status
GET /documents/regulatory-sources or /documents/knowledge-documents
POST /assistant/query with shipmentId/evaluationId when applicable
verify citations and retrievalTraceId
```

- [ ] Step 5: If runtime proof passes, request code review, merge BE into `stagging-prod`, merge FE into `develop`, and let the existing deployment pipeline restart the services. Do not force-push or restart unrelated deployments.

- [ ] Step 6: If runtime proof fails, keep the feature branches unmerged, record the exact trace ID/error category, fix the failing slice, rerun focused tests, and repeat the merge gate.

## Completion Criteria

- [ ] A corpus file can travel from upload-session through OCR, chunking, and embedding without raw-text/manual storage-reference input.
- [ ] Corpus list/detail/status endpoints are tenant-safe and visible in FE.
- [ ] Grounded assistant retrieves only permitted evidence and validates every citation.
- [ ] Evaluation freshness is derived from persisted corpus versions, not a constant.
- [ ] No-evidence and provider-unavailable behavior is deterministic and visible.
- [ ] Focused BE/FE tests pass; unrelated pre-existing typecheck warnings are documented.
- [ ] Staging E2E succeeds with real R2/OCR/embedding configuration.
- [ ] Only after all criteria pass are BE/FE branches merged into their requested shared bases.
