# Map pages trong Aurora Client

Tài liệu này mô tả các màn hình đang hiển thị bản đồ, mục đích của từng màn
hình và dữ liệu hiện tại. Map nền đã dùng MapLibre/OpenFreeMap ở các màn hình
dashboard chính, nhưng dữ liệu shipment, route và GPS hiện vẫn là UI fixture;
chưa có live GPS transport hoặc query backend cho map.

## Tóm tắt các màn hình chính

| Route | Mục đích | Map component | Dữ liệu hiện tại |
| --- | --- | --- | --- |
| `/overview` | Tổng quan mạng lưới vận tải và các exception quan trọng | `LogisticsGeoMap` | `commandMapMock` và `commandExceptions` |
| `/live-map` | Theo dõi nhiều shipment, trạng thái GPS và exception theo thời gian thực | `LogisticsGeoMap` | `liveMapMock`, `liveShipments`, realtime fixture state |
| `/route-planning` | So sánh, chọn và human-approve route cho một shipment | `LogisticsGeoMap` | `routePlanningMapMock`, `routeAlternatives` |

## 1. `/overview` — Operations Command Center

### Mục đích

Đây là màn hình tổng quan cho nhân viên vận hành. Map trả lời câu hỏi:

> Mạng lưới shipment đang nằm ở đâu và exception nào cần được chú ý trước?

Map được đặt trong workspace `Network overview`, cạnh khu vực `Exceptions first`
và các KPI như Active shipments, Exceptions, On-time rate và AI processing.

### Code và dữ liệu

- Route adapter: `src/app/(dashboard)/overview/page.tsx`
- Page composition: `src/features/command-center/index.tsx`
- Fixture: `src/features/command-center/mock/index.ts`
- Map: `LogisticsGeoMap`

Map overview hiện có một tuyến HCM → Singapore và một tuyến có rủi ro ở phía
bắc. Ba marker tương ứng với các exception shipment:

- `SHP-2026-00128`: Port congestion
- `SHP-2026-00127`: Route deviation
- `SHP-2026-00125`: Document release blocked

Map dùng tọa độ địa lý `longitude/latitude`; không còn dùng dữ liệu SVG `x/y/path`
của component cũ. Marker không tự mở popup khi tải trang: người dùng click vào
marker để xem context shipment và có thể đóng popup bằng nút `X`.

### Trạng thái tích hợp

- Map tile: map thật từ MapLibre và OpenFreeMap.
- Route/marker/shipment: fixture local.
- KPI và exception: fixture local.
- Chưa gọi API shipment, GPS hoặc exception backend.

## 2. `/live-map` — Live Operations Map

### Mục đích

Đây là workspace theo dõi đội xe và nhiều shipment đang hoạt động. Map trả lời
câu hỏi:

> Shipment nào đang chạy, vị trí cuối cùng là gì, tín hiệu GPS có vấn đề không?

Màn hình có danh sách active shipments ở bên trái và shipment drawer ở bên
phải. Người dùng có thể search, filter theo status/mode/risk/customer/region,
chọn shipment hoặc chọn marker trên map.

### Code và dữ liệu

- Route adapter: `src/app/(dashboard)/live-map/page.tsx`
- Page composition: `src/features/route-tracking/live-map/index.tsx`
- Fixture: `src/features/route-tracking/live-map/mock/index.ts`
- Realtime presentation: `src/features/route-tracking/live-map/utils/realtime-fixture.ts`
- Client state: `src/features/route-tracking/live-map/stores/use-live-map-store.ts`
- Map: `LogisticsGeoMap`

`Cycle signal` là fixture control để mô phỏng các trạng thái:

```text
live → stale → offline → disconnected → reconnecting → live
```

Trạng thái này thay đổi nội dung marker, shipment drawer và
`RealtimeBanner`. Nó chưa phải WebSocket, SignalR, GPS device stream hay API
realtime thật.

Popup marker cũng chỉ là UI interaction hiện tại. Nó không đại diện cho AIS,
vessel feed hay live GPS transport.

### Trạng thái tích hợp

- Map tile: map thật.
- Shipment và GPS: fixture local.
- Search/filter/select: chạy trên fixture local.
- Retry map: đổi state local về `available`.
- Chưa có kết nối telemetry backend.

## 3. `/route-planning` — Route Planning

### Mục đích

Đây là workspace lập kế hoạch tuyến cho một shipment cụ thể. Map trả lời câu
hỏi:

> Trong các route AI đề xuất, route nào phù hợp để con người review và chấp thuận?

