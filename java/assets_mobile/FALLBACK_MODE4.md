# Mode 4 fallback (freej2me-web)

## Đã triển khai
- Thêm option `enginemode4-freej2me-web` trong UI.
- `/api/launch` tự động tạo bundle fallback nếu chưa có.
- Bundle được đặt tại `java/web/apps/[appId].zip`.
- `gameId -> appId` hiện map theo quy tắc an toàn:
  - giữ nguyên `gameId`
  - thay ký tự ngoài `[A-Za-z0-9_-]` thành `_`
- Nếu bundle tồn tại, mode 4 mở:
  - `/web/run.html?app=[appId]&mobile=1&fractionScale=1`

## Save/load
Theo quyết định hiện tại: **mỗi mode tự lưu kiểu save riêng**, không đồng bộ save giữa engine cũ và freej2me-web.

## Lưu ý tương thích môi trường
Bundle fallback hiện được tạo hoàn toàn bằng Node.js thuần ngay trong `server.js`, không phụ thuộc shell, `zip`, Docker hay Python ngoài runtime server. Vì vậy khi bạn clone repo về, chọn mode 4 sẽ không còn lỗi kiểu `Không thể tạo fallback bundle` do thiếu công cụ hệ thống.

## API mới
### 1) Kiểm tra bundle fallback
`GET /api/fallback/status?id=<gameId>`

Ví dụ phản hồi:
```json
{
  "ok": true,
  "gameId": "gf0ad55c9fdba8b",
  "appId": "gf0ad55c9fdba8b",
  "bundlePath": "/abs/path/to/java/web/apps/gf0ad55c9fdba8b.zip",
  "exists": true
}
```

### 2) Tạo bundle fallback thủ công
`POST /api/fallback/prepare?id=<gameId>`

## CLI pipeline
### Chuẩn bị 1 game
```bash
cd java
npm run prepare:fallback -- <gameId>
```

Ví dụ:
```bash
npm run prepare:fallback -- gf0ad55c9fdba8b
```

### Kết quả
Tạo file:
```bash
java/web/apps/gf0ad55c9fdba8b.zip
```

## Cấu trúc bundle đang tạo
Bundle hiện có dạng ZIP gồm:
- `app.jar`
- `settings.txt`
- `name.txt`
- `id.txt`

Ví dụ `settings.txt`:
```txt
width:240
height:320
phone:Nokia
```

## Test đã xác nhận
Với game mẫu `gf0ad55c9fdba8b`:
- `/api/fallback/status?id=gf0ad55c9fdba8b` -> `200`
- `/api/fallback/prepare?id=gf0ad55c9fdba8b` -> `200`
- `/api/launch?id=gf0ad55c9fdba8b&enginemode=enginemode4-freej2me-web` -> trả URL `run.html?app=gf0ad55c9fdba8b`
- `/web/run.html?app=gf0ad55c9fdba8b&mobile=1&fractionScale=1` -> `200`
- `/web/apps/gf0ad55c9fdba8b.zip` với header `Range` -> `206 Partial Content`

## Ghi chú quan trọng
- Điều đã được xác nhận là **pipeline và đường dẫn mode 4 chạy thật**.
- Độ tương thích nội dung bundle với mọi game còn phụ thuộc freej2me-web chấp nhận bundle tối thiểu này đến đâu.
- Nếu một game cần cấu hình sâu hơn, có thể cần mở rộng `settings.txt` hoặc thêm dữ liệu app-specific sau này.
