-- Update existing activities with Pace validation logic
-- This script updates the is_valid field based on Pace and distance criteria

-- Kiểm tra dữ liệu hiện tại trước khi cập nhật
SELECT 
  strava_activity_id,
  name,
  distance,
  moving_time,
  ROUND((distance / 1000.0), 2) as distance_km,
  ROUND((moving_time / 60.0), 2) as time_minutes,
  CASE 
    WHEN distance > 0 AND moving_time > 0 THEN 
      ROUND((moving_time / 60.0) / (distance / 1000.0), 2)
    ELSE 0 
  END as pace_min_per_km,
  is_valid,
  sport_type
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
ORDER BY start_date DESC
LIMIT 10;

-- Update existing activities based on Pace validation
-- Hoạt động hợp lệ: (Pace >= 3 và Pace <= 13) và (quãng đường >= 3km và quãng đường <= 15km)
UPDATE public.strava_activities 
SET is_valid = CASE 
  WHEN distance > 0 AND moving_time > 0 THEN
    CASE 
      WHEN ((moving_time / 60.0) / (distance / 1000.0)) >= 3 
       AND ((moving_time / 60.0) / (distance / 1000.0)) <= 13
       AND (distance / 1000.0) >= 3 
       AND (distance / 1000.0) <= 15
      THEN true
      ELSE false
    END
  ELSE false
END,
updated_at = NOW()
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL;

-- Show summary of validation results
SELECT 
  is_valid,
  COUNT(*) as activity_count,
  ROUND(AVG(CASE 
    WHEN distance > 0 AND moving_time > 0 THEN 
      (moving_time / 60.0) / (distance / 1000.0)
    ELSE NULL 
  END), 2) as avg_pace_min_per_km,
  ROUND(AVG(distance / 1000.0), 2) as avg_distance_km
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
GROUP BY is_valid
ORDER BY is_valid;

-- Show detailed validation results for debugging
SELECT 
  strava_activity_id,
  name,
  ROUND((distance / 1000.0), 2) as distance_km,
  ROUND((moving_time / 60.0), 2) as time_minutes,
  ROUND((moving_time / 60.0) / (distance / 1000.0), 2) as pace_min_per_km,
  is_valid,
  CASE 
    WHEN ((moving_time / 60.0) / (distance / 1000.0)) >= 3 
     AND ((moving_time / 60.0) / (distance / 1000.0)) <= 13
     AND (distance / 1000.0) >= 3 
     AND (distance / 1000.0) <= 15
    THEN 'VALID'
    ELSE 'INVALID'
  END as validation_status
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
ORDER BY start_date DESC
LIMIT 20;
