-- Fix numeric field overflow issues in strava_activities table
-- This script increases the precision of DECIMAL fields to handle larger values

-- First, let's check if the table exists and what the current structure is
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strava_activities' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table strava_activities exists, proceeding with field updates...';
    ELSE
        RAISE NOTICE 'Table strava_activities does not exist, skipping updates.';
        RETURN;
    END IF;
END $$;

-- Increase precision for distance field (can be very large for long activities)
-- Using a more conservative approach to avoid data loss
ALTER TABLE public.strava_activities 
ALTER COLUMN distance TYPE DECIMAL(15,2);

-- Increase precision for elevation gain (can be very large for mountain activities)
ALTER TABLE public.strava_activities 
ALTER COLUMN total_elevation_gain TYPE DECIMAL(12,2);

-- Increase precision for speed fields (can be very high for certain activities)
ALTER TABLE public.strava_activities 
ALTER COLUMN average_speed TYPE DECIMAL(12,2);

ALTER TABLE public.strava_activities 
ALTER COLUMN max_speed TYPE DECIMAL(12,2);

-- Increase precision for power fields (can be very high for professional athletes)
ALTER TABLE public.strava_activities 
ALTER COLUMN average_watts TYPE DECIMAL(12,2);

ALTER TABLE public.strava_activities 
ALTER COLUMN weighted_average_watts TYPE DECIMAL(12,2);

-- Increase precision for energy fields
ALTER TABLE public.strava_activities 
ALTER COLUMN kilojoules TYPE DECIMAL(12,2);

-- Increase precision for calorie fields (can be very high for long activities)
ALTER TABLE public.strava_activities 
ALTER COLUMN calories TYPE DECIMAL(12,2);

-- Increase precision for heart rate fields (some devices report very high values)
ALTER TABLE public.strava_activities 
ALTER COLUMN average_heartrate TYPE DECIMAL(8,2);

ALTER TABLE public.strava_activities 
ALTER COLUMN max_heartrate TYPE DECIMAL(8,2);

-- Increase precision for cadence field
ALTER TABLE public.strava_activities 
ALTER COLUMN average_cadence TYPE DECIMAL(8,2);

-- Update the table comment to reflect the changes
COMMENT ON TABLE public.strava_activities IS 'Strava activities table with increased precision for numeric fields to handle large values';

-- Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'strava_activities' 
    AND table_schema = 'public' 
    AND data_type = 'numeric'
ORDER BY ordinal_position;
