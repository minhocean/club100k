-- Test script to verify validation display functionality
-- This script helps verify that the is_valid field is working correctly

-- Check if is_valid field exists and has data
SELECT 
  COUNT(*) as total_activities,
  COUNT(CASE WHEN is_valid = true THEN 1 END) as valid_activities,
  COUNT(CASE WHEN is_valid = false THEN 1 END) as invalid_activities,
  COUNT(CASE WHEN is_valid IS NULL THEN 1 END) as null_activities
FROM public.strava_activities;

-- Show sample data with validation status
SELECT 
  strava_activity_id,
  name,
  ROUND((distance / 1000.0), 2) as distance_km,
  ROUND((moving_time / 60.0), 2) as time_minutes,
  ROUND((moving_time / 60.0) / (distance / 1000.0), 2) as pace_min_per_km,
  is_valid,
  CASE 
    WHEN is_valid = true THEN 'Hợp lệ'
    WHEN is_valid = false THEN 'Không hợp lệ'
    ELSE 'Chưa xác định'
  END as status_display,
  sport_type,
  start_date
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
ORDER BY start_date DESC
LIMIT 10;

-- Show validation summary by sport type
SELECT 
  sport_type,
  COUNT(*) as total_activities,
  COUNT(CASE WHEN is_valid = true THEN 1 END) as valid_count,
  COUNT(CASE WHEN is_valid = false THEN 1 END) as invalid_count,
  ROUND(
    (COUNT(CASE WHEN is_valid = true THEN 1 END) * 100.0 / COUNT(*)), 2
  ) as valid_percentage
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
GROUP BY sport_type
ORDER BY total_activities DESC;

-- Show activities that should be invalid based on Pace validation
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
    THEN 'SHOULD_BE_VALID'
    ELSE 'SHOULD_BE_INVALID'
  END as expected_status,
  CASE 
    WHEN is_valid = true THEN 'Hợp lệ'
    WHEN is_valid = false THEN 'Không hợp lệ'
    ELSE 'Chưa xác định'
  END as current_status
FROM public.strava_activities 
WHERE distance IS NOT NULL 
  AND moving_time IS NOT NULL 
  AND distance > 0 
  AND moving_time > 0
  AND (
    -- Show mismatches
    (is_valid = true AND NOT (
      ((moving_time / 60.0) / (distance / 1000.0)) >= 3 
      AND ((moving_time / 60.0) / (distance / 1000.0)) <= 13
      AND (distance / 1000.0) >= 3 
      AND (distance / 1000.0) <= 15
    ))
    OR
    (is_valid = false AND (
      ((moving_time / 60.0) / (distance / 1000.0)) >= 3 
      AND ((moving_time / 60.0) / (distance / 1000.0)) <= 13
      AND (distance / 1000.0) >= 3 
      AND (distance / 1000.0) <= 15
    ))
  )
ORDER BY start_date DESC
LIMIT 20;
