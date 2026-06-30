# FreeJ2ME (Patched Source & Built JAR - Java 8 Mode)

Khôi phục toàn bộ mã nguồn đã patch từ tệp `freej2me.txt` kết hợp với repository gốc `TASEmulators/freej2me-plus`.
**ĐẶC BIỆT LƯU Ý:** Bản build này được chuẩn hóa tuyệt đối cho **Java 8 (Bytecode Major Version 52.0)** để tương thích 100% với trình giả lập trình duyệt **CheerpJ** ở chế độ Java 8.

## Nội dung gói
- **`build/freej2me.jar`**: Tệp JAR biên dịch chuẩn Java 8 version 52.0 (không bị lỗi `cheerpjRunMain failed Required Java version 11...`).
- **`src/`**: Mã nguồn Java đầy đủ đã tích hợp các bản vá (`--web` mode, CheerpJ Mode 5 bridge, WASD & Keymap bridge, xử lý lỗi màn hình Canvas...).
- **`resources/NOTE_JAVA8_BUILD.txt`**: Ghi chú lưu ý build bằng Java 8 được đính kèm trực tiếp trong tài nguyên của tệp JAR.
- **`build.sh`**: Script tự động hóa build nhanh bằng bash (sử dụng cờ `--release 8` đảm bảo đầu ra luôn là Java 8 dù bạn chạy trên JDK 11, 17 hay 21).
- **`build.xml`**: Cấu trúc build cho Apache Ant (đã cập nhật `source="1.8"` và `target="1.8"`).

## Kiểm chứng Chức năng & Bytecode
1. Kiểm tra phiên bản class file: `major version: 52` (Java 8).
2. Thông báo lõi định danh:
```text
==================================================================================
[ARENA-V8-FINAL] DEFINITIVE CORE V8 (ZERO LAG + WASD + KEYMAP BRIDGE) LOADED!
==================================================================================
```
