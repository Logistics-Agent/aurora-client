# 06 — Commercial: estimate, invoice, payment, escrow

Dependencies: F, S; payment phụ thuộc BE-06, customer/shipment identity phụ thuộc BE-05. Negotiations thuộc file 05, không xây service trùng.

Sources: `src/dotnet/BFF/Staff.Bff/Controllers/{Financial,Billing}Controller.cs`, `protos/billing.proto`, `src/nestjs/billing-service/src/{interface/controllers/billing.controller.ts,application/services/billing.service.ts,infrastructure/messaging/event-handlers/shipment-completed.handler.ts}`.

## Contract hiện tại

- POST `/api/v1/Financial/estimate-cost`: originCountry/originPort/destinationCountry/destinationPort, weightKg/volumeCbm/lengthCm/widthCm/heightCm, transportMode/cargoType/cargoValue/currency/hsCodes. POST `/customs-duty`: originCountry/destinationCountry/hsCode/cargoValue. Không hardcode corridor/customer từ mock.
- GET/POST `/api/v1/invoices`, GET `/{id}`, POST `/generate`, PATCH `/{id}/status` `{status}`. Generate `{shipmentId,customerId,paymentTermsDays}`; create `{shipmentId,customerId,dueDate,items}` theo tên collection trong DTO controller, phải lock schema trước implementation.
- POST `/api/v1/billing/credit-check` `{customerId,newAmount}`; GET `/api/v1/escrow/wallets/{id}`. Không dùng GET credit-check, `/pay`, `/escrow/accounts` từ docs cũ.
- Nest RecordPayment đã có handler/use-case nhưng proto được main.ts load chưa expose RPC. Cần BE-06; PATCH PAID bị BE chặn khi ledger chưa đủ. Đây không phải một nút “đổi nhãn status”.
- POD auto-invoice đòi podDocumentS3Key; không mặc định shipment completed đã phát event đúng shape/được consumer nhận.

## B01 — Financial estimate

Tạo `src/api/services/financial.service.ts`, `src/dto/financial/financial.dto.ts`, `src/hooks/mutations/financial/use-cost-estimate.ts`, `src/api/services/financial.service.test.ts`; sửa `src/features/commercial/cost-estimate/index.tsx`.

Task B01b: sửa `src/features/commercial/components/cost-composition.tsx`, `src/configs/api.ts`; tạo `src/features/commercial/cost-estimate/cost-estimate.test.tsx`.

Lấy dimensions/cargo/route từ shipment snapshot thật, cho nhập bổ sung các trường BE yêu cầu. Estimate là quote tham khảo, không ledger/invoice final. Currency/decimal theo schema BE, không làm tròn trung gian hoặc đổi tiền tự phát. Snapshot thay đổi thì quote stale.

Acceptance: các dòng phí đến từ response, lỗi financial không hiện mock breakdown; verify request units/currency và insufficient input/timeout.

## B02 — Invoice list/detail/create/generate

Sửa `src/api/services/billing.service.ts`; tạo `src/dto/billing/billing.dto.ts`, `src/api/query-keys/billing.keys.ts`, `src/hooks/queries/billing/use-invoices-query.ts`, `src/api/services/billing.service.test.ts`.

Task B02b: sửa `src/features/commercial/billing/index.tsx`, `src/features/commercial/invoice-detail/index.tsx`, `src/features/commercial/components/commercial-summary.tsx`; tạo `src/hooks/queries/billing/use-invoice-query.ts`, `src/hooks/mutations/billing/use-invoice-mutations.ts`.

Summary không tổng hợp một page rồi coi là tổng ledger. Dùng invoiceId/customerId/shipmentId thật; không lấy customerName làm customerId. Generate chỉ khi BE cho phép, không tạo invoice từ fallback customer/port/weight. List/detail error/empty đúng; cancel/status transitions theo BE, không mở tùy ý mọi status string.

Acceptance: click invoice mở đúng invoice, reload vẫn có detail; backend từ chối PAID không báo Recorded. Verify service + component tests và tenant isolation trước khi mở UI mutation.

## B03 — Record payment, sau BE-06

Sửa billing service/DTO và `src/features/commercial/billing/index.tsx`; tạo `src/hooks/mutations/billing/use-record-payment.ts`, `src/hooks/mutations/billing/use-record-payment.test.tsx`.

Form chọn invoice cụ thể, amount/currency/method/reference theo **contract mới đã chốt**, idempotency theo ledger; không tự giả URL trước BE expose. Cùng request retry không tạo hai payment. Balance/status trả từ BE; partial/full payment khác nhau, quá hạn và cancelled có xử lý rõ. Fail giữ form và lỗi; không đặt recorded=true trong catch/finally.

Acceptance: partial payment không PAID; đủ tiền mới PAID; concurrent/duplicate requests không ghi ledger sai. Verify BE transaction tests, duplicate idempotency, cross-tenant invoiceId, currency mismatch, reload balance.

## B04 — Escrow và event kết nối

Tạo `src/hooks/queries/billing/use-escrow-wallet-query.ts`, `src/features/commercial/billing/components/escrow-wallet.tsx`, `src/features/commercial/billing/components/escrow-wallet.test.tsx`; sửa billing DTO/service (5 file).

Chỉ đọc wallet qua route hiện có khi BE tenant tests đạt. Lock/release/refund không hiện thành action hoạt động nếu Staff HTTP chưa expose. Không đưa internal settlement/admin workflow vào staff UI mặc định.

Acceptance: invoice được tạo từ POD thật hiển thị sau refresh/invalidation, không generate lần nữa chỉ vì FE chưa nhận event. Verify producer → broker → billing consumer → invoice DB → HTTP → UI, event replay không nhân đôi invoice. Không dùng tài khoản/tiền thật trong kiểm tra.
