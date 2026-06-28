# J2ME Portal — Tách logic Mobile / PC

Kiến trúc đã được tách thành **3 tiến trình**, mỗi nền tảng có **logic server RIÊNG**
(không dùng chung logic), nhưng **dùng chung** kho `jar/` và `saves/`.

```
        ┌───────────────────────────┐
        │  server.js  (cổng 3000)   │  ROUTER — chỉ chuyển hướng (302)
        │  Nhận diện Mobile / PC    │
        └───────────┬───────────────┘
                    │
        ┌───────────┴───────────────┐
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│ mobie.js  :3001  │      │  pc.js   :3002   │
│ LOGIC MOBILE     │      │  LOGIC PC        │
│ (độc lập)        │      │  (độc lập)       │
└────────┬─────────┘      └────────┬─────────┘
         │   DÙNG CHUNG (đọc/ghi)  │
         └────────────┬────────────┘
                      ▼
            jar/   (kho game)
            saves/ (tiến trình lưu game)
```

## Frontend cũng tách riêng (giao diện / bàn phím ảo)

Trước đây cả 2 server dùng chung `public/index.html` + `patch_keymap_v7.js` với
nhiều đoạn "cố tương thích" (dò `@media`, `pointer:fine`, `ontouchstart`, tự xoay
màn hình…). Nay frontend đã tách:

| Server | Thư mục frontend | Đặc điểm |
|--------|------------------|----------|
| `mobie.js` (3001) | `public_mobile/` | Layout mobile gốc; bàn phím ảo **ở dưới** như cũ. `patch_keymap_v7.js` là **no-op** (bỏ toàn bộ code PC). |
| `pc.js` (3002) | `public_pc/` | Layout desktop **cố định** (keypad trái / màn hình phải), bàn phím ảo **luôn hiện**. **Bỏ** auto-rotate, **bỏ** dò touch, **bỏ** `@media` — không co giãn theo mobile. |

Đã loại các đoạn "cố tương thích" chéo:
- `pc.js`: bỏ cờ `?mobile=1` trong URL fallback.
- `public_pc/index.html`: bỏ `if ('ontouchstart'…) showGamepad()` → **luôn** `showGamepad()`;
  bỏ `startAutoRotate()` / `startAutoRotateInteractionWatch()` khi nạp game (nút xoay **tay** vẫn còn).
- `public_pc/patch_keymap_v7.js`: bỏ guard `if(!isPC)return` và bỏ `@media` →
  layout desktop áp dụng **vô điều kiện**.
- `public_mobile/patch_keymap_v7.js`: thay bằng file rỗng (mobile không dùng PC key-bridge).

> Thư mục `public/` cũ vẫn còn để tham khảo nhưng **không server nào dùng** nữa.
> Sửa giao diện Mobile → `public_mobile/`; sửa giao diện PC → `public_pc/`. Độc lập hoàn toàn.

## Quy tắc tách logic

- **`mobie.js`** và **`pc.js`** là **2 bản sao độc lập hoàn toàn**. Chúng KHÔNG
  `require` lẫn nhau và KHÔNG `require` một module logic chung nào. Bạn có thể
  viết lại gần như toàn bộ logic của một nền tảng mà **không làm nền tảng kia bị lỗi**.
- **`server.js`** (cổng 3000) KHÔNG còn chứa logic game. Nhiệm vụ duy nhất là
  **nhận diện** client (Mobile/PC) và **chuyển hướng** sang đúng cổng.
- **`jar/`** và **`saves/`** được **dùng chung** (cả hai server trỏ vào cùng thư
  mục `java/` qua `__dirname`), nên game và tiến trình lưu giống nhau ở 2 nền tảng.

## Nhận diện nền tảng (ở server.js)

1. `?platform=mobile` hoặc `?platform=pc` — ép buộc (đồng thời ghi cookie `platform`).
2. Cookie `platform=mobile|pc` — đã ép trước đó.
3. **User-Agent** — mặc định (Android/iPhone/Mobile/Nokia/… → mobile; còn lại → pc).

Debug nhanh: `GET http://localhost:3000/__whoami`

## Cách chạy

### Chạy cả 3 cùng lúc
```bash
npm install
npm start          # = node start_all.js  (mobie 3001 + pc 3002 + router 3000)
```

### Hoặc chạy riêng từng tiến trình
```bash
npm run start:mobile   # node mobie.js  -> http://localhost:3001
npm run start:pc       # node pc.js     -> http://localhost:3002
npm run start:router   # node server.js -> http://localhost:3000
```

Truy cập **http://localhost:3000** → tự chuyển hướng đúng nền tảng.

## Build / kiểm thử

```bash
npm run build      # = node build_check.js
```

`build_check.js` sẽ:
1. Kiểm tra cú pháp (build thử) cả 4 file.
2. Khẳng định `mobie.js` & `pc.js` **không dùng chung logic** (không cross-require,
   không cùng import module nội bộ nào).
3. Khẳng định `server.js` là **router thuần** (không còn `/api/jars`, `/api/launch`,
   `gameRegistry`, …).
4. Khẳng định `jar/` & `saves/` **dùng chung**.
5. Smoke test: bật cả 3 server và kiểm tra redirect + `/api/platform`.

## Sửa logic cho riêng một nền tảng

- Muốn đổi logic **Mobile** → chỉ sửa **`mobie.js`**.
- Muốn đổi logic **PC** → chỉ sửa **`pc.js`**.
- Hai file độc lập nên sửa một bên KHÔNG ảnh hưởng bên kia.
- Cấu hình cổng/host của router qua biến môi trường nếu cần:
  `MOBILE_PORT`, `PC_PORT`, `MOBILE_HOST`, `PC_HOST`, `ROUTER_PORT`.
