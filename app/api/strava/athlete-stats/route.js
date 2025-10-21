import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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
        moving_time,
        elapsed_time
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

    // Group activities by athlete and calculate monthly statistics
    const athleteStats = {}
    
    // First pass: Calculate daily totals for each athlete and date
    const dailyTotals = {}
    
    activities.forEach(activity => {
      if (activity.sport_type === 'Run') {
        const rawDistance = activity.distance ? activity.distance / 1000 : 0
        
        if (rawDistance >= 3) {
          const timeInSeconds = activity.moving_time || activity.elapsed_time || 0
          const timeInMinutes = timeInSeconds / 60
          const pace = rawDistance > 0 ? timeInMinutes / rawDistance : null
          
          if (pace !== null && pace >= 3 && pace <= 15) {
            const athleteId = activity.athlete_id
            const date = new Date(activity.start_date)
            const dateKey = `${athleteId}-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            
            if (!dailyTotals[dateKey]) {
              dailyTotals[dateKey] = { athleteId, date, totalDistance: 0, activities: [] }
            }
            
            dailyTotals[dateKey].totalDistance += rawDistance
            dailyTotals[dateKey].activities.push({ ...activity, rawDistance, pace })
          }
        }
      }
    })
    
    // Second pass: Apply daily 15km cap and calculate monthly stats
    const athleteStats = {}
    
    Object.values(dailyTotals).forEach(dayData => {
      const { athleteId, date, totalDistance, activities } = dayData
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const dayOfMonth = date.getDate()
      
      // Rule: Cap daily total at 15km
      const cappedDailyTotal = Math.min(totalDistance, 15)
      const dailyCapApplied = totalDistance > 15
      
      if (dailyCapApplied) {
        console.log(`Daily cap applied: ${athleteId} on ${date.toISOString().split('T')[0]}: ${totalDistance}km -> ${cappedDailyTotal}km`)
      }
      
      // Distribute the capped total proportionally among activities
      const activitiesCount = activities.length
      const distancePerActivity = activitiesCount > 0 ? cappedDailyTotal / activitiesCount : 0
      
      activities.forEach(activity => {
        const distance = distancePerActivity

        if (!athleteStats[athleteId]) {
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
        }
        
        if (!athleteStats[athleteId].monthly_stats[monthKey]) {
          athleteStats[athleteId].monthly_stats[monthKey] = {
            month: monthKey,
            distance: 0,
            activities_first_half: 0,  // 1-20
            activities_second_half: 0  // 21-end
          }
        }
        
        athleteStats[athleteId].monthly_stats[monthKey].distance += distance
        
        // Count activities by half month
        if (dayOfMonth <= 20) {
          athleteStats[athleteId].monthly_stats[monthKey].activities_first_half += 1
        } else {
          athleteStats[athleteId].monthly_stats[monthKey].activities_second_half += 1
        }
        
        athleteStats[athleteId].total_distance += distance
        athleteStats[athleteId].total_activities += 1
        
        // Debug: Log monthly totals
        console.log(`Added to ${monthKey}: ${distance.toFixed(2)}km (daily total: ${totalDistance}km -> ${cappedDailyTotal}km), Monthly total: ${athleteStats[athleteId].monthly_stats[monthKey].distance.toFixed(2)}km`)
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
        
        const firstHalf = athlete.monthly_stats[monthKey]?.activities_first_half || 0
        const secondHalf = athlete.monthly_stats[monthKey]?.activities_second_half || 0
        const totalActivities = firstHalf + secondHalf
        
        monthlyData.push({
          month: monthKey,
          distance: athlete.monthly_stats[monthKey]?.distance || 0,
          activities: `${firstHalf}/${totalActivities}`,
          activities_first_half: firstHalf,
          activities_second_half: secondHalf,
          total_activities: totalActivities,
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
