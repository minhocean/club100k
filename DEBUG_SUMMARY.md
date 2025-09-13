# Tóm tắt Debug Strava Authentication

## Vấn đề ban đầu
Khi bấm vào nút "Kết nối Strava" nhưng trên trình duyệt lại hiển thị "chưa kết nối".

## Các bước đã thực hiện

### 1. ✅ Phân tích luồng xác thực
- Xem xét `components/StravaConnect.js` - component frontend
- Xem xét `app/api/strava/start/route.js` - API khởi tạo OAuth
- Xem xét `app/api/strava/callback/route.js` - API xử lý callback
- Xem xét `app/api/strava/status/route.js` - API kiểm tra trạng thái

### 2. ✅ Thêm logging chi tiết
- **Frontend**: Thêm debug logs vào `StravaConnect.js`
  - Log session data và token
  - Log kết quả API calls
  - Log quá trình xử lý kết nối

- **Backend**: Thêm debug logs vào các API routes
  - `status/route.js`: Log chi tiết quá trình kiểm tra trạng thái
  - `start/route.js`: Log quá trình khởi tạo OAuth
  - `callback/route.js`: Đã có logging sẵn

### 3. ✅ Tạo component debug
- Tạo `components/DebugInfo.js` để hiển thị thông tin debug trên giao diện
- Hiển thị session info, API responses, và timestamp
- Thêm vào `app/page.js` để hiển thị khi user đã đăng nhập

### 4. ✅ Sửa lỗi environment variables
- Phát hiện file `.env.local` có format không đúng
- Tạo script `fix-env.js` để sửa file environment
- Sửa `STRAVA_REDIRECT_URI` từ cloudflare URL về localhost
- Đổi `NODE_ENV` từ production về development

### 5. ✅ Tạo tools debug
- `check-setup.js`: Kiểm tra thiết lập môi trường
- `test-strava-flow.js`: Test toàn bộ luồng xác thực
- `debug-strava.js`: Script debug cơ bản
- `start-debug.bat/.sh`: Scripts chạy với debug logging

### 6. ✅ Tạo documentation
- `DEBUG_INSTRUCTIONS.md`: Hướng dẫn debug chi tiết
- `ENVIRONMENT_SETUP.md`: Hướng dẫn thiết lập môi trường
- `DEBUG_SUMMARY.md`: Tóm tắt này

## Cách sử dụng debug

### 1. Chạy ứng dụng với debug
```bash
# Windows
start-debug.bat

# Linux/Mac
./start-debug.sh

# Hoặc
npm run dev
```

### 2. Kiểm tra logs
- **Browser Console**: Mở F12 > Console để xem frontend logs
- **Terminal**: Xem backend logs trong terminal chạy `npm run dev`
- **DebugInfo Component**: Xem thông tin debug trên trang web

### 3. Các log quan trọng cần theo dõi

#### Frontend (Browser Console):
```
[DEBUG] Starting checkStravaStatus...
[DEBUG] Session data: {...}
[DEBUG] Token present: true/false
[DEBUG] Strava status check result: {...}
```

#### Backend (Terminal):
```
[STRAVA_STATUS] ===== STATUS CHECK STARTED =====
[STRAVA_STATUS] Access token present: true/false
[STRAVA_STATUS] User ID found: xxx
[STRAVA_STATUS] Connection found: {...}
```

## Kết quả mong đợi

Sau khi chạy debug, bạn sẽ thấy:
1. **Console logs** chi tiết về quá trình xác thực
2. **DebugInfo component** hiển thị thông tin session và API response
3. **Terminal logs** từ backend API

Dựa vào các log này, có thể xác định chính xác vấn đề:
- Không có token → Cần đăng nhập lại
- Không tìm thấy user ID → Lỗi JWT decode
- Không có kết nối Strava → Cần kết nối Strava
- Token hết hạn → Cần kết nối lại Strava

## Files đã tạo/sửa

### Files mới:
- `components/DebugInfo.js`
- `debug-strava.js`
- `test-strava-flow.js`
- `check-setup.js`
- `fix-env.js`
- `start-debug.bat`
- `start-debug.sh`
- `DEBUG_INSTRUCTIONS.md`
- `ENVIRONMENT_SETUP.md`
- `DEBUG_SUMMARY.md`

### Files đã sửa:
- `components/StravaConnect.js` - Thêm debug logging
- `app/api/strava/status/route.js` - Thêm debug logging
- `app/api/strava/start/route.js` - Thêm debug logging
- `app/page.js` - Thêm DebugInfo component
- `.env.local` - Sửa format và URLs

## Bước tiếp theo

1. **Chạy ứng dụng**: `npm run dev`
2. **Mở browser**: http://localhost:3000
3. **Kiểm tra logs**: F12 > Console
4. **Thử kết nối Strava** và xem DebugInfo component
5. **Theo dõi terminal logs** để xem backend processing

Với tất cả các tools debug này, bạn có thể dễ dàng xác định và sửa lỗi trong quá trình xác thực Strava.

