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

    // Base date: 2/12/2025 (December 2, 2025)
    // Tổng km đến ngày 2/12/2025 là 96,823 km
    const baseDate = new Date('2025-12-02T00:00:00Z')
    const now = new Date()
    
    // Get all activities from base date to now
    const { data: activities, error } = await supabase
      .from('strava_activities')
      .select(`
        athlete_id,
        distance,
        start_date,
        start_date_local,
        sport_type,
        moving_time,
        elapsed_time,
        is_valid
      `)
      .gte('start_date', baseDate.toISOString())
      .lte('start_date', now.toISOString())
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    // Apply validation rules and daily cap (same logic as athlete-stats)
    const dailyTotals = {}
    
    activities.forEach(activity => {
      // Only count Run activities
      if (activity.sport_type === 'Run') {
        const rawDistance = activity.distance ? activity.distance / 1000 : 0
        
        // Validation: distance >= 3km
        if (rawDistance >= 3) {
          const timeInSeconds = activity.moving_time || activity.elapsed_time || 0
          const timeInMinutes = timeInSeconds / 60
          const pace = rawDistance > 0 ? timeInMinutes / rawDistance : null
          
          // Validation: pace between 3 and 15 min/km (matching athlete-stats logic)
          // Distance validation: >= 3km (upper limit checked separately)
          if (pace !== null && pace >= 3 && pace <= 15) {
            const athleteId = activity.athlete_id
            const date = activity.start_date_local 
              ? new Date(activity.start_date_local) 
              : new Date(activity.start_date)
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
    
    // Apply daily 15km cap and remove duplicates
    let totalDistance = 0
    
    Object.values(dailyTotals).forEach(dayData => {
      const { totalDistance: dayTotal, activities } = dayData
      
      // Remove duplicates (same distance, pace, duration)
      const uniqueActivities = []
      const seenActivities = new Set()
      
      activities.forEach(activity => {
        const activityKey = `${activity.rawDistance.toFixed(2)}-${activity.pace.toFixed(1)}-${activity.moving_time || activity.elapsed_time}`
        
        if (!seenActivities.has(activityKey)) {
          seenActivities.add(activityKey)
          uniqueActivities.push(activity)
        }
      })
      
      // Recalculate total distance with unique activities only
      const uniqueTotalDistance = uniqueActivities.reduce((sum, activity) => sum + activity.rawDistance, 0)
      
      // Apply daily cap: max 15km per day
      const cappedDailyTotal = Math.min(uniqueTotalDistance, 15)
      
      totalDistance += cappedDailyTotal
    })
    
    // Base total from 2/12/2025: 96,823 km
    const baseTotal = 96823
    const currentTotal = baseTotal + totalDistance
    const targetTotal = 100000
    const remainingKm = Math.max(0, targetTotal - currentTotal)
    
    return NextResponse.json({ 
      base_total: baseTotal,
      distance_since_base: parseFloat(totalDistance.toFixed(2)),
      current_total: parseFloat(currentTotal.toFixed(2)),
      target_total: targetTotal,
      remaining_km: parseFloat(remainingKm.toFixed(2)),
      base_date: '2025-12-02',
      calculated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

