-- Test Pace validation logic
-- This script helps test the validation logic before applying to all data

-- Test cases for Pace validation
WITH test_cases AS (
  SELECT 
    'Test Case 1: Valid Activity' as test_name,
    5000 as distance_meters,  -- 5km
    1500 as moving_time_seconds,  -- 25 minutes
    ROUND((1500 / 60.0) / (5000 / 1000.0), 2) as calculated_pace,
    CASE 
      WHEN ((1500 / 60.0) / (5000 / 1000.0)) >= 3 
       AND ((1500 / 60.0) / (5000 / 1000.0)) <= 13
       AND (5000 / 1000.0) >= 3 
       AND (5000 / 1000.0) <= 15
      THEN true
      ELSE false
    END as should_be_valid
  UNION ALL
  SELECT 
    'Test Case 2: Invalid Pace (too fast)' as test_name,
    5000 as distance_meters,  -- 5km
    600 as moving_time_seconds,  -- 10 minutes (pace = 2 min/km)
    ROUND((600 / 60.0) / (5000 / 1000.0), 2) as calculated_pace,
    CASE 
      WHEN ((600 / 60.0) / (5000 / 1000.0)) >= 3 
       AND ((600 / 60.0) / (5000 / 1000.0)) <= 13
       AND (5000 / 1000.0) >= 3 
       AND (5000 / 1000.0) <= 15
      THEN true
      ELSE false
    END as should_be_valid
  UNION ALL
  SELECT 
    'Test Case 3: Invalid Distance (too short)' as test_name,
    2000 as distance_meters,  -- 2km
    1200 as moving_time_seconds,  -- 20 minutes (pace = 10 min/km)
    ROUND((1200 / 60.0) / (2000 / 1000.0), 2) as calculated_pace,
    CASE 
      WHEN ((1200 / 60.0) / (2000 / 1000.0)) >= 3 
       AND ((1200 / 60.0) / (2000 / 1000.0)) <= 13
       AND (2000 / 1000.0) >= 3 
       AND (2000 / 1000.0) <= 15
      THEN true
      ELSE false
    END as should_be_valid
  UNION ALL
  SELECT 
    'Test Case 4: Invalid Distance (too long)' as test_name,
    20000 as distance_meters,  -- 20km
    6000 as moving_time_seconds,  -- 100 minutes (pace = 5 min/km)
    ROUND((6000 / 60.0) / (20000 / 1000.0), 2) as calculated_pace,
    CASE 
      WHEN ((6000 / 60.0) / (20000 / 1000.0)) >= 3 
       AND ((6000 / 60.0) / (20000 / 1000.0)) <= 13
       AND (20000 / 1000.0) >= 3 
       AND (20000 / 1000.0) <= 15
      THEN true
      ELSE false
    END as should_be_valid
  UNION ALL
  SELECT 
    'Test Case 5: Valid Activity (edge case)' as test_name,
    3000 as distance_meters,  -- 3km
    900 as moving_time_seconds,  -- 15 minutes (pace = 5 min/km)
    ROUND((900 / 60.0) / (3000 / 1000.0), 2) as calculated_pace,
    CASE 
      WHEN ((900 / 60.0) / (3000 / 1000.0)) >= 3 
       AND ((900 / 60.0) / (3000 / 1000.0)) <= 13
       AND (3000 / 1000.0) >= 3 
       AND (3000 / 1000.0) <= 15
      THEN true
      ELSE false
    END as should_be_valid
)
SELECT 
  test_name,
  distance_meters,
  moving_time_seconds,
  calculated_pace,
  should_be_valid,
  CASE 
    WHEN should_be_valid THEN 'PASS'
    ELSE 'FAIL'
  END as test_result
FROM test_cases
ORDER BY test_name;
