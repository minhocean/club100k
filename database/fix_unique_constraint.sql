-- Fix unique constraint for strava_activities table
-- Ensure the unique constraint matches the upsert onConflict specification

-- Drop existing unique index if it exists
DROP INDEX IF EXISTS idx_strava_activities_unique;

-- Create unique constraint (not just index) on user_id and strava_activity_id
-- This will allow upsert operations to work properly
ALTER TABLE strava_activities 
ADD CONSTRAINT strava_activities_unique_user_activity 
UNIQUE (user_id, strava_activity_id);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT strava_activities_unique_user_activity ON strava_activities 
IS 'Unique constraint to prevent duplicate activities per user, used for upsert operations';
