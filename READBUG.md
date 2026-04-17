# READBUG — Hướng dẫn Debug chi tiết

Tài liệu này mô tả cách sử dụng trang debug ([pages/debug.html](pages/debug.html)) để hỗ trợ phát triển, kiểm tra dữ liệu và khắc phục sự cố. Nội dung gồm: mục đích, mô tả UI, các lệnh/đoạn mã hay dùng, ví dụ thực tế, sao lưu/khôi phục dữ liệu và các lưu ý an toàn.

---

## 1. Mục đích
- Cung cấp một UI nội bộ cho đội hỗ trợ và dev: xem/tương tác với `localStorage`, gọi các hàm quản lý dữ liệu (persist, sync, init), chạy đoạn JS tùy ý để truy vấn hoặc sửa trạng thái runtime.
- Hữu ích để tái tạo lỗi, export/import dữ liệu, thực hiện thao tác khôi phục nhanh hoặc test script nhỏ khi không muốn vào DevTools từng mục.

## 2. Yêu cầu / Quyền truy cập
- Trang nằm ở `pages/debug.html`. Hãy đảm bảo trang này chỉ có thể truy cập bởi người có quyền (dev/staging/admin). Không để công khai trên production.
- Trước khi thực hiện thay đổi dữ liệu: luôn backup `localStorage` (xem phần sao lưu).

## 3. Mô tả UI (các nút chính)
- Show localStorage: in toàn bộ key/value hiện có trong `localStorage` (cố gắng JSON.parse value nếu có thể). Dùng để rà soát các key app lưu.
- List storage keys: chỉ hiện tên các key trong `localStorage`.
- Show Admin state: cố gắng in `window.AdminState` hoặc `AdminModules.state.getState()` nếu app đặt state ở đó.
- Show Auth users: cố gắng gọi `Auth.getUsers()` nếu API `Auth` tồn tại; nếu không thì cố gắng đọc từ các key phổ biến (`users`, `AUTH_USERS`).
- Call persistAll(): gọi `persistAll()` nếu có; hoặc `AdminModules.storage.persistAll()` nếu được cài.
- Call syncUsersToAuthStore(): gọi hàm đồng bộ danh sách users từ admin store sang Auth store (tùy triển khai).
- Run data-init(): chạy các initializer như `loadAllData()` / `initData()` / `Data.init()` nếu tồn tại — dùng để tái tạo trạng thái bắt đầu.
- Export storage: mở tab mới chứa dump JSON của `localStorage` để copy/download.
- Clear localStorage: xóa toàn bộ `localStorage` (có confirm). Rất nguy hiểm — backup trước.
- Reload page: tải lại trang hiện tại.
- Run (JS): ô nhập cho phép chạy bất kỳ đoạn JS nào bằng `eval`. Dùng để thực thi snippet nhanh (xem các ví dụ).

## 4. Nguyên tắc an toàn
- Tuyệt đối KHÔNG chạy đoạn mã copy-paste từ nguồn không tin cậy trong ô Run (dùng `eval`).
- Trước thao tác destructive (xóa, overwrite): luôn backup `localStorage` bằng Export.
- Hạn chế truy cập: giới hạn trang debug cho dev/support (bằng route protection hoặc password) trước khi deploy ra môi trường chung.

---

## 5. Những snippet hay dùng — theo mục đích

Lưu ý: chạy các đoạn dưới bằng cách paste vào ô "Run" trên `pages/debug.html`.

- A. Kiểm tra tổng quan storage

```js
// Dump toàn bộ localStorage thành object (đã parse nếu là JSON)
(function(){
  const dump = {};
  for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ dump[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ dump[k]=localStorage.getItem(k); } }
  dump;
})();
```

- B. Lấy danh sách users (Auth)

```js
// Nếu app có API Auth
if(window.Auth && typeof Auth.getUsers === 'function'){
  Auth.getUsers();
} else {
  JSON.parse(localStorage.getItem('users') || '[]');
}
```

- C. Gọi persistAll() và xác nhận

```js
if(typeof persistAll === 'function'){
  persistAll();
  'persistAll() called';
} else if(window.AdminModules && AdminModules.storage && typeof AdminModules.storage.persistAll === 'function'){
  AdminModules.storage.persistAll();
  'AdminModules.storage.persistAll() called';
} else 'persistAll not available';
```

- D. Đồng bộ users sang Auth store

```js
if(typeof syncUsersToAuthStore === 'function'){
  syncUsersToAuthStore();
  'syncUsersToAuthStore() called';
} else if(window.AdminModules && AdminModules.users && typeof AdminModules.users.syncUsersToAuthStore==='function'){
  AdminModules.users.syncUsersToAuthStore();
  'AdminModules.users.syncUsersToAuthStore() called';
} else 'sync function not found';
```

