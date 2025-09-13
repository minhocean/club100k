-- Fix splits_metric and splits_default fields to handle JSON data
-- These fields were incorrectly defined as BOOLEAN but Strava API returns JSON arrays

-- First, let's check if the fields exist and their current type
-- Then alter them to JSONB to properly store JSON data

-- Drop existing columns if they exist
ALTER TABLE strava_activities DROP COLUMN IF EXISTS splits_metric;
ALTER TABLE strava_activities DROP COLUMN IF EXISTS splits_default;

-- Add new columns with correct JSONB type
ALTER TABLE strava_activities ADD COLUMN splits_metric JSONB;
ALTER TABLE strava_activities ADD COLUMN splits_default JSONB;

-- Add comment to explain the fields
COMMENT ON COLUMN strava_activities.splits_metric IS 'JSON array of metric splits data from Strava API';
COMMENT ON COLUMN strava_activities.splits_default IS 'JSON array of default splits data from Strava API';
