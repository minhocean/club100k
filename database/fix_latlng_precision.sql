-- Fix lat/lng fields precision to handle longitude values
-- Current DECIMAL(10,8) can only handle values up to 99.99999999
-- Longitude can be up to 180, so we need DECIMAL(11,8)

-- Drop existing columns
ALTER TABLE strava_activities DROP COLUMN IF EXISTS start_latlng;
ALTER TABLE strava_activities DROP COLUMN IF EXISTS end_latlng;

-- Add new columns with correct precision
ALTER TABLE strava_activities ADD COLUMN start_latlng DECIMAL(11,8)[] DEFAULT NULL;
ALTER TABLE strava_activities ADD COLUMN end_latlng DECIMAL(11,8)[] DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN strava_activities.start_latlng IS 'Array of [latitude, longitude] for start location (DECIMAL(11,8) to handle longitude up to 180)';
COMMENT ON COLUMN strava_activities.end_latlng IS 'Array of [latitude, longitude] for end location (DECIMAL(11,8) to handle longitude up to 180)';
