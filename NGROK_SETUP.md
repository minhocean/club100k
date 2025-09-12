# Hướng dẫn Public ứng dụng Next.js với ngrok

## Tổng quan
Hướng dẫn này sẽ giúp bạn public ứng dụng Next.js lên HTTPS thông qua ngrok tunnel.

## Bước 1: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
# Strava API Configuration
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
STRAVA_STATE_SECRET=your_random_state_secret_here
STRAVA_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here

# App Base URL - Sử dụng ngrok URL
NEXT_PUBLIC_APP_BASE_URL=https://f22eb41bb6df.ngrok-free.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Bước 2: Cập nhật Strava App Settings

1. Đăng nhập vào [Strava API Settings](https://www.strava.com/settings/api)
2. Cập nhật **Authorization Callback Domain**: `f22eb41bb6df.ngrok-free.app`
3. Cập nhật **Webhook URL**: `https://f22eb41bb6df.ngrok-free.app/api/strava/webhook`

## Bước 3: Cập nhật Supabase Settings (nếu có)

1. Vào Supabase Dashboard → Settings → API
2. Cập nhật **Site URL**: `https://f22eb41bb6df.ngrok-free.app`
3. Thêm **Redirect URLs**:
   - `https://f22eb41bb6df.ngrok-free.app/auth/callback`
   - `https://f22eb41bb6df.ngrok-free.app/api/strava/callback`

## Bước 4: Khởi động ứng dụng

### Cách 1: Sử dụng script tự động (Windows)
```bash
start-with-ngrok.bat
```

### Cách 2: Sử dụng script tự động (Linux/Mac)
```bash
chmod +x start-with-ngrok.sh
./start-with-ngrok.sh
```

### Cách 3: Sử dụng npm script
```bash
npm run dev:ngrok
```

### Cách 4: Khởi động thủ công

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
ngrok http 3000
```

## Bước 5: Kiểm tra kết nối

1. Mở browser và truy cập: `https://f22eb41bb6df.ngrok-free.app`
2. Kiểm tra console để đảm bảo không có lỗi
3. Test các chức năng Strava OAuth

## Lưu ý quan trọng

1. **URL ngrok thay đổi**: Mỗi lần khởi động lại ngrok, URL sẽ thay đổi. Cần cập nhật lại:
   - `.env.local` file
   - Strava App settings
   - Supabase settings

2. **Ngrok Free Plan**: Có giới hạn về bandwidth và số lượng requests

3. **Security**: Ngrok URL có thể được truy cập bởi bất kỳ ai. Không sử dụng cho production.

4. **HTTPS**: Ngrok tự động cung cấp HTTPS certificate

## Troubleshooting

### Lỗi CORS
- Kiểm tra cấu hình trong `next.config.js`
- Đảm bảo `NEXT_PUBLIC_APP_BASE_URL` đúng

### Lỗi Strava OAuth
- Kiểm tra **Authorization Callback Domain** trong Strava settings
- Đảm bảo URL callback đúng format

### Lỗi Supabase
- Kiểm tra **Site URL** và **Redirect URLs** trong Supabase settings
- Đảm bảo environment variables đúng

## Cập nhật URL mới

Khi ngrok tạo URL mới:

1. Cập nhật `NEXT_PUBLIC_APP_BASE_URL` trong `.env.local`
2. Cập nhật Strava App settings
3. Cập nhật Supabase settings
4. Restart ứng dụng
