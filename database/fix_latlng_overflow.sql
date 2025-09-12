-- Fix lat/lng numeric field overflow issues
-- The error "precision 10, scale 8" is likely from start_latlng or end_latlng arrays

-- First, let's check the current structure
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'strava_activities' 
    AND table_schema = 'public' 
    AND (column_name LIKE '%latlng%' OR data_type = 'numeric')
ORDER BY ordinal_position;

-- Fix the lat/lng array fields by changing their element type
-- PostgreSQL arrays of DECIMAL(10,8) can cause overflow issues
-- We'll change them to use DECIMAL(12,8) for more precision

-- Update start_latlng array
ALTER TABLE public.strava_activities 
ALTER COLUMN start_latlng TYPE DECIMAL(12,8)[];

-- Update end_latlng array  
ALTER TABLE public.strava_activities 
ALTER COLUMN end_latlng TYPE DECIMAL(12,8)[];

-- Also fix any other numeric fields that might have precision issues
DO $$
DECLARE
    col_record RECORD;
BEGIN
    -- Loop through all numeric columns and increase their precision if needed
    FOR col_record IN 
        SELECT column_name, numeric_precision, numeric_scale
        FROM information_schema.columns 
        WHERE table_name = 'strava_activities' 
            AND table_schema = 'public' 
            AND data_type = 'numeric'
            AND numeric_precision = 10
            AND numeric_scale = 8
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.strava_activities ALTER COLUMN %I TYPE DECIMAL(12,8)', col_record.column_name);
            RAISE NOTICE 'Updated column % to DECIMAL(12,8)', col_record.column_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not update column %: %', col_record.column_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Show the updated structure
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'strava_activities' 
    AND table_schema = 'public' 
    AND (column_name LIKE '%latlng%' OR data_type = 'numeric')
ORDER BY ordinal_position;
