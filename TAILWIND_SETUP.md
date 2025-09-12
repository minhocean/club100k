# Tailwind CSS Setup Guide

## Cài đặt Tailwind CSS

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Cài đặt Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Bước 3: Khởi động lại development server
```bash
npm run dev
```

## Các file đã được cập nhật

### 1. `package.json`
- Thêm Tailwind CSS và dependencies
- Cấu hình PostCSS

### 2. `tailwind.config.js`
- Cấu hình Tailwind CSS với custom colors
- Custom animations và keyframes
- Responsive design settings

### 3. `postcss.config.js`
- Cấu hình PostCSS cho Tailwind CSS

### 4. `app/globals.css`
- Import Tailwind CSS directives
- Giữ nguyên các styles hiện có

### 5. `components/AthleteStats.js`
- Cập nhật toàn bộ component với Tailwind CSS
- Modern design với animations
- Responsive layout
- Gradient backgrounds
- Hover effects và transitions

## Tính năng mới

### 🎨 Modern Design
- Gradient backgrounds
- Rounded corners và shadows
- Smooth animations
- Hover effects

### 📱 Responsive
- Mobile-first design
- Flexible layouts
- Adaptive tables

### ⚡ Animations
- Fade in effects
- Slide up animations
- Bounce effects for achievements
- Loading spinners

### 🏆 Enhanced UX
- Better visual hierarchy
- Color-coded achievements
- Interactive elements
- Professional styling

## Cách sử dụng

1. Chạy `npm install` để cài đặt dependencies
2. Khởi động lại development server
3. Truy cập trang thống kê để xem giao diện mới

## Custom Colors

- **Primary**: Blue gradient (50-900)
- **Success**: Green gradient (50-900)  
- **Warning**: Yellow gradient (50-900)
- **Danger**: Red gradient (50-900)

## Custom Animations

- `animate-fade-in`: Fade in effect
- `animate-slide-up`: Slide up from bottom
- `animate-bounce-subtle`: Subtle bounce for achievements
