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
        user_id,
        is_valid,
        activity_type,
        activity_date
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
    
    // Get athlete names and profile info from strava_connections table
    const { data: connections } = await supabase
      .from('strava_connections')
      .select('athlete_id, athlete_name, profile_medium, profile_large')
      .in('athlete_id', uniqueAthleteIds)
    
    // Create mapping from connections data
    if (connections) {
      connections.forEach(conn => {
        athleteUserMap[conn.athlete_id] = {
          name: conn.athlete_name || `Vận động viên ${conn.athlete_id}`,
          profile_medium: conn.profile_medium,
          profile_large: conn.profile_large
        }
      })
    }
    
    // Fill in any missing athlete names
    uniqueAthleteIds.forEach(athleteId => {
      if (!athleteUserMap[athleteId]) {
        athleteUserMap[athleteId] = {
          name: `Vận động viên ${athleteId}`,
          profile_medium: null,
          profile_large: null
        }
      }
    })

    // Group activities by athlete and month first
    const athleteMonthlyActivities = {}
    
    activities.forEach(activity => {
      const athleteId = activity.athlete_id
      const date = new Date(activity.start_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!athleteMonthlyActivities[athleteId]) {
        athleteMonthlyActivities[athleteId] = {}
      }
      if (!athleteMonthlyActivities[athleteId][monthKey]) {
        athleteMonthlyActivities[athleteId][monthKey] = []
      }
      
      athleteMonthlyActivities[athleteId][monthKey].push(activity)
    })

    // Process each athlete's monthly data with new validation rules
    const athleteStats = {}
    
    Object.keys(athleteMonthlyActivities).forEach(athleteId => {
      const athleteInfo = athleteUserMap[athleteId] || { name: `Athlete ${athleteId}`, profile_medium: null, profile_large: null }
      
      athleteStats[athleteId] = {
        athlete_id: athleteId,
        athlete_name: athleteInfo.name,
        profile_medium: athleteInfo.profile_medium,
        profile_large: athleteInfo.profile_large,
        monthly_stats: {},
        total_distance: 0,
        total_activities: 0
      }
      
      Object.keys(athleteMonthlyActivities[athleteId]).forEach(monthKey => {
        const monthActivities = athleteMonthlyActivities[athleteId][monthKey]
        
        // Rule 1 & 2: Filter and process activities (exclude invalid except Run, cap Run invalid at 15km)
        const processedActivities = monthActivities
          .map(activity => {
            const distance = activity.distance ? activity.distance / 1000 : 0
            const isRun = activity.activity_type === 'Run'
            const isValid = activity.is_valid !== false
            
            // Exclude invalid activities (except Run)
            if (!isValid && !isRun) {
              return null
            }
            
            // Handle invalid Run: cap at 15km
            if (!isValid && isRun && distance > 15) {
              return { ...activity, distance_km: 15, activity_date: activity.activity_date }
            }
            
            return { ...activity, distance_km: distance, activity_date: activity.activity_date }
          })
          .filter(a => a !== null)
        
        // Rule 3: Group by day and cap daily total at 15km
        const dailyTotals = {}
        processedActivities.forEach(activity => {
          const date = activity.activity_date
          if (!dailyTotals[date]) {
            dailyTotals[date] = 0
          }
          dailyTotals[date] += activity.distance_km
        })
        
        // Cap each day at maximum 15km
        Object.keys(dailyTotals).forEach(date => {
          dailyTotals[date] = Math.min(dailyTotals[date], 15)
        })
        
        // Calculate monthly totals
        const monthlyDistance = Object.values(dailyTotals).reduce((sum, val) => sum + val, 0)
        const monthlyActivitiesCount = processedActivities.length
        
        athleteStats[athleteId].monthly_stats[monthKey] = {
          month: monthKey,
          distance: monthlyDistance,
          activities: monthlyActivitiesCount
        }
        
        athleteStats[athleteId].total_distance += monthlyDistance
        athleteStats[athleteId].total_activities += monthlyActivitiesCount
      })
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
