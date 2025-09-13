# Hướng dẫn thiết lập Environment Variables

## Vấn đề hiện tại
Ứng dụng không thể chạy vì thiếu các environment variables cần thiết.

## Các bước thiết lập

### 1. Tạo file .env.local
Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Strava API Configuration
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
STRAVA_STATE_SECRET=your_random_secret_key_here

# App Configuration
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000

# Optional: Webhook Configuration
STRAVA_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
```

### 2. Lấy thông tin Supabase
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào Settings > API
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Lấy thông tin Strava API
1. Đăng nhập vào [Strava API Settings](https://www.strava.com/settings/api)
2. Tạo ứng dụng mới hoặc sử dụng ứng dụng hiện có
3. Copy:
   - `Client ID` → `STRAVA_CLIENT_ID`
   - `Client Secret` → `STRAVA_CLIENT_SECRET`
   - `Authorization Callback Domain` → `STRAVA_REDIRECT_URI`

### 4. Tạo STATE_SECRET
Tạo một chuỗi ngẫu nhiên mạnh cho `STRAVA_STATE_SECRET`:
```bash
# Trên Linux/Mac
openssl rand -hex 32

# Hoặc sử dụng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Kiểm tra thiết lập
Sau khi tạo file `.env.local`, chạy:
```bash
node test-strava-flow.js
```

Nếu thành công, bạn sẽ thấy:
```
✅ All environment variables present
✅ Supabase connection successful
✅ Status endpoint responds: ...
```

### 6. Chạy ứng dụng
```bash
# Windows
start-debug.bat

# Linux/Mac
./start-debug.sh

# Hoặc
npm run dev
```

## Lưu ý quan trọng
- **KHÔNG** commit file `.env.local` vào git
- File `.env.local` đã được thêm vào `.gitignore`
- Chỉ sử dụng file `.env.example` để chia sẻ cấu trúc

## Troubleshooting

### Lỗi "Missing environment variables"
- Kiểm tra file `.env.local` có tồn tại không
- Kiểm tra tên biến có đúng không (phân biệt hoa thường)
- Restart terminal sau khi tạo file

### Lỗi "Supabase connection error"
- Kiểm tra URL và key Supabase
- Kiểm tra kết nối internet
- Kiểm tra project Supabase có active không

### Lỗi "Strava API error"
- Kiểm tra Client ID và Secret
- Kiểm tra Redirect URI có đúng không
- Kiểm tra ứng dụng Strava có được approve không

