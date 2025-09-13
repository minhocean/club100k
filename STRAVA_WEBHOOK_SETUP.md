# Hướng dẫn thiết lập Strava Webhook cho đồng bộ hoạt động real-time

## Tổng quan
Webhook Strava cho phép ứng dụng nhận thông báo ngay lập tức khi vận động viên hoàn thành hoạt động mới. Hoạt động sẽ được tự động đồng bộ vào cơ sở dữ liệu với validation pace và khoảng cách.

## Các tính năng đã triển khai

### 1. Webhook Endpoint (`/api/strava/webhook`)
- **GET**: Xác thực webhook với Strava (hub.challenge)
- **POST**: Nhận và xử lý sự kiện hoạt động mới
- Tự động refresh token khi hết hạn
- Validation hoạt động theo tiêu chí: Pace 3-13 phút/km, khoảng cách 3-15km
- Lưu thông báo real-time vào bảng `activity_notifications`

### 2. Notifications API (`/api/notifications`)
- **GET**: Lấy danh sách thông báo của user
- **POST**: Đánh dấu thông báo đã đọc
- Hỗ trợ phân trang và lọc thông báo chưa đọc

### 3. Webhook Setup API (`/api/strava/webhook-setup`)
- **GET**: Kiểm tra trạng thái webhook subscription
- **POST**: Tạo webhook subscription mới
- **DELETE**: Xóa webhook subscription
- Tự động quản lý webhook với Strava API

### 4. Activity Notifications Component
- Hiển thị thông báo real-time trong UI
- Đếm số thông báo chưa đọc
- Đánh dấu đã đọc khi click

## Thiết lập Webhook với Strava

### Cách 1: Sử dụng giao diện ứng dụng (Khuyến nghị)
1. Đăng nhập vào ứng dụng
2. Kết nối với Strava
3. Trong phần "Thiết lập Webhook Real-time", click "⚙️ Thiết lập webhook"
4. Ứng dụng sẽ tự động tạo webhook subscription với Strava

### Cách 2: Sử dụng API trực tiếp
Sử dụng Strava API để tạo webhook subscription:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "callback_url=https://your-domain.vercel.app/api/strava/webhook" \
  -d "verify_token=YOUR_WEBHOOK_VERIFY_TOKEN"
```

### Bước 2: Cấu hình Environment Variables
Đảm bảo các biến môi trường sau được thiết lập:

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_WEBHOOK_VERIFY_TOKEN=your_verify_token
NEXT_PUBLIC_APP_BASE_URL=https://your-domain.vercel.app
```

### Bước 3: Tạo bảng Notifications
Chạy script SQL để tạo bảng thông báo:

```sql
-- Chạy file: database/create_activity_notifications_table.sql
```

### Bước 4: Test Webhook
Strava sẽ gửi một GET request để xác thực webhook. Sau đó, mỗi khi có hoạt động mới, Strava sẽ gửi POST request với thông tin hoạt động.

## Cấu trúc dữ liệu

### Webhook Event (POST body từ Strava)
```json
{
  "object_type": "activity",
  "object_id": 123456789,
  "aspect_type": "create",
  "owner_id": 987654321,
  "updates": {}
}
```

### Activity Data được lưu
- Tất cả thông tin hoạt động từ Strava API
- Validation kết quả (`is_valid`)
- Pace và khoảng cách đã tính toán
- Timestamp đồng bộ

### Notification Data
```json
{
  "user_id": "uuid",
  "athlete_id": 987654321,
  "activity_id": 123456789,
  "activity_name": "Morning Run",
  "distance_km": 5.2,
  "pace_min_per_km": 4.5,
  "is_valid": true,
  "created_at": "2024-01-01T10:00:00Z"
}
```

## Monitoring và Debug

### Logs quan trọng
- `[STRAVA_WEBHOOK]` - Logs từ webhook endpoint
- `[STRAVA_WEBHOOK] Activity X: Pace=Y min/km, Distance=Z km, Valid=boolean`
- `[STRAVA_WEBHOOK] Successfully synced activity X for athlete Y`

### Kiểm tra hoạt động
1. Mở `/api/strava/webhook` trong browser để test GET endpoint
2. Kiểm tra logs trong Vercel dashboard
3. Xem thông báo trong UI component

## Troubleshooting

### Webhook không nhận được sự kiện
1. Kiểm tra URL callback có đúng không
2. Xác nhận webhook subscription còn active
3. Kiểm tra logs server có lỗi không

### Token hết hạn
- Webhook tự động refresh token khi cần
- Kiểm tra `strava_connections` table có refresh_token hợp lệ

### Validation không đúng
- Kiểm tra logic validation trong `validateActivity()`
- Pace = thời gian (phút) / khoảng cách (km)
- Tiêu chí: Pace 3-13 phút/km, khoảng cách 3-15km

## Bảo mật
- Webhook endpoint được bảo vệ bằng verify_token
- RLS (Row Level Security) trên bảng notifications
- User chỉ xem được thông báo của mình