Màn hình hiển thị route trên map và danh sách `Proposed routes`. Người dùng có
thể chọn một route, mở `Compare routes`, mô phỏng lỗi tính route và bấm
`Accept`. Việc accept hiện chỉ là local human-approval fixture, không dispatch
xe hoặc cập nhật shipment thật.

### Code và dữ liệu

- Route adapter: `src/app/(dashboard)/route-planning/page.tsx`
- Page composition: `src/features/route-tracking/route-planning/index.tsx`
- Fixture: `src/features/route-tracking/route-planning/mock/index.ts`
- Client state: `src/features/route-tracking/route-planning/stores/use-route-planning-store.ts`
- Map: `LogisticsGeoMap`

Map có thể chuyển giữa `available`, `loading` và `unavailable` để kiểm tra UI
loading/fallback. `Simulate failure` là lỗi tính route giả lập, không phải lỗi
MapLibre.

### Trạng thái tích hợp

- Map tile: map thật.
- Route alternatives, distance, duration, cost, risk: fixture local.
- Accept route: local state, chưa gọi API planning/approval.
- Traffic và restrictions: hiện được biểu diễn bằng fixture layer trên route.

## Component map dùng chung

### `LogisticsGeoMap`

File chính: `src/components/common/geo-map/logistics-geo-map.tsx`

Đây là component map thật dùng cho các dashboard map chính. Nó chịu trách
nhiệm:

- Khởi tạo MapLibre bằng WebGL2.
- Load style `NEXT_PUBLIC_MAP_STYLE_URL`, mặc định là OpenFreeMap Liberty.
- Vẽ route GeoJSON và marker GeoJSON.
- Fit map vào bounds của route/marker.
- Giới hạn thao tác pan trong vùng Đông Nam Á (`95°E..141°E`, `11°S..25°N`) ở
  giai đoạn UI hiện tại.
- Hiển thị layer Traffic, Restrictions và Buildings.
- Chỉ hiển thị marker popup sau khi người dùng click marker; popup có shipment
  context và link mở shipment detail.
- Hiển thị loading state.
- Retry khi style không tải được.
- Fallback sang SVG khi WebGL2, style hoặc rendering không khả dụng.

Các biến môi trường liên quan:

```env
NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
NEXT_PUBLIC_MAPTILER_KEY=
```

`NEXT_PUBLIC_MAPTILER_KEY` chỉ cần khi muốn terrain RGB. Map nền OpenFreeMap
không yêu cầu MapTiler key trong cấu hình hiện tại.

### `LogisticsMap`

File chính: `src/components/common/logistics-map.tsx`

Đây là component SVG/CSS cũ. Nó vẫn được dùng bên trong
`SvgMapFallback` để giữ map tương tác khi MapLibre không thể render. Một số
màn hình customer portal cũng còn dùng trực tiếp component này vì đang giữ
`customer-safe` fixture cũ.

Không dùng `LogisticsMap` cho các dashboard map mới nếu mục tiêu là map tile
thật.

## Các màn hình phụ có map

Ngoài ba page chính ở trên, code hiện còn các consumer sau:

| Route | Mục đích | Component | Ghi chú |
| --- | --- | --- | --- |
| `/shipments/[shipmentId]/tracking` | Theo dõi một shipment cụ thể | `LogisticsGeoMap` | Có realtime fixture, deviation và last-known GPS |
| `/shipments/[shipmentId]` tab `Route` | Xem route trong shipment detail | `LogisticsGeoMap` | Dữ liệu GPS/route local |
| `/portal/shipments/[shipmentId]/tracking` | Customer xem milestone shipment | `LogisticsMap` | Customer-safe view, chưa chuyển sang map tile thật |

## Quy tắc khi tích hợp backend sau này

1. API/query hook lấy shipment, route và GPS phải nằm ở canonical data layer:
   `src/hooks/queries/<domain>/`, `src/api/services/` và `src/api/client/`.
2. Page chỉ truyền dữ liệu đã chuẩn hóa vào `LogisticsGeoMap`; không gọi Axios
   trực tiếp trong component map.
3. Backend coordinates phải map về contract:

   ```ts
   type GeoPoint = {
     longitude: number;
     latitude: number;
   };
   ```

4. `LogisticsGeoMap` chỉ xử lý render và interaction map. Business logic như
   accept route, review exception hoặc reconnect telemetry thuộc feature page
   và hook/store tương ứng.
5. Fixture phải được thay bằng query state trước khi gắn nhãn `live`,
   `current` hoặc `realtime` trong UI production.
