-- Add is_valid boolean field to strava_activities table
-- This script adds a field to mark activities as valid or invalid

-- Check if the table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strava_activities' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table strava_activities does not exist. Please run the create_strava_activities_table.sql script first.';
        RETURN;
    END IF;
END $$;

-- Add is_valid boolean field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'strava_activities' 
        AND table_schema = 'public' 
        AND column_name = 'is_valid'
    ) THEN
        ALTER TABLE public.strava_activities ADD COLUMN is_valid BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_valid boolean field to strava_activities table';
    ELSE
        RAISE NOTICE 'is_valid field already exists in strava_activities table';
    END IF;
END $$;

-- Create index on is_valid field for better query performance
CREATE INDEX IF NOT EXISTS idx_strava_activities_is_valid 
ON public.strava_activities(is_valid);

-- Add comment to explain the field purpose
COMMENT ON COLUMN public.strava_activities.is_valid IS 'Boolean field to mark activities as valid (true) or invalid (false). Default is true for existing activities.';

-- Update existing activities to be valid by default
UPDATE public.strava_activities 
SET is_valid = TRUE 
WHERE is_valid IS NULL;

-- Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'strava_activities' 
    AND table_schema = 'public' 
    AND column_name = 'is_valid';

-- Show count of activities by validity status
SELECT 
    is_valid,
    COUNT(*) as activity_count
FROM public.strava_activities 
GROUP BY is_valid
ORDER BY is_valid;

-- Show total activities count
SELECT COUNT(*) as total_activities FROM public.strava_activities;
