# 10 — Đối chiếu Swagger đang deploy

Đọc ngày 2026-09-09 khoảng 01:32–01:34 UTC, chỉ GET tài liệu công khai:

- [Swagger UI](https://api.humanak.cyou/swagger/index.html)
- [OpenAPI JSON](https://api.humanak.cyou/swagger/v1/swagger.json)

UI trỏ tới Staff BFF API v1. JSON đọc được có **114 path keys, 132 operations**, gồm alias `/api/...` và đường dẫn khác casing; không đồng nghĩa 132 nghiệp vụ độc lập. Không biết commit của deployment chỉ từ metadata `version: v1`. Không gọi login/logout hoặc nghiệp vụ POST/PATCH/DELETE để thử.

## Những gì đã xác nhận từ deployment

| Contract | Swagger đang expose | Kết luận |
|---|---|---|
| Direct auth | POST `/api/v1/Auth/identify`, `/login`, `/complete-invitation`, `/refresh`, `/logout` | Đúng nhóm Staff source; không customer refresh |
| Shared auth | GET `/api/v1/auth/me`, login/callback; GET/POST logout | Hai POST logout khác casing cùng tồn tại trong spec; cần route-selection regression test BE-01 |
| OCR | `/api/v1/documents/shipment-documents` + id/review/cancel/retry | Không `/documents/jobs` theo docs cũ; submit storageReference JSON |
| OCR schema | `Staff_UnifiedDocumentStatusResponse`: id/documentType/status; field review name/value | Xác nhận mapping FE hiện tại cần sửa |
| Approvals | GET `/api/v1/Approvals/pending`, POST `/{id}/approve`, `/{id}/reject` | Dùng approvalId theo handler, không routeId |
| Shipments | CRUD, submit/status/cancel/import, cargo/locations/documents/milestones/timeline | Không thấy assignment route HTTP trong spec này |
| Routes | CRUD/status/optimize/recommendation | Không thấy dispatch HTTP action |
| Mail | drafts, threads/claim/reassign/unassign/history, messages/outbound, quarantine/release | Không thấy priority/resolve/mailbox-directory/assignee-directory Staff action |
| Negotiations | Chỉ POST `/api/v1/Negotiations/{negotiationId}/mail-draft` | List/detail/offer UI vẫn cần BE exposure |
| Billing | invoices CRUD subset/generate/status, POST credit-check, GET escrow wallets | Không payment HTTP hoặc escrow lock/release/refund trong spec này |
| Notifications | devices/subscription/list/unread/read/read-all | Read/read-all dùng PATCH, giữ contract data layer hiện có |
| Assistant | assistant/query, search, chat/conversations và messages | Ba workflow khác nhau, không chung DTO |

Các đường dẫn feature trong plan thường viết lowercase để dễ đọc; spec thực tế có capitalized controller tokens như `/Mail`, `/Routes`, `/Shipments`. ASP.NET matching và reverse proxy phải được smoke-test cho URL FE chọn; casing không phải cách khắc phục hai route logout trùng nghĩa.

## Giới hạn Swagger

- Nhiều operation chỉ ghi response `200: OK`, không schema (ví dụ mail thread list, auth refresh). Không thể suy response body/nullable enum chính xác chỉ bằng OpenAPI; dùng source + BFF serialization tests và bổ sung response annotations.
- Swagger nullable không thay thế business validation. Ví dụ submit OCR schema cho storageReference nullable nhưng pipeline vẫn cần reference hợp lệ.
- Không thấy endpoint trong spec là chưa expose trong **spec này**, không chứng minh không có ở service nội bộ hoặc deployment khác.
- JWT validator, tenant scope, transaction, event delivery và persistence không được Swagger chứng minh. Các rủi ro BE-01–08 vẫn phải kiểm tra bằng tests trước mở tính năng.

## Điều chỉnh thực hiện

1. G0 đối chiếu deployed spec với source trước từng slice; ghi discrepancy nếu deployment chưa theo commit BE mới.
2. BE contract đổi → update proto/handlers/BFF → regression tests → cập nhật OpenAPI → deploy theo quy trình riêng được cho phép → FE dùng contract tương thích. Không gọi service nội bộ trực tiếp để né BFF chưa deploy.
3. Nếu spec và source lệch, dừng action ảnh hưởng dữ liệu; không gắn UI vào URL suy đoán. GET/read-only còn tương thích có thể tiếp tục.

Kết quả hiện tại: các endpoint trọng tâm khớp source đã audit; chưa có bằng chứng runtime authenticated flows hay liên-service đã thành công.
