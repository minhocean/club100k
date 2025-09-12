-- Migrate strava_activities table to fix numeric field overflow issues
-- This script preserves existing data while fixing field sizes

-- First, let's check if the table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strava_activities' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table strava_activities does not exist. Please run the create_strava_activities_table.sql script first.';
        RETURN;
    END IF;
END $$;

-- Create a backup table
CREATE TABLE IF NOT EXISTS public.strava_activities_backup AS 
SELECT * FROM public.strava_activities;

-- Show current problematic fields
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'strava_activities' 
    AND table_schema = 'public' 
    AND data_type = 'numeric'
    AND (numeric_precision < 12 OR (numeric_precision = 10 AND numeric_scale = 8))
ORDER BY ordinal_position;

-- Fix numeric fields one by one to avoid data loss
DO $$
DECLARE
    col_record RECORD;
BEGIN
    -- Fix distance field
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN distance TYPE DECIMAL(15,2);
        RAISE NOTICE 'Updated distance field to DECIMAL(15,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update distance field: %', SQLERRM;
    END;

    -- Fix elevation gain field
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN total_elevation_gain TYPE DECIMAL(12,2);
        RAISE NOTICE 'Updated total_elevation_gain field to DECIMAL(12,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update total_elevation_gain field: %', SQLERRM;
    END;

    -- Fix speed fields
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN average_speed TYPE DECIMAL(12,2);
        RAISE NOTICE 'Updated average_speed field to DECIMAL(12,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update average_speed field: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN max_speed TYPE DECIMAL(12,2);
        RAISE NOTICE 'Updated max_speed field to DECIMAL(12,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update max_speed field: %', SQLERRM;
    END;

    -- Fix power fields
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN average_watts TYPE DECIMAL(12,2);
        RAISE NOTICE 'Updated average_watts field to DECIMAL(12,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update average_watts field: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN weighted_average_watts TYPE DECIMAL(12,2);
        RAISE NOTICE 'Updated weighted_average_watts field to DECIMAL(12,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update weighted_average_watts field: %', SQLERRM;
    END;

    -- Fix energy fields
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN kilojoules TYPE DECIMAL(12,2);
        RAISE NOTICE 'Updated kilojoules field to DECIMAL(12,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update kilojoules field: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN calories TYPE DECIMAL(12,2);
        RAISE NOTICE 'Updated calories field to DECIMAL(12,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update calories field: %', SQLERRM;
    END;

    -- Fix heart rate fields
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN average_heartrate TYPE DECIMAL(8,2);
        RAISE NOTICE 'Updated average_heartrate field to DECIMAL(8,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update average_heartrate field: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN max_heartrate TYPE DECIMAL(8,2);
        RAISE NOTICE 'Updated max_heartrate field to DECIMAL(8,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update max_heartrate field: %', SQLERRM;
    END;

    -- Fix cadence field
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN average_cadence TYPE DECIMAL(8,2);
        RAISE NOTICE 'Updated average_cadence field to DECIMAL(8,2)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update average_cadence field: %', SQLERRM;
    END;

    -- Fix lat/lng fields (most likely cause of precision 10, scale 8 error)
    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN start_latlng TYPE DECIMAL(12,8)[];
        RAISE NOTICE 'Updated start_latlng field to DECIMAL(12,8)[]';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update start_latlng field: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.strava_activities ALTER COLUMN end_latlng TYPE DECIMAL(12,8)[];
        RAISE NOTICE 'Updated end_latlng field to DECIMAL(12,8)[]';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not update end_latlng field: %', SQLERRM;
    END;
END $$;

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

-- Update table comment
COMMENT ON TABLE public.strava_activities IS 'Strava activities table with increased precision for numeric fields to handle large values and prevent overflow errors';

-- Show data count
SELECT COUNT(*) as total_activities FROM public.strava_activities;
