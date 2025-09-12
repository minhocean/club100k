-- Update existing athlete names in strava_connections
-- This script will fetch athlete names from Strava API for existing connections

-- First, let's see what we have
SELECT 
    athlete_id, 
    athlete_name, 
    user_id,
    created_at
FROM public.strava_connections 
ORDER BY created_at DESC;

-- Note: To update athlete names for existing connections, you would need to:
-- 1. Get the access_token for each connection
-- 2. Call Strava API to get athlete details
-- 3. Update the athlete_name field

-- For now, we'll set a default name for any NULL athlete_name
UPDATE public.strava_connections 
SET athlete_name = 'Vận động viên ' || athlete_id::TEXT 
WHERE athlete_name IS NULL;

-- Verify the update
SELECT 
    athlete_id, 
    athlete_name, 
    user_id,
    created_at
FROM public.strava_connections 
ORDER BY created_at DESC;
