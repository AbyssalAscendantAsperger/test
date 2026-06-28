/**
 * KEYMAP PATCH — MOBILE (no-op)
 * ----------------------------------------------------------------------------
 * Frontend MOBILE KHÔNG dùng PC key-bridge. Bản gốc patch_keymap_v7.js là code
 * RIÊNG cho PC (đã tự tắt trên mobile bằng "if(!isPC)return"). Để tách hẳn logic,
 * frontend mobile dùng file rỗng này — giữ nguyên input gốc 1155ad0, chạy mượt
 * Mode4 (freej2me-web) trên Android/iOS, không có nhánh tương thích PC nào.
 */
(function(){
  'use strict';
  console.log('%c[Keymap MOBILE] dùng input gốc (không PC key-bridge)', 'color:#fa0');
})();
