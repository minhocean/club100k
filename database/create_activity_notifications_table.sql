-- Create activity notifications table for real-time webhook notifications
CREATE TABLE IF NOT EXISTS activity_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    athlete_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,
    activity_name TEXT,
    distance_km DECIMAL(10,2),
    pace_min_per_km DECIMAL(8,2),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_notifications_user_id ON activity_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_notifications_created_at ON activity_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_notifications_unread ON activity_notifications(user_id, read_at) WHERE read_at IS NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE activity_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON activity_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy: System can insert notifications (for webhook)
CREATE POLICY "System can insert notifications" ON activity_notifications
    FOR INSERT WITH CHECK (true);

-- Create policy: Users can mark their notifications as read
CREATE POLICY "Users can update own notifications" ON activity_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE activity_notifications IS 'Real-time activity notifications from Strava webhooks';
