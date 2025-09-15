-- Add end datetime fields and fix local datetime storage for Strava activities
-- - Change start_date_local to TIMESTAMP WITHOUT TIME ZONE (naive local clock time)
-- - Add end_date (TIMESTAMPTZ) and end_date_local (TIMESTAMP WITHOUT TIME ZONE)

DO $$
BEGIN
  -- Ensure table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'strava_activities'
  ) THEN
    RAISE NOTICE 'Table public.strava_activities does not exist.';
    RETURN;
  END IF;

  -- Add end_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'strava_activities' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE public.strava_activities ADD COLUMN end_date TIMESTAMPTZ;
  END IF;

  -- Add end_date_local if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'strava_activities' AND column_name = 'end_date_local'
  ) THEN
    ALTER TABLE public.strava_activities ADD COLUMN end_date_local TIMESTAMP WITHOUT TIME ZONE;
  END IF;

  -- Convert start_date_local to TIMESTAMP WITHOUT TIME ZONE if it is timestamptz
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'strava_activities' AND column_name = 'start_date_local' AND data_type = 'timestamp with time zone'
  ) THEN
    -- Create a temporary column to preserve naive local clock time (drop timezone)
    ALTER TABLE public.strava_activities ADD COLUMN start_date_local_tmp TIMESTAMP WITHOUT TIME ZONE;
    -- Copy data by stripping timezone (store the displayed local time, not UTC)
    UPDATE public.strava_activities
    SET start_date_local_tmp = (start_date_local AT TIME ZONE 'UTC');
    -- Replace column
    ALTER TABLE public.strava_activities DROP COLUMN start_date_local;
    ALTER TABLE public.strava_activities RENAME COLUMN start_date_local_tmp TO start_date_local;
  END IF;

  -- Backfill end_date and end_date_local where possible
  UPDATE public.strava_activities
  SET 
    end_date = CASE 
      WHEN start_date IS NOT NULL AND COALESCE(elapsed_time, moving_time) IS NOT NULL 
      THEN start_date + make_interval(secs => COALESCE(elapsed_time, moving_time))
      ELSE end_date
    END,
    end_date_local = CASE 
      WHEN start_date_local IS NOT NULL AND COALESCE(elapsed_time, moving_time) IS NOT NULL 
      THEN start_date_local + make_interval(secs => COALESCE(elapsed_time, moving_time))
      ELSE end_date_local
    END
  WHERE (end_date IS NULL OR end_date_local IS NULL);
END$$;

-- Indexes for date queries (optional, safe to create if not exist)
CREATE INDEX IF NOT EXISTS idx_strava_activities_end_date ON public.strava_activities(end_date);

