-- Update RLS policies to allow viewing all athletes' data for statistics
-- This allows the statistics page to show data from all athletes

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own activities" ON public.strava_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.strava_activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.strava_activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.strava_activities;

-- Create new policies that allow viewing all data but only modifying own data
CREATE POLICY "Users can view all activities for statistics" ON public.strava_activities
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own activities" ON public.strava_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.strava_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.strava_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Grant additional permissions for statistics
GRANT SELECT ON public.strava_activities TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'strava_activities';
