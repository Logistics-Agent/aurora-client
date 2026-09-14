# 03 — Documents, OCR và compliance

Dependencies: F01–F04, S01–S03; upload và identity linkage phụ thuộc BE-05/08. Sources: `Staff.Bff/Controllers/DocumentsController.cs`, `ComplianceController.cs` dưới `src/dotnet/BFF`; `src/dotnet/DocumentOcr/Application/Jobs/DocumentOcrJobService.cs`, `Application/Providers/DocumentInputPolicy.cs`.

## Contract phải giữ

Prefix `/api/v1/documents/shipment-documents` (submit cũng có alias `/documents/shipment`): GET list, POST submit, GET `/{id}`, GET/POST `/{id}/review`, POST `/{id}/cancel`, POST `/{id}/retry`.

- Submit JSON: idempotencyKey, storageReference, fileName, mimeType, sizeBytes, documentTypeHint (number), externalDocumentId (Guid), shipmentId. **Không upload file trực tiếp vào endpoint này.**
- List `{items,page,pageSize,totalItems,totalPages}`; item `{id,documentType,status,stage,fileName,needsReview,confidence,normalizedJson,errorCode,errorMessage,createdAt,updatedAt}`. Không đọc item.jobId/sourceType khi BFF không trả.
- Review detail `{documentId,jobId,status,originalDocumentReference,documentType,overallConfidence,reviewReasons,fields}`; field `{name,value,confidence,needsReview}`.
- Review body `{action,fields:[{name,value}],comment}`; action CONFIRM/CORRECT/REJECT. Status: RECEIVED/PROCESSING/READY/NEEDS_REVIEW/REJECTED/FAILED/CANCELLED. Dừng polling terminal, giữ error có thể retry theo server.
- Compliance POST `/api/v1/compliance/evaluations`; GET `/evaluations/{id}`; POST `/copilot/ask`.
- Evaluation body gồm idempotencyKey, externalShipmentId, originCountryCode, destinationCountryCode, transportMode, effectiveAt, jurisdictionCodes, cargo snapshots và OCR document snapshots. Không hardcode US/VN/OCEAN hoặc tự evaluate mỗi lần render.

## D04 — Corpus upload → OCR → RAG

Regulatory và knowledge corpus dùng flow chung: `POST /api/v1/documents/uploads` tạo upload-session, FE upload file lên signed target, sau đó gọi `POST /api/v1/documents/corpus-intakes` với `uploadId`, metadata typed và `purpose` (`REGULATORY_CORPUS` hoặc `KNOWLEDGE_CORPUS`). BFF xác minh upload receipt, tạo corpus version `PENDING_OCR`, rồi tạo OCR job với `externalReference = corpusVersionId`.

OCR xử lý corpus ở chế độ full text và phát event typed về RegulatoryCompliance. Consumer chỉ resume đúng tenant + corpus version đang `PENDING_OCR`, chunk/embedding rồi chuyển version sang trạng thái sẵn sàng. FE đọc catalog/status bằng các API corpus hiện có; không nhập raw text, storage key, signed URL hoặc `contentReference` thủ công.

`POST /api/v1/documents/corpus-intakes` là endpoint additive cho workflow mới. Các endpoint ingestion/promotion cũ vẫn giữ để tương thích, nhưng không còn là đường chính trên màn Corpus.

## D01 — Document data layer

Sửa `src/api/services/documents.service.ts`, `src/configs/api.ts`; tạo `src/dto/documents/document.dto.ts`, `src/api/query-keys/documents.keys.ts`, `src/api/services/documents.service.test.ts`.

Acceptance: fixture HTTP BFF parse đúng id/status/nullable fields, không unsafe cast normalizedJson; URL không dùng `/jobs` từ docs cũ. Verify service tests gồm review 409, list paging, cancellation và malformed normalized JSON.

## D02 — Queue/review thật

Tạo `src/hooks/queries/documents/use-documents-query.ts`, `src/hooks/queries/documents/use-document-review-query.ts`, `src/hooks/mutations/documents/use-document-mutations.ts`, `src/features/documents/components/document-review.test.tsx`; sửa `src/features/documents/components/document-review.tsx`.

Guard selected document trước dereference; selectedId local, server entity trong Query. Bỏ unsupported WorkspaceCard props khi typecheck xác nhận. Review thành công mới invalidate queue/detail/shipment documents/compliance context; 409 tải lại review mới, không overwrite. Thay selection phải cancel query cũ; không polling vô hạn.

Acceptance: open trang queue rỗng không crash, sửa field đúng tên BE, reload thấy correction; fail không close modal như đã lưu. Verify component + hook mocks theo response BFF, không chỉ mock view model.

## D03 — Upload và attach

Tạo `src/features/documents/components/document-upload.tsx`, `src/features/documents/hooks/use-document-upload.ts`, `src/api/services/document-upload.service.ts`, `src/features/documents/types/document-upload.types.ts`, `src/features/documents/components/document-upload.test.tsx`.

BE-08 chốt storage/upload endpoint và DTO trước; chưa có thì UI disable với lý do. Hook composition gọi root mutations/services qua root hook khi contract có, không cho component tự gọi HTTP. Không coi file.name hay object URL browser là storageReference. Upload → attach shipment document (lấy externalDocumentId thật) → submit OCR; backend xác nhận ownership/size/type, bù lỗi orphan theo policy đã chốt. Nếu BE chọn atomic upload+attach thì theo contract đó, không cố giữ nhiều request FE.

Task nối root upload DTO/mutation sau BE-08: tạo `src/dto/documents/document-upload.dto.ts`, `src/hooks/mutations/documents/use-document-upload-mutation.ts`, `src/hooks/mutations/documents/use-document-upload-mutation.test.tsx`; sửa upload service và hook composition ở trên (tối đa 5 file).

Acceptance: retry OCR không upload/attach trùng; URL preview có quyền và hạn dùng; file tenant khác bị từ chối. Verify API upload/attach/submit và lỗi ở từng bước.

## C01 — Compliance gắn shipment snapshot

Sửa `src/api/services/compliance.service.ts`; tạo `src/dto/compliance/compliance.dto.ts`, `src/api/query-keys/compliance.keys.ts`, `src/hooks/mutations/compliance/use-compliance-evaluation.ts`, `src/api/services/compliance.service.test.ts`.

Tiếp theo task C02: sửa `src/features/compliance/components/finding-review.tsx`, `src/features/compliance/compliance-center/index.tsx`; tạo `src/hooks/queries/compliance/use-compliance-evaluation-query.ts`, `src/features/compliance/utils/build-compliance-snapshot.ts`, `src/features/compliance/components/finding-review.test.tsx`.

Evaluation chỉ khi người dùng yêu cầu hoặc orchestration BE đã chứng minh; lấy cargo/countries/OCR từ shipment thật, giữ evaluationId và snapshot version. Query lại kết quả đã lưu, hiển thị citations/missing evidence, không canned AI answer khi HTTP lỗi. “Resolve finding” không local-only: nếu thiếu mutation BE, disable và backlog BE-08. Không đổi shipment status bằng FE chỉ vì evaluation có warning.

Acceptance: sửa OCR/cargo làm đánh giá cũ stale, người dùng thấy cần đánh giá lại; same snapshot retry idempotent. Verify country/mode/cargo payload, 403, AI unavailable, insufficent evidence; runtime OCR review → snapshot → evaluation → reload cùng shipment. CustomsHold auto re-evaluation là integration gap cần BE consumer, không được giả là đã tự động.
