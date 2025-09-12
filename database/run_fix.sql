-- Simple script to run the numeric overflow fix
-- Run this script in your Supabase SQL editor or psql

\echo 'Starting numeric field overflow fix...'

-- Check current table structure
\echo 'Current table structure:'
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

-- Run the fix
\i fix_numeric_overflow.sql

\echo 'Fix completed!'
