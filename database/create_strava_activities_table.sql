-- Create strava_activities table to store Strava activities data
CREATE TABLE IF NOT EXISTS public.strava_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL,
  athlete_id BIGINT NOT NULL,
  name TEXT,
  sport_type TEXT,
  activity_type TEXT,
  distance DECIMAL(15,2), -- in meters (increased precision for long activities)
  moving_time INTEGER, -- in seconds
  elapsed_time INTEGER, -- in seconds
  total_elevation_gain DECIMAL(12,2), -- in meters (increased precision for mountain activities)
  average_speed DECIMAL(12,2), -- in m/s (increased precision for high-speed activities)
  max_speed DECIMAL(12,2), -- in m/s (increased precision for high-speed activities)
  average_cadence DECIMAL(8,2), -- increased precision
  average_watts DECIMAL(12,2), -- increased precision for high-power activities
  weighted_average_watts DECIMAL(12,2), -- increased precision for high-power activities
  kilojoules DECIMAL(12,2), -- increased precision for high-energy activities
  average_heartrate DECIMAL(8,2), -- increased precision
  max_heartrate DECIMAL(8,2), -- increased precision
  calories DECIMAL(12,2), -- increased precision for long activities
  start_date TIMESTAMPTZ NOT NULL,
  start_date_local TIMESTAMPTZ,
  timezone TEXT,
  utc_offset INTEGER,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  start_latlng DECIMAL(10,8)[],
  end_latlng DECIMAL(10,8)[],
  achievement_count INTEGER,
  kudos_count INTEGER,
  comment_count INTEGER,
  athlete_count INTEGER,
  pr_count INTEGER,
  trainer BOOLEAN,
  commute BOOLEAN,
  manual BOOLEAN,
  private BOOLEAN,
  flagged BOOLEAN,
  workout_type INTEGER,
  external_id TEXT,
  upload_id BIGINT,
  description TEXT,
  gear_id TEXT,
  device_name TEXT,
  embed_token TEXT,
  splits_metric BOOLEAN,
  splits_default BOOLEAN,
  has_heartrate BOOLEAN,
  has_kudoed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strava_activities_user_id ON public.strava_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_strava_activities_strava_id ON public.strava_activities(strava_activity_id);
CREATE INDEX IF NOT EXISTS idx_strava_activities_athlete_id ON public.strava_activities(athlete_id);
CREATE INDEX IF NOT EXISTS idx_strava_activities_start_date ON public.strava_activities(start_date);
CREATE INDEX IF NOT EXISTS idx_strava_activities_sport_type ON public.strava_activities(sport_type);

-- Create unique constraint to prevent duplicate activities
CREATE UNIQUE INDEX IF NOT EXISTS idx_strava_activities_unique 
ON public.strava_activities(user_id, strava_activity_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.strava_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own activities" ON public.strava_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.strava_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.strava_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.strava_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_strava_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_strava_activities_updated_at
  BEFORE UPDATE ON public.strava_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_strava_activities_updated_at();

-- Grant permissions
GRANT ALL ON public.strava_activities TO authenticated;
GRANT ALL ON public.strava_activities TO service_role;
GRANT USAGE, SELECT ON SEQUENCE strava_activities_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE strava_activities_id_seq TO service_role;
