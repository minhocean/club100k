-- Add athlete_name column to strava_connections table
-- This will store the athlete's name from Strava API

-- Add the athlete_name column
ALTER TABLE public.strava_connections 
ADD COLUMN IF NOT EXISTS athlete_name TEXT;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_strava_connections_athlete_name 
ON public.strava_connections(athlete_name);

-- Update existing records to have a default name
UPDATE public.strava_connections 
SET athlete_name = 'Vận động viên ' || athlete_id::TEXT 
WHERE athlete_name IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.strava_connections.athlete_name IS 'Athlete name from Strava API';

-- Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'strava_connections' 
    AND table_schema = 'public' 
ORDER BY ordinal_position;
