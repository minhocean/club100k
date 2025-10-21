# GeminiSport - Strava Integration App

Ứng dụng tích hợp Strava để theo dõi hoạt động thể thao của vận động viên.

## 🚀 Tính năng

- Kết nối với Strava API
- Đồng bộ dữ liệu hoạt động
- Thống kê theo tháng
- Validation dữ liệu dựa trên Pace
- Quản lý vận động viên

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **External API**: Strava API

##  Yêu cầu hệ thống

- Node.js 18+ 
- npm hoặc yarn
- Tài khoản Supabase
- Tài khoản Strava Developer

##  Cài đặt

1. **Clone repository**:
```bash
git clone https://github.com/yourusername/geminisport.git
cd geminisport
```

2. **Cài đặt dependencies**:
```bash
npm install
# hoặc
yarn install
```

3. **Cấu hình environment variables**:
```bash
cp .env.example .env.local
```

4. **Cập nhật file `.env.local`**:
```env
# Strava API Configuration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_STATE_SECRET=your_random_state_secret
STRAVA_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# App Base URL
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. **Chạy ứng dụng**:
```bash
npm run dev
# hoặc
yarn dev
```

##  Cấu trúc dự án

```
geminisport/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── strava/        # Strava API endpoints
│   ├── auth/              # Authentication pages
│   └── stats/             # Stats pages
├── components/            # React Components
├── database/              # SQL scripts
├── lib/                   # Utility libraries
└── public/                # Static assets
```

## �� Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- Email: your-email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

git add.
git commit -m "Fix .."
git push -u origin main
