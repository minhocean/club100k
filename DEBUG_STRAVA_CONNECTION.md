# Debug Strava Connection Issue

## Vấn đề hiện tại
Khi bấm nút "Kết nối Strava", quá trình xác thực hoàn thành nhưng UI vẫn hiển thị "Chưa kết nối".

## Các bước debug

### 1. Kiểm tra cấu hình
Truy cập: `https://your-domain.com/api/debug-config`

Kiểm tra:
- `REDIRECT_URI` phải là: `https://your-domain.com/api/strava/callback`
- `CLIENT_ID` phải khớp với Strava app settings

### 2. Kiểm tra Strava App Settings
1. Đăng nhập vào https://www.strava.com/settings/api
2. Kiểm tra "Authorization Callback Domain" phải là domain của bạn (không có https://)
3. Kiểm tra "Website" URL

### 3. Test callback URL trực tiếp
Truy cập: `https://your-domain.com/api/test-callback`

Nếu thấy response JSON, callback endpoint hoạt động.

### 4. Kiểm tra logs
Sau khi bấm "Kết nối Strava", kiểm tra terminal logs để xem:
- `[STRAVA_START]` logs
- `[STRAVA_CALLBACK]` logs (nếu có)
- `[STRAVA_STATUS]` logs

### 5. Kiểm tra database
Chạy script: `node test-strava-connection.js`

## Các vấn đề có thể xảy ra

### A. Callback URL không đúng
**Triệu chứng**: Không thấy `[STRAVA_CALLBACK]` logs
**Giải pháp**: 
1. Cập nhật Strava app settings với đúng callback URL
2. Đảm bảo URL format: `https://your-domain.com/api/strava/callback`

### B. Callback được gọi nhưng lỗi
**Triệu chứng**: Thấy `[STRAVA_CALLBACK]` logs nhưng có lỗi
**Giải pháp**: Kiểm tra logs để xem lỗi cụ thể

### C. Callback thành công nhưng UI không cập nhật
**Triệu chứng**: Thấy `[STRAVA_CALLBACK] Connection saved successfully` nhưng UI vẫn "Chưa kết nối"
**Giải pháp**: Kiểm tra trang stats có detect URL parameters không

## Test thủ công

1. Bấm "Kết nối Strava"
2. Hoàn thành xác thực trên Strava
3. Kiểm tra URL sau khi redirect (phải có `?strava_connected=1`)
4. Kiểm tra console logs trong browser
5. Kiểm tra terminal logs

## Logs cần tìm

### Thành công:
```
[STRAVA_START] redirecting to authorizeUrl = ...
[STRAVA_CALLBACK] ===== CALLBACK RECEIVED =====
[STRAVA_CALLBACK] Connection saved successfully
Stats page - Strava connection successful, refreshing status...
Stats page - Refreshing status after callback
[STRAVA_STATUS] Connection found: ...
```

### Thất bại:
```
[STRAVA_CALLBACK] Error: ...
Stats page - Strava connection error: ...
```
