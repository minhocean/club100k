# Product Requirements Document (PRD)
## GeminiSport - Hệ thống Quản lý Hoạt động Thể thao tích hợp Strava

**Version:** 1.0  
**Ngày tạo:** 2025-01-27  
**Người tạo:** AI Assistant  
**Trạng thái:** Đang phát triển

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mục đích
GeminiSport là một ứng dụng web quản lý và theo dõi hoạt động thể thao của các vận động viên thông qua tích hợp với Strava API. Hệ thống cho phép:
- Kết nối tài khoản Strava của vận động viên
- Đồng bộ dữ liệu hoạt động từ Strava
- Validation và phân tích hoạt động dựa trên quy tắc nghiệp vụ
- Thống kê và báo cáo theo tháng
- Nhận thông báo real-time khi có hoạt động mới

### 1.2. Đối tượng sử dụng
- **Vận động viên:** Người dùng có tài khoản Strava, muốn theo dõi hoạt động của mình
- **Quản trị viên:** Quản lý và theo dõi hoạt động của nhiều vận động viên
- **Câu lạc bộ thể thao:** Theo dõi và quản lý hoạt động của các thành viên

### 1.3. Công nghệ sử dụng
- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **External API:** Strava API v3
- **Deployment:** Vercel (hoặc tương đương)

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Cấu trúc thư mục
```
geminisport/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── strava/               # Strava API endpoints
│   │   │   ├── start/            # OAuth initiation
│   │   │   ├── callback/         # OAuth callback handler
│   │   │   ├── status/           # Connection status check
│   │   │   ├── activities/       # Fetch activities from Strava
│   │   │   ├── athlete-activities/ # Get athlete-specific activities
│   │   │   ├── athlete-stats/    # Monthly statistics
│   │   │   ├── connections/      # Manage connections
│   │   │   ├── sync/             # Sync activities to DB
│   │   │   ├── sync-progress/    # Track sync progress
│   │   │   ├── webhook/          # Strava webhook receiver
│   │   │   ├── webhook-setup/    # Webhook configuration
│   │   │   ├── db-activities/    # Get activities from DB
│   │   │   └── update-athlete-names/ # Update athlete names
│   │   └── notifications/        # Activity notifications API
│   ├── auth/                     # Authentication pages
│   │   └── callback/              # OAuth callback
│   ├── stats/                     # Statistics page
│   ├── layout.js                  # Root layout
│   ├── page.js                    # Home page
│   └── globals.css                # Global styles
├── components/                    # React Components
│   ├── StravaConnect.js           # Strava connection UI
│   ├── AthleteStats.js            # Statistics display
│   ├── ActivityNotifications.js   # Notifications UI
│   ├── WebhookSetup.js            # Webhook setup UI
│   ├── LandingPage.js             # Landing page component
│   └── DebugInfo.js               # Debug information
├── lib/                           # Utility libraries
│   ├── supabase.js                # Supabase client
│   ├── supabaseAdmin.js           # Supabase admin client
│   ├── stravaEnv.js               # Strava environment config
│   └── jwtFallback.js             # JWT token fallback
├── database/                      # SQL migration scripts
│   ├── create_strava_activities_table.sql
│   ├── create_activity_notifications_table.sql
│   └── [other migration scripts]
└── public/                        # Static assets
```

### 2.2. Database Schema

#### 2.2.1. Bảng `strava_connections`
Lưu trữ thông tin kết nối Strava của người dùng:
- `user_id` (UUID): ID người dùng từ Supabase Auth
- `athlete_id` (BIGINT): ID vận động viên từ Strava
- `athlete_name` (TEXT): Tên vận động viên
- `profile_medium` (TEXT): URL ảnh đại diện nhỏ
- `profile_large` (TEXT): URL ảnh đại diện lớn
- `access_token` (TEXT): Access token từ Strava
- `refresh_token` (TEXT): Refresh token từ Strava
- `expires_at` (BIGINT): Thời gian hết hạn token (Unix timestamp)
- `connected_at` (TIMESTAMPTZ): Thời gian kết nối
- `updated_at` (TIMESTAMPTZ): Thời gian cập nhật cuối

