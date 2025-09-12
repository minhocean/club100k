-- Allow viewing all athletes' data for statistics page
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS to allow viewing all data
ALTER TABLE public.strava_activities DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.strava_activities ENABLE ROW LEVEL SECURITY;

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own activities" ON public.strava_activities;

-- Create a new policy that allows viewing all activities
CREATE POLICY "Allow viewing all activities for statistics" ON public.strava_activities
  FOR SELECT USING (true);

-- Keep the other policies for data modification
CREATE POLICY "Users can insert own activities" ON public.strava_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.strava_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.strava_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'strava_activities'
ORDER BY policyname;
