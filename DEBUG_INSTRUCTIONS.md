# Hướng dẫn Debug Strava Authentication

## Vấn đề
Khi bấm vào nút "Kết nối Strava" nhưng trên trình duyệt lại hiển thị "chưa kết nối".

## Các bước debug đã thực hiện

### 1. Thêm logging chi tiết
- ✅ Thêm debug logging vào `components/StravaConnect.js`
- ✅ Thêm debug logging vào `app/api/strava/status/route.js`
- ✅ Thêm debug logging vào `app/api/strava/start/route.js`
- ✅ Tạo component `DebugInfo.js` để hiển thị thông tin debug trên giao diện

### 2. Cách chạy debug

#### Windows:
```bash
# Chạy script debug
start-debug.bat

# Hoặc chạy trực tiếp
npm run dev
```

#### Linux/Mac:
```bash
# Chạy script debug
./start-debug.sh

# Hoặc chạy trực tiếp
npm run dev
```

### 3. Cách kiểm tra debug

1. **Mở trình duyệt** và truy cập ứng dụng
2. **Mở Developer Tools** (F12)
3. **Vào tab Console** để xem các log debug
4. **Kiểm tra component DebugInfo** ở đầu trang để xem thông tin chi tiết

### 4. Các log quan trọng cần kiểm tra

#### Frontend (Browser Console):
- `[DEBUG] Starting checkStravaStatus...`
- `[DEBUG] Session data:` - Kiểm tra có session không
- `[DEBUG] Token present:` - Kiểm tra có token không
- `[DEBUG] Strava status check result:` - Kết quả từ API status

#### Backend (Terminal):
- `[STRAVA_STATUS] ===== STATUS CHECK STARTED =====`
- `[STRAVA_STATUS] Access token present:` - Kiểm tra token có được truyền không
- `[STRAVA_STATUS] User ID found:` - Kiểm tra có tìm thấy user ID không
- `[STRAVA_STATUS] Connection found:` - Kiểm tra có kết nối Strava trong DB không

### 5. Các vấn đề có thể gặp

#### A. Không có token
- **Triệu chứng**: `Token present: false`
- **Nguyên nhân**: Chưa đăng nhập hoặc session hết hạn
- **Giải pháp**: Đăng nhập lại

#### B. Không tìm thấy user ID
- **Triệu chứng**: `No user ID found after all attempts`
- **Nguyên nhân**: Token không hợp lệ hoặc JWT decode lỗi
- **Giải pháp**: Kiểm tra JWT fallback function

#### C. Không có kết nối Strava trong DB
- **Triệu chứng**: `No connection found for user`
- **Nguyên nhân**: Chưa kết nối Strava hoặc lưu vào DB thất bại
- **Giải pháp**: Thử kết nối Strava lại

#### D. Token Strava hết hạn
- **Triệu chứng**: `Token expired`
- **Nguyên nhân**: Token Strava đã hết hạn
- **Giải pháp**: Kết nối lại Strava

### 6. Kiểm tra database

```sql
-- Kiểm tra bảng strava_connections
SELECT * FROM strava_connections;

-- Kiểm tra user hiện tại
SELECT * FROM auth.users;
```

### 7. Test thủ công

1. **Test API status trực tiếp**:
```bash
curl "http://localhost:3000/api/strava/status?sb=YOUR_TOKEN"
```

2. **Test API start**:
```bash
curl "http://localhost:3000/api/strava/start?sb=YOUR_TOKEN"
```

### 8. Environment variables cần kiểm tra

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REDIRECT_URI`
- `STRAVA_STATE_SECRET`

## Kết quả mong đợi

Sau khi chạy debug, bạn sẽ thấy:
1. **Console logs** chi tiết về quá trình xác thực
2. **DebugInfo component** hiển thị thông tin session và API response
3. **Terminal logs** từ backend API

Dựa vào các log này, chúng ta có thể xác định chính xác vấn đề ở đâu trong quá trình xác thực Strava.