#### 2.2.2. Bảng `strava_activities`
Lưu trữ dữ liệu hoạt động từ Strava:
- `id` (BIGSERIAL): Primary key
- `user_id` (UUID): ID người dùng
- `strava_activity_id` (BIGINT): ID hoạt động từ Strava
- `athlete_id` (BIGINT): ID vận động viên
- `name` (TEXT): Tên hoạt động
- `sport_type` (TEXT): Loại thể thao
- `activity_type` (TEXT): Loại hoạt động
- `distance` (DECIMAL(15,2)): Khoảng cách (mét)
- `moving_time` (INTEGER): Thời gian di chuyển (giây)
- `elapsed_time` (INTEGER): Thời gian tổng (giây)
- `total_elevation_gain` (DECIMAL(12,2)): Độ cao tích lũy (mét)
- `average_speed` (DECIMAL(12,2)): Tốc độ trung bình (m/s)
- `max_speed` (DECIMAL(12,2)): Tốc độ tối đa (m/s)
- `average_cadence` (DECIMAL(8,2)): Nhịp độ trung bình
- `average_watts` (DECIMAL(12,2)): Công suất trung bình
- `calories` (DECIMAL(12,2)): Calo tiêu thụ
- `start_date` (TIMESTAMPTZ): Thời gian bắt đầu (UTC)
- `start_date_local` (TEXT): Thời gian bắt đầu (local, format: YYYY-MM-DD HH:mm:ss)
- `end_date` (TIMESTAMPTZ): Thời gian kết thúc (UTC)
- `end_date_local` (TEXT): Thời gian kết thúc (local)
- `timezone` (TEXT): Múi giờ
- `utc_offset` (INTEGER): Offset UTC (giây)
- `location_city` (TEXT): Thành phố
- `location_state` (TEXT): Bang/Tỉnh
- `location_country` (TEXT): Quốc gia
- `start_latlng` (DECIMAL(12,8)[]): Tọa độ bắt đầu [lat, lng]
- `end_latlng` (DECIMAL(12,8)[]): Tọa độ kết thúc [lat, lng]
- `is_valid` (BOOLEAN): Hoạt động có hợp lệ không (dựa trên validation rules)
- `synced_at` (TIMESTAMPTZ): Thời gian đồng bộ
- `created_at` (TIMESTAMPTZ): Thời gian tạo
- `updated_at` (TIMESTAMPTZ): Thời gian cập nhật

**Constraints:**
- Unique constraint: `(user_id, strava_activity_id)`
- Foreign key: `user_id` references `auth.users(id)`

#### 2.2.3. Bảng `activity_notifications`
Lưu trữ thông báo hoạt động từ webhook:
- `id` (BIGSERIAL): Primary key
- `user_id` (UUID): ID người dùng
- `athlete_id` (BIGINT): ID vận động viên
- `activity_id` (BIGINT): ID hoạt động từ Strava
- `activity_name` (TEXT): Tên hoạt động
- `distance_km` (DECIMAL(10,2)): Khoảng cách (km)
- `pace_min_per_km` (DECIMAL(8,2)): Pace (phút/km)
- `is_valid` (BOOLEAN): Hoạt động có hợp lệ không
- `created_at` (TIMESTAMPTZ): Thời gian tạo
- `read_at` (TIMESTAMPTZ): Thời gian đọc (NULL nếu chưa đọc)

---

## 3. NGHIỆP VỤ CHÍNH

### 3.1. Authentication & Authorization

#### 3.1.1. Google OAuth Login
- Người dùng đăng nhập bằng tài khoản Google
- Sử dụng Supabase Auth với PKCE flow
- Redirect về `/auth/callback` sau khi đăng nhập thành công

#### 3.1.2. Strava OAuth Connection
**Flow:**
1. Người dùng click "Connect with Strava"
2. Hệ thống tạo state parameter với HMAC signature (chứa user_id, nonce, expiration)
3. Redirect đến Strava authorization page với:
   - `client_id`: Strava Client ID
   - `redirect_uri`: Callback URL
   - `scope`: `read,activity:read_all,profile:read_all`
   - `state`: Encoded state parameter
4. Strava redirect về `/api/strava/callback` với `code` và `state`
5. Hệ thống verify state parameter
6. Exchange `code` lấy `access_token` và `refresh_token`
7. Lưu thông tin connection vào `strava_connections` table
8. Redirect về `/stats` với success message

**Security:**
- State parameter có expiration (10 phút)
- HMAC signature để verify state integrity
- JWT fallback nếu Supabase auth fail

### 3.2. Activity Validation Rules

Hoạt động được coi là **hợp lệ** khi thỏa mãn TẤT CẢ các điều kiện sau:

1. **Loại hoạt động:** Chỉ tính `sport_type = 'Run'`
2. **Khoảng cách:** `3km <= distance <= 15km`
3. **Pace:** `3 phút/km <= pace <= 14 phút/km`
   - Công thức: `pace = (moving_time / 60) / (distance / 1000)`
4. **Khoảng cách tối thiểu:** `distance >= 3km`

**Lưu ý:**
- Hoạt động không hợp lệ vẫn được lưu vào database nhưng đánh dấu `is_valid = false`
- Chỉ hoạt động hợp lệ mới được tính vào thống kê

### 3.3. Statistics Calculation Rules

#### 3.3.1. Daily Cap Rule
- **Quy tắc:** Tổng khoảng cách trong một ngày được giới hạn tối đa **15km**
- **Áp dụng:** Chỉ áp dụng cho hoạt động hợp lệ (Run, 3-15km, pace 3-14)
- **Xử lý:** Nếu tổng khoảng cách trong ngày > 15km:
  - Chỉ tính 15km vào thống kê
  - Phân bổ đều cho các hoạt động trong ngày (nếu có nhiều hoạt động)

#### 3.3.2. Duplicate Detection
- **Quy tắc:** Phát hiện hoạt động trùng lặp trong cùng một ngày
- **Tiêu chí:** Hoạt động có cùng:
  - Khoảng cách (làm tròn 2 chữ số thập phân)
  - Pace (làm tròn 1 chữ số thập phân)
  - Thời gian (moving_time hoặc elapsed_time)
- **Xử lý:** Hoạt động trùng lặp được đánh dấu nhưng không bị loại bỏ khỏi database

#### 3.3.3. Monthly Statistics
- **Thời gian:** Tính thống kê cho 3 tháng gần nhất
- **Dữ liệu:**
  - Tổng khoảng cách (km) - sau khi áp dụng daily cap
  - Số hoạt động nửa đầu tháng (ngày 1-20)
  - Số hoạt động nửa cuối tháng (ngày 21-end)
  - Tổng số hoạt động
- **Hiển thị:** Format `{first_half}/{total}` (ví dụ: "5/10")
- **Cảnh báo:** Tháng có tổng khoảng cách < 100km được đánh dấu `isLow = true`

### 3.4. Data Synchronization

#### 3.4.1. Manual Sync
- Người dùng có thể chọn khoảng thời gian và đồng bộ thủ công
- Hỗ trợ đồng bộ nhiều vận động viên cùng lúc
- Hiển thị tiến trình đồng bộ real-time

#### 3.4.2. Webhook Sync (Real-time)
- Strava gửi webhook khi có hoạt động mới/updated/deleted
- Hệ thống tự động:
  - Refresh token nếu cần
  - Fetch full activity data từ Strava API
  - Validate activity
  - Upsert vào database
  - Tạo notification cho user

**Webhook Events:**
- `activity.create`: Hoạt động mới được tạo
- `activity.update`: Hoạt động được cập nhật
- `activity.delete`: Hoạt động bị xóa (hiện tại chỉ log, không xóa khỏi DB)

### 3.5. Token Management

#### 3.5.1. Token Refresh
- Access token có thời gian hết hạn
- Tự động refresh khi:
  - Token còn < 60 giây trước khi hết hạn
  - API call trả về 401 Unauthorized
- Refresh token được lưu và cập nhật trong database

#### 3.5.2. Token Expiration Handling
- Kiểm tra `expires_at` trước mỗi API call
- Nếu token hết hạn, tự động refresh
- Nếu refresh fail, yêu cầu user reconnect

---

## 4. API ENDPOINTS

### 4.1. Strava OAuth Endpoints

#### `GET /api/strava/start`
**Mục đích:** Bắt đầu OAuth flow với Strava

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
- Redirect 302 đến Strava authorization page

**Logic:**
1. Verify user từ Supabase token
2. Tạo state parameter với HMAC signature
3. Redirect đến Strava

---

#### `GET /api/strava/callback`
**Mục đích:** Xử lý OAuth callback từ Strava

**Query Parameters:**
- `code` (required): Authorization code từ Strava
- `state` (required): State parameter để verify
- `error` (optional): Error từ Strava

**Response:**
- Redirect 302 về `/stats` với success/error message

**Logic:**
1. Verify state parameter (HMAC, expiration)
2. Exchange code lấy tokens
3. Fetch athlete profile
4. Upsert vào `strava_connections`
5. Redirect về stats page

---

#### `GET /api/strava/status`
**Mục đích:** Kiểm tra trạng thái kết nối Strava

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "connected": true,
  "athleteId": 123456,
  "athleteName": "John Doe",
  "expiresAt": 1234567890,
  "expired": false
}
```

---

### 4.2. Activity Endpoints

#### `GET /api/strava/activities`
**Mục đích:** Lấy danh sách hoạt động từ Strava API

**Query Parameters:**
- `sb` (required): Supabase access token
- `after` (optional): Unix timestamp - bắt đầu từ
- `before` (optional): Unix timestamp - kết thúc trước

**Response:**
```json
{
  "activities": [
    {
      "id": 123456,
      "name": "Morning Run",
      "type": "Run",
      "sport_type": "Run",
      "distance_km": "5.00",
      "duration_minutes": 30,
      "pace": "6.0",
      "start_date": "2025-01-27T06:00:00Z",
      "is_valid": true
    }
  ]
}
```

**Logic:**
1. Verify user và connection
2. Refresh token nếu cần
3. Fetch từ Strava API
4. Validate mỗi activity
5. Return formatted data

---

#### `GET /api/strava/athlete-activities`
**Mục đích:** Lấy hoạt động của một athlete cụ thể từ database

**Query Parameters:**
- `sb` (required): Supabase access token
- `athlete_id` (required): ID vận động viên

**Response:**
```json
{
  "activities": [
    {
      "strava_activity_id": 123456,
      "name": "Morning Run",
      "distance_km": "5.00",
      "average_speed_kmh": "10.00",
      "duration_minutes": 30,
      "activity_date": "27/01/2025",
      "start_time": "06:00:00",
      "end_time": "06:30:00",
      "activity_type": "Run",
      "location": "Hanoi, Vietnam",
      "is_valid": true,
      "is_duplicate": false
    }
  ],
  "total": 10,
  "athlete_id": 123456
}
```

**Logic:**
1. Verify user
2. Query database cho athlete_id
3. Filter 2 tháng gần nhất
4. Detect duplicates
5. Format và return

---

#### `GET /api/strava/athlete-stats`
**Mục đích:** Lấy thống kê theo tháng của tất cả athletes

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "athletes": [
    {
      "athlete_id": 123456,
      "athlete_name": "John Doe",
      "profile_medium": "https://...",
      "profile_large": "https://...",
      "monthly_data": [
        {
          "month": "2025-01",
          "distance": 150.5,
          "activities": "10/15",
          "activities_first_half": 10,
          "activities_second_half": 5,
          "total_activities": 15,
          "isLow": false
        }
      ],
      "total_distance": 450.5,
      "total_activities": 45,
      "current_month_distance": 150.5
    }
  ],
  "total": 5
}
```

**Logic:**
1. Verify user
2. Query activities 3 tháng gần nhất
3. Filter chỉ Run activities hợp lệ
4. Áp dụng daily cap (15km/ngày)
5. Detect và loại bỏ duplicates
6. Tính toán monthly stats
7. Sort theo current month distance (desc)

---

#### `GET /api/strava/db-activities`
**Mục đích:** Lấy tất cả hoạt động từ database của user

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "activities": [
    {
      "athlete_id": 123456,
      "username": "John Doe",
      "strava_activity_id": 789012,
      "distance_km": "5.00",
      "average_speed_kmh": "10.00",
      "duration_minutes": 30,
      "activity_date": "27/01/2025",
      "activity_type": "Run",
      "is_valid": true
    }
  ],
  "total": 100
}
```

---

### 4.3. Sync Endpoints

#### `GET /api/strava/sync`
**Mục đích:** Đồng bộ hoạt động từ Strava vào database

**Query Parameters:**
- `sb` (required): Supabase access token
- `after` (required): Unix timestamp - bắt đầu từ
- `before` (required): Unix timestamp - kết thúc trước
- `athlete_id` (optional): Sync cho athlete cụ thể (admin)

**Response:**
```json
{
  "synced": 50,
  "total": 55,
  "errors": ["Activity 123: database_error"]
}
```

**Logic:**
1. Verify user và connection
2. Refresh token nếu cần
3. Fetch tất cả activities từ Strava (pagination)
4. Validate mỗi activity
5. Upsert vào database
6. Return sync results

---

#### `GET /api/strava/sync-progress`
**Mục đích:** Lấy tiến trình đồng bộ (pagination)

**Query Parameters:**
- `sb` (required): Supabase access token
- `page` (optional, default: 1): Số trang
- `after` (required): Unix timestamp
- `before` (required): Unix timestamp
- `athlete_id` (optional): Athlete ID

**Response:**
```json
{
  "activities": [
    {
      "id": 123456,
      "name": "Morning Run",
      "distance_km": "5.00",
      "pace": "6.0",
      "is_valid": true,
      "validation_reason": "Hợp lệ - Pace: 6.0 min/km, Khoảng cách: 5.00km"
    }
  ],
  "page": 1,
  "hasMore": true,
  "total": 10
}
```

---

### 4.4. Connection Management

#### `GET /api/strava/connections`
**Mục đích:** Lấy danh sách tất cả connections (admin)

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "connections": [
    {
      "user_id": "uuid",
      "athlete_id": 123456,
      "athlete_name": "John Doe",
      "user_email": "user@example.com",
      "user_name": "User Name",
      "connected_at": "2025-01-27T00:00:00Z",
      "is_expired": false
    }
  ],
  "total": 5
}
```

---

#### `POST /api/strava/update-athlete-names`
**Mục đích:** Cập nhật tên athletes từ Strava API

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "message": "Updated 5 athlete names",
  "updated": 5,
  "total": 5
}
```

---

### 4.5. Webhook Endpoints

#### `GET /api/strava/webhook`
**Mục đích:** Webhook verification (Strava subscription)

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.challenge`: Challenge string từ Strava
- `hub.verify_token`: Verify token

**Response:**
```json
{
  "hub.challenge": "challenge_string"
}
```

---

#### `POST /api/strava/webhook`
**Mục đích:** Nhận webhook events từ Strava

**Request Body:**
```json
{
  "object_type": "activity",
  "object_id": 123456,
  "aspect_type": "create",
  "owner_id": 789012,
  "updates": {}
}
```

**Response:**
```json
{
  "ok": true,
  "activity_id": 123456,
  "athlete_id": 789012,
  "validation": {
    "isValid": true,
    "pace": 6.0,
    "distanceKm": 5.0
  },
  "synced_at": "2025-01-27T00:00:00Z"
}
```

**Logic:**
1. Verify webhook (nếu cần)
2. Find connection cho athlete_id
3. Refresh token nếu cần
4. Fetch full activity từ Strava
5. Validate activity
6. Upsert vào database
7. Create notification
8. Return success

---

#### `GET /api/strava/webhook-setup`
**Mục đích:** Kiểm tra trạng thái webhook subscription

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "webhook_url": "https://app.com/api/strava/webhook",
  "is_configured": true,
  "subscription": {
    "id": 1,
    "callback_url": "https://app.com/api/strava/webhook",
    "active": true
  },
  "total_subscriptions": 1
}
```

---

#### `POST /api/strava/webhook-setup`
**Mục đích:** Tạo webhook subscription mới

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": 1,
    "callback_url": "https://app.com/api/strava/webhook"
  },
  "webhook_url": "https://app.com/api/strava/webhook",
  "message": "Webhook subscription created successfully"
}
```

**Logic:**
1. Cleanup inactive webhooks
2. Check existing active webhook
3. Delete old webhooks nếu cần
4. Create new subscription
5. Return result

---

#### `PUT /api/strava/webhook-setup`
**Mục đích:** Force cleanup và tạo webhook mới

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "success": true,
  "subscription": {...},
  "message": "Webhook subscription force cleaned and recreated successfully"
}
```

---

#### `PATCH /api/strava/webhook-setup`
**Mục đích:** Force xóa tất cả webhooks

**Query Parameters:**
- `sb` (required): Supabase access token

**Response:**
```json
{
  "success": true,
  "message": "Force deleted 3/3 webhook(s)",
  "results": [
    {"id": 1, "success": true},
    {"id": 2, "success": true}
  ]
}
```

---

#### `DELETE /api/strava/webhook-setup`
**Mục đích:** Xóa webhook subscription

**Query Parameters:**
- `sb` (required): Supabase access token
- `id` (required): Subscription ID

**Response:**
```json
{
  "success": true,
  "message": "Webhook subscription deleted successfully"
}
```

---

### 4.6. Notifications Endpoints

#### `GET /api/notifications`
**Mục đích:** Lấy danh sách notifications

**Query Parameters:**
- `sb` (required): Supabase access token
- `limit` (optional, default: 20): Số lượng notifications
- `offset` (optional, default: 0): Offset cho pagination
- `unread_only` (optional, default: false): Chỉ lấy unread

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": "uuid",
      "athlete_id": 123456,
      "activity_id": 789012,
      "activity_name": "Morning Run",
      "distance_km": 5.0,
      "pace_min_per_km": 6.0,
      "is_valid": true,
      "created_at": "2025-01-27T00:00:00Z",
      "read_at": null
    }
  ],
  "total": 10,
  "has_more": false
}
```

---

#### `POST /api/notifications`
**Mục đích:** Đánh dấu notifications là đã đọc

**Query Parameters:**
- `sb` (required): Supabase access token
- `ids` (required): Comma-separated list of notification IDs

**Response:**
```json
{
  "success": true,
  "updated_count": 5
}
```

---

## 5. FRONTEND COMPONENTS

### 5.1. LandingPage
**Mục đích:** Trang chủ, hiển thị thông tin user và Strava connection status

**Features:**
- Hiển thị thông tin user (tên, email)
- Button kết nối Strava
- Hiển thị trạng thái kết nối
- Link đến trang stats

---

### 5.2. StravaConnect
**Mục đích:** Component quản lý kết nối Strava

**Features:**
- Kiểm tra trạng thái kết nối
- Button connect/disconnect
- Hiển thị thông tin athlete
- Date range picker cho sync
- Button sync activities
- Hiển thị danh sách activities từ Strava
- Hiển thị danh sách activities từ database
- Pagination
- Monthly totals
- Multi-athlete selection (admin)

---

### 5.3. AthleteStats
**Mục đích:** Hiển thị thống kê theo tháng của tất cả athletes

**Features:**
- Bảng thống kê 3 tháng gần nhất
- Sort theo current month distance
- Click vào athlete để xem chi tiết
- Modal hiển thị chi tiết activities của athlete
- Highlight activities không hợp lệ
- Highlight duplicates
- Highlight high volume days (>15km)
- Format: STT, Tên VĐV, 3 cột tháng, Avatar

---

### 5.4. ActivityNotifications
**Mục đích:** Hiển thị thông báo hoạt động real-time

**Features:**
- Badge hiển thị số unread notifications
- Dropdown list notifications
- Mark as read
- Format: Tên hoạt động, khoảng cách, pace, thời gian
- Color coding: Green (valid), Red (invalid)

---

### 5.5. WebhookSetup
**Mục đích:** Quản lý webhook subscription

**Features:**
- Kiểm tra trạng thái webhook
- Button setup webhook
- Button delete webhook
- Button cleanup all webhooks
- Button force cleanup & recreate
- Button force delete all
- Hiển thị debug info

---

### 5.6. StatsPage (`/stats`)
**Mục đích:** Trang thống kê chính

**Features:**
- Header với user info và logout
- User profile section
- Strava connection status
- Sync button với progress indicator
- AthleteStats component
- Footer với "Powered by Strava"

---

## 6. BUSINESS RULES SUMMARY

### 6.1. Activity Validation
- ✅ Chỉ tính `sport_type = 'Run'`
- ✅ Khoảng cách: `3km <= distance <= 15km`
- ✅ Pace: `3 phút/km <= pace <= 14 phút/km`
- ✅ Hoạt động không hợp lệ vẫn được lưu nhưng `is_valid = false`

### 6.2. Daily Cap
- ✅ Tối đa 15km/ngày cho mỗi athlete
- ✅ Nếu tổng > 15km, chỉ tính 15km
- ✅ Phân bổ đều cho các hoạt động trong ngày

### 6.3. Duplicate Detection
- ✅ Phát hiện dựa trên: distance, pace, duration
- ✅ Trong cùng một ngày
- ✅ Đánh dấu nhưng không xóa

### 6.4. Monthly Statistics
- ✅ Tính 3 tháng gần nhất
- ✅ Chỉ tính hoạt động hợp lệ
- ✅ Phân chia nửa đầu/nửa cuối tháng
- ✅ Cảnh báo nếu < 100km/tháng

### 6.5. Token Management
- ✅ Tự động refresh khi < 60s trước expiration
- ✅ Retry logic cho refresh failures
- ✅ Yêu cầu reconnect nếu refresh fail

---

## 7. SECURITY CONSIDERATIONS

### 7.1. Authentication
- Supabase Auth với PKCE flow
- JWT token validation
- JWT fallback mechanism

### 7.2. Authorization
- Row Level Security (RLS) trên Supabase
- User chỉ có thể xem/chỉnh sửa dữ liệu của mình
- Service role key chỉ dùng ở server-side

### 7.3. OAuth Security
- State parameter với HMAC signature
- State expiration (10 phút)
- Nonce để prevent replay attacks

### 7.4. API Security
- Tất cả API endpoints require authentication
- Token validation trước mỗi request
- Input validation và sanitization
- SQL injection prevention (Supabase client)

### 7.5. Webhook Security
- Verify token validation
- HMAC signature verification (nếu Strava hỗ trợ)
- Rate limiting (cần implement)

---

## 8. ERROR HANDLING

### 8.1. API Errors
- **401 Unauthorized:** Token invalid/expired → Redirect to login
- **400 Bad Request:** Invalid parameters → Show error message
- **500 Internal Server Error:** Log error, show generic message

### 8.2. Strava API Errors
- **401:** Token expired → Auto refresh
- **429 Rate Limit:** Retry with exponential backoff
- **500:** Retry với delay

### 8.3. Database Errors
- **Unique constraint violation:** Skip duplicate, log warning
- **Foreign key violation:** Log error, return 400
- **Connection error:** Retry, return 500

---

## 9. PERFORMANCE CONSIDERATIONS

### 9.1. Database
- Indexes trên các cột thường query:
  - `user_id`
  - `athlete_id`
  - `strava_activity_id`
  - `start_date`
  - `sport_type`
- Pagination cho large datasets
- Query optimization

### 9.2. API
- Caching cho athlete stats (có thể implement)
- Batch processing cho sync operations
- Rate limiting để tránh Strava API limits

### 9.3. Frontend
- Lazy loading components
- Pagination cho tables
- Debounce cho search/filter

---

## 10. DEPLOYMENT & ENVIRONMENT

### 10.1. Environment Variables
```env
# Strava API
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_STATE_SECRET=random_secret_string
STRAVA_WEBHOOK_VERIFY_TOKEN=random_verify_token
STRAVA_REDIRECT_URI=https://app.com/api/strava/callback

# App
NEXT_PUBLIC_APP_BASE_URL=https://app.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 10.2. Deployment
- **Platform:** Vercel (hoặc tương đương)
- **Database:** Supabase (PostgreSQL)
- **CDN:** Vercel Edge Network
- **Environment:** Production, Staging (nếu cần)

### 10.3. Monitoring
- Error logging (cần implement)
- Performance monitoring (cần implement)
- Strava API usage tracking

---

## 11. FUTURE ENHANCEMENTS

### 11.1. Features
- [ ] Export statistics to CSV/PDF
- [ ] Advanced filtering và search
- [ ] Charts và graphs visualization
- [ ] Leaderboard/ranking system
- [ ] Goals và achievements
- [ ] Social features (share activities)
- [ ] Mobile app (React Native)

### 11.2. Technical
- [ ] Caching layer (Redis)
- [ ] Background jobs (cron jobs)
- [ ] Real-time updates (WebSockets)
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] API documentation (Swagger/OpenAPI)

---

## 12. APPENDIX

### 12.1. Glossary
- **Athlete:** Vận động viên, người dùng có tài khoản Strava
- **Activity:** Hoạt động thể thao được ghi lại trên Strava
- **Pace:** Tốc độ chạy, tính bằng phút/km
- **Daily Cap:** Giới hạn khoảng cách tối đa trong một ngày (15km)
- **Validation:** Kiểm tra hoạt động có hợp lệ không
- **Sync:** Đồng bộ dữ liệu từ Strava vào database
- **Webhook:** Real-time notification từ Strava

### 12.2. References
- [Strava API Documentation](https://developers.strava.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**End of PRD**

