# J2ME Portal (Port 3000)

Dự án này tạo một **cổng giao diện đẹp** chạy trên port 3000, quét tất cả file `.jar` và chạy chúng bằng **iframe** nhúng emulator gốc (port 8080).

## Yêu cầu

- Node.js >= 18
- Server emulator gốc phải đang chạy ở **http://localhost:8080**

## Cấu trúc

```
j2me-portal/
├── server.js          # Server Express
├── package.json
└── public/
    └── index.html     # Giao diện chính (danh sách JAR + iframe)
```

## Cách chạy

### Bước 1: Chạy emulator gốc (port 8080)

Bạn cần chạy server emulator gốc trước (từ repo `test/java`):

```bash
cd /path/to/java
# Ví dụ: dùng Python hoặc bất kỳ server tĩnh nào
python -m http.server 8080
# hoặc
npx serve -p 8080
```

### Bước 2: Chạy Portal (port 3000)

```bash
cd j2me-portal
npm install
npm start
```

Truy cập: **http://localhost:3000**

## Tính năng

- Tự động quét tất cả file `.jar` trong thư mục `jar/`
- Giao diện hiện đại, responsive
- Nhấn vào game → mở **iframe** chạy emulator gốc
- Đóng modal bằng nút X hoặc phím ESC

## Tùy chỉnh

Bạn có thể thay đổi đường dẫn đến thư mục `jar` trong `server.js`:

```js
const JAVA_DIR = path.join(__dirname, '..', 'java'); // chỉnh ở đây
```

## Lưu ý

- Emulator gốc **phải** chạy ở port 8080 (vì iframe đang gọi `localhost:8080`)
- Nếu muốn chạy cả hai trên cùng một port, cần merge code (khó hơn)

## Phát triển tiếp

Nếu bạn muốn **nhúng toàn bộ logic emulator** vào port 3000 (không cần iframe), hãy cho tôi biết. Tôi sẽ tạo phiên bản không dùng iframe.