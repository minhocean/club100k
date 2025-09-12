import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { searchParams } = new URL(request.url)
    const userToken = searchParams.get('sb')
    const athleteId = searchParams.get('athlete_id')
    
    if (!userToken || !athleteId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 })
    }

    // Get activities for the last 2 months for the specific athlete
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    
    const { data: activities, error } = await supabase
      .from('strava_activities')
      .select(`
        strava_activity_id,
        name,
        distance,
        average_speed,
        moving_time,
        elapsed_time,
        start_date,
        start_date_local,
        sport_type,
        activity_type,
        location_city,
        location_state,
        location_country,
        calories,
        total_elevation_gain,
        is_valid
      `)
      .eq('athlete_id', athleteId)
      .gte('start_date', twoMonthsAgo.toISOString())
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    const formattedActivities = activities.map(activity => ({
      strava_activity_id: activity.strava_activity_id,
      name: activity.name,
      distance_km: activity.distance ? (activity.distance / 1000).toFixed(2) : 0,
      average_speed_kmh: activity.average_speed ? (activity.average_speed * 3.6).toFixed(2) : 0,
      duration_minutes: Math.floor((activity.moving_time || activity.elapsed_time || 0) / 60),
      activity_date: activity.start_date ? new Date(activity.start_date).toLocaleDateString('vi-VN') : 'N/A',
      start_time: activity.start_date ? new Date(activity.start_date).toLocaleTimeString('vi-VN') : 'N/A',
      activity_type: activity.sport_type || activity.activity_type || 'N/A',
      location: [activity.location_city, activity.location_state, activity.location_country]
        .filter(Boolean)
        .join(', ') || 'Không xác định',
      calories: activity.calories || 0,
      elevation_gain: activity.total_elevation_gain || 0,
      is_valid: activity.is_valid
    }))

    return NextResponse.json({ 
      activities: formattedActivities,
      total: formattedActivities.length,
      athlete_id: athleteId
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
