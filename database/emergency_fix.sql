-- Emergency fix for numeric field overflow
-- This script handles the specific "precision 10, scale 8" error

-- First, let's see what fields are causing the issue
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'strava_activities' 
    AND table_schema = 'public' 
    AND data_type = 'numeric'
    AND numeric_precision = 10
    AND numeric_scale = 8
ORDER BY ordinal_position;

-- Fix the specific fields that have precision 10, scale 8
-- These are likely the lat/lng fields that need more precision

-- Fix start_latlng array elements (if they exist as numeric)
-- Note: lat/lng are typically stored as arrays, but let's check if there are numeric fields

-- Let's also fix any other problematic numeric fields
DO $$
DECLARE
    col_record RECORD;
BEGIN
    -- Loop through all numeric columns and increase their precision
    FOR col_record IN 
        SELECT column_name, numeric_precision, numeric_scale
        FROM information_schema.columns 
        WHERE table_name = 'strava_activities' 
            AND table_schema = 'public' 
            AND data_type = 'numeric'
            AND (numeric_precision < 12 OR (numeric_precision = 10 AND numeric_scale = 8))
    LOOP
        BEGIN
            -- Increase precision based on current values
            IF col_record.numeric_precision <= 8 THEN
                EXECUTE format('ALTER TABLE public.strava_activities ALTER COLUMN %I TYPE DECIMAL(12,2)', col_record.column_name);
                RAISE NOTICE 'Updated column % to DECIMAL(12,2)', col_record.column_name;
            ELSIF col_record.numeric_precision <= 10 THEN
                EXECUTE format('ALTER TABLE public.strava_activities ALTER COLUMN %I TYPE DECIMAL(15,2)', col_record.column_name);
                RAISE NOTICE 'Updated column % to DECIMAL(15,2)', col_record.column_name;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not update column %: %', col_record.column_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Show the updated structure
\echo 'Updated table structure:'
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
