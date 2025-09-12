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
    
    if (!userToken) {
      return NextResponse.json({ error: 'Missing user token' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 })
    }

    // Get athlete statistics with monthly totals for the last 3 months
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const { data: activities, error } = await supabase
      .from('strava_activities')
      .select(`
        athlete_id,
        distance,
        start_date,
        name,
        sport_type,
        user_id
      `)
      .gte('start_date', threeMonthsAgo.toISOString())
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    // Get unique athlete IDs and their names from strava_connections
    const uniqueAthleteIds = [...new Set(activities.map(a => a.athlete_id))]
    const athleteUserMap = {}
    
    // Get athlete names from strava_connections table
    const { data: connections } = await supabase
      .from('strava_connections')
      .select('athlete_id, athlete_name')
      .in('athlete_id', uniqueAthleteIds)
    
    // Create mapping from connections data
    if (connections) {
      connections.forEach(conn => {
        athleteUserMap[conn.athlete_id] = conn.athlete_name || `Vận động viên ${conn.athlete_id}`
      })
    }
    
    // Fill in any missing athlete names
    uniqueAthleteIds.forEach(athleteId => {
      if (!athleteUserMap[athleteId]) {
        athleteUserMap[athleteId] = `Vận động viên ${athleteId}`
      }
    })

    // Group activities by athlete and calculate monthly statistics
    const athleteStats = {}
    
    activities.forEach(activity => {
      const athleteId = activity.athlete_id
      const date = new Date(activity.start_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const distance = activity.distance ? activity.distance / 1000 : 0 // Convert to km
      
      if (!athleteStats[athleteId]) {
        athleteStats[athleteId] = {
          athlete_id: athleteId,
          athlete_name: athleteUserMap[athleteId] || `Athlete ${athleteId}`,
          monthly_stats: {},
          total_distance: 0,
          total_activities: 0
        }
      }
      
      if (!athleteStats[athleteId].monthly_stats[monthKey]) {
        athleteStats[athleteId].monthly_stats[monthKey] = {
          month: monthKey,
          distance: 0,
          activities: 0
        }
      }
      
      athleteStats[athleteId].monthly_stats[monthKey].distance += distance
      athleteStats[athleteId].monthly_stats[monthKey].activities += 1
      athleteStats[athleteId].total_distance += distance
      athleteStats[athleteId].total_activities += 1
    })

    // Convert to array and sort by current month's distance
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    
    const statsArray = Object.values(athleteStats).map(athlete => {
      // Ensure last 3 months are represented
      const monthlyData = []
      for (let i = 2; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        monthlyData.push({
          month: monthKey,
          distance: athlete.monthly_stats[monthKey]?.distance || 0,
          activities: athlete.monthly_stats[monthKey]?.activities || 0,
          isLow: (athlete.monthly_stats[monthKey]?.distance || 0) < 100
        })
      }
      
      return {
        ...athlete,
        monthly_data: monthlyData,
        current_month_distance: athlete.monthly_stats[currentMonth]?.distance || 0
      }
    })

    // Sort by current month's distance (highest first)
    statsArray.sort((a, b) => b.current_month_distance - a.current_month_distance)

    return NextResponse.json({ 
      athletes: statsArray,
      total: statsArray.length 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