- E. Backup/export localStorage (mở tab chứa JSON)

```js
const dump = {};
for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ dump[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ dump[k]=localStorage.getItem(k); } }
const w = window.open('','_blank');
w.document.write('<pre>'+JSON.stringify(dump,null,2)+'</pre>');
'exported';
```

- F. Khôi phục (restore) từ JSON (CẢNH BÁO: ghi đè mọi key)

```js
// Giả sử bạn paste object JSON vào biến `payload` (ví dụ: copy từ Export)
// Example: const payload = { "users": [...], "JOBS_DATA": { ... } };
function restoreFromPayload(payload){
  if(!confirm('Restore localStorage from payload? This will overwrite matching keys.')) return 'cancelled';
  Object.keys(payload).forEach(k=>{
    try{ localStorage.setItem(k, typeof payload[k] === 'string' ? payload[k] : JSON.stringify(payload[k])); }
    catch(e){ console.error('setItem failed',k,e); }
  });
  'restored';
}

// usage: paste payload then call restoreFromPayload(payload)
```

- G. Tìm và xóa demo users tự động (ví dụ dựa trên email domain hoặc role)

```js
// WARNING: kiểm tra trước khi xóa
const removed = (function(){
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const keep = users.filter(u => !(u.email && (u.email.endsWith('@example.com') || u.email.indexOf('demo')>=0)));
  if(keep.length === users.length) return 'no demo found';
  localStorage.setItem('users', JSON.stringify(keep));
  return { before: users.length, after: keep.length };
})();
removed;
```

- H. Tìm user không có `id` (nguyên nhân dẫn đến `undefined` trong UI) và thêm id tạm

```js
const users = JSON.parse(localStorage.getItem('users')||'[]');
let changed=false;
users.forEach(function(u, idx){ if(!u.id){ u.id = Date.now() + idx; changed=true; } });
if(changed) localStorage.setItem('users', JSON.stringify(users));
changed ? users.filter(u=>u.id).slice(0,5) : 'no change';
```

- I. Gọi render lại bảng users hoặc job (nếu hàm tồn tại trong window)

```js
if(typeof renderUsers === 'function') renderUsers();
if(window.AdminModules && AdminModules.users && typeof AdminModules.users.renderUsers==='function') AdminModules.users.renderUsers();
if(typeof renderJobs === 'function') renderJobs();
```

---

## 6. Kịch bản ví dụ (end-to-end)

Ví dụ: Bạn muốn xóa tất cả tài khoản demo, đồng bộ thay đổi và xác nhận UI:

1) Export hiện trạng (bảo vệ): bấm **Export storage** và lưu file JSON.

2) Chạy snippet xóa demo users (phần G) trong ô Run.

3) Gọi `persistAll()` (phần C) để ghi thay đổi về storage chính (nếu app cần hàm này).

4) Gọi `syncUsersToAuthStore()` (phần D) để đồng bộ vào Auth store.

5) Gọi `renderUsers()` (phần I) để cập nhật UI admin.

6) Kiểm tra lại bằng **Show Auth users** và **Show localStorage**.

---

## 7. Troubleshooting thường gặp
- Lỗi: "Không xóa được user / undefined id": kiểm tra bằng snippet H — nhiều dữ liệu cũ không có trường `id`.
- Lỗi: Các hàm `persistAll`/`syncUsersToAuthStore` không tồn tại: nghĩa là phiên bản code hiện tại không triển khai helper này trong global scope; bạn có thể thao tác trực tiếp với `localStorage` hoặc gọi các factory tương ứng trong `AdminModules`.
- Lỗi: UI không phản ánh ngay thay đổi: gọi `renderUsers()` hoặc reload page.

---

## 8. Kiến nghị vận hành (best practices)
- Trước mọi thao tác destructive: export backup.
- Đặt route bảo vệ cho `pages/debug.html`, hoặc thêm xác thực (mật khẩu ngắn) cho staging.
- Ghi chép các bước fix (ví dụ: file `debug-log.txt`) để sau này có thể audit.
- Nếu thao tác thay đổi dữ liệu trên production, cân nhắc tạo migration script, không dùng `eval` manual.

---

## 9. File liên quan
- Debug page: [pages/debug.html](pages/debug.html)
- Tài liệu ngắn: [READDEBUG.md](READDEBUG.md)
- Tài liệu chi tiết (này): [READBUG.md](READBUG.md)

---

Nếu bạn muốn, tôi có thể:
- Thêm nút `Backup` (download file),
- Thêm modal xác thực (password) để mở `pages/debug.html`,
- Thêm preset buttons (ví dụ: "Remove demo users", "Fix missing ids") để thực thi các snippet an toàn.
