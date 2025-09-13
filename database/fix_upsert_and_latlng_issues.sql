-- Comprehensive fix for upsert and lat/lng issues
-- This script addresses:
-- 1. Missing unique constraint for upsert operations
-- 2. Insufficient precision for lat/lng coordinates

-- Step 1: Fix unique constraint for upsert operations
-- Drop existing unique index if it exists
DROP INDEX IF EXISTS idx_strava_activities_unique;

-- Create unique constraint (not just index) on user_id and strava_activity_id
-- This will allow upsert operations to work properly
ALTER TABLE strava_activities 
ADD CONSTRAINT strava_activities_unique_user_activity 
UNIQUE (user_id, strava_activity_id);

-- Step 2: Fix lat/lng precision to handle longitude values
-- Drop existing columns
ALTER TABLE strava_activities DROP COLUMN IF EXISTS start_latlng;
ALTER TABLE strava_activities DROP COLUMN IF EXISTS end_latlng;

-- Add new columns with correct precision (DECIMAL(12,8) can handle longitude up to 180)
ALTER TABLE strava_activities ADD COLUMN start_latlng DECIMAL(12,8)[] DEFAULT NULL;
ALTER TABLE strava_activities ADD COLUMN end_latlng DECIMAL(12,8)[] DEFAULT NULL;

-- Add comments
COMMENT ON CONSTRAINT strava_activities_unique_user_activity ON strava_activities 
IS 'Unique constraint to prevent duplicate activities per user, used for upsert operations';

COMMENT ON COLUMN strava_activities.start_latlng IS 'Array of [latitude, longitude] for start location (DECIMAL(12,8) to handle longitude up to 180)';
COMMENT ON COLUMN strava_activities.end_latlng IS 'Array of [latitude, longitude] for end location (DECIMAL(12,8) to handle longitude up to 180)';
