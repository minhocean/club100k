# Pace Validation System

## Tổng quan
Hệ thống validation dựa trên Pace để kiểm tra hoạt động hợp lệ trong bảng `strava_activities`.

## Công thức tính Pace
```
Pace = Thời gian (phút) / Khoảng cách (km)
```

## Điều kiện hoạt động hợp lệ
- **Pace**: >= 3 và <= 13 (phút/km)
- **Khoảng cách**: >= 3km và <= 15km
- **is_valid = true** nếu cả hai điều kiện đều thỏa mãn
- **is_valid = false** nếu không thỏa mãn

## Files đã cập nhật

### 1. `app/api/strava/sync/route.js`
- Thêm function `validateActivity()` để kiểm tra Pace và khoảng cách
- Thêm trường `is_valid` vào `activityData` object
- Thêm logging để debug validation process

### 2. `database/add_valid_activity_field.sql`
- Script tạo trường `is_valid` trong bảng `strava_activities`
- Tạo index cho trường `is_valid`
- Cập nhật dữ liệu hiện tại với giá trị mặc định `true`

### 3. `database/update_existing_activities_with_pace_validation.sql`
- Script cập nhật dữ liệu hiện tại dựa trên validation logic
- Hiển thị summary kết quả validation
- Debug validation results

### 4. `database/test_pace_validation.sql`
- Script test các trường hợp validation
- Kiểm tra logic trước khi áp dụng

## Cách sử dụng

### 1. Chạy script tạo trường is_valid
```sql
-- Chạy file này trước
\i database/add_valid_activity_field.sql
```

### 2. Test validation logic
```sql
-- Kiểm tra logic trước khi áp dụng
\i database/test_pace_validation.sql
```

### 3. Cập nhật dữ liệu hiện tại
```sql
-- Cập nhật tất cả dữ liệu hiện tại
\i database/update_existing_activities_with_pace_validation.sql
```

### 4. Đồng bộ dữ liệu mới
- Khi đồng bộ dữ liệu mới từ Strava, validation sẽ tự động chạy
- Trường `is_valid` sẽ được set dựa trên Pace và khoảng cách

## Kiểm tra kết quả

### Xem tổng quan validation
```sql
SELECT 
  is_valid,
  COUNT(*) as activity_count,
  ROUND(AVG((moving_time / 60.0) / (distance / 1000.0)), 2) as avg_pace,
  ROUND(AVG(distance / 1000.0), 2) as avg_distance_km
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
GROUP BY is_valid
ORDER BY is_valid;
```

### Xem chi tiết hoạt động
```sql
SELECT 
  strava_activity_id,
  name,
  ROUND((distance / 1000.0), 2) as distance_km,
  ROUND((moving_time / 60.0), 2) as time_minutes,
  ROUND((moving_time / 60.0) / (distance / 1000.0), 2) as pace_min_per_km,
  is_valid,
  sport_type
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
ORDER BY start_date DESC
LIMIT 20;
```

## Lưu ý quan trọng

1. **Validation chỉ áp dụng cho hoạt động có distance > 0 và moving_time > 0**
2. **Hoạt động không có dữ liệu distance/moving_time sẽ được set is_valid = false**
3. **Logging sẽ hiển thị trong console khi đồng bộ**
4. **Có thể điều chỉnh ngưỡng validation trong function validateActivity()**

## Troubleshooting

### Nếu validation không hoạt động
1. Kiểm tra trường `is_valid` đã được tạo chưa
2. Kiểm tra console log khi đồng bộ
3. Chạy script test để kiểm tra logic

### Nếu muốn thay đổi ngưỡng validation
Sửa trong function `validateActivity()` trong file `app/api/strava/sync/route.js`:
```javascript
const isValidPace = pace >= 3 && pace <= 13  // Thay đổi ngưỡng pace
const isValidDistance = distanceKm >= 3 && distanceKm <= 15  // Thay đổi ngưỡng distance
```
