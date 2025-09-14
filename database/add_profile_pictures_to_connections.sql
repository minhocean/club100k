-- Add profile picture columns to strava_connections table
-- This migration adds profile_medium and profile_large columns to store athlete avatars

-- Add profile_medium column
ALTER TABLE public.strava_connections 
ADD COLUMN IF NOT EXISTS profile_medium TEXT;

-- Add profile_large column  
ALTER TABLE public.strava_connections 
ADD COLUMN IF NOT EXISTS profile_large TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.strava_connections.profile_medium IS 'Medium-sized profile picture URL from Strava API';
COMMENT ON COLUMN public.strava_connections.profile_large IS 'Large-sized profile picture URL from Strava API';

-- Create indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_strava_connections_profile_medium 
ON public.strava_connections(profile_medium) 
WHERE profile_medium IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_strava_connections_profile_large 
ON public.strava_connections(profile_large) 
WHERE profile_large IS NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'strava_connections' 
AND table_schema = 'public'
AND column_name IN ('profile_medium', 'profile_large')
ORDER BY column_name;
