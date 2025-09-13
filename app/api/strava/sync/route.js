import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export const runtime = 'nodejs'

async function refreshTokenIfNeeded(conn) {
  const nowSec = Math.floor(Date.now() / 1000)
  if (conn.expires_at && Number(conn.expires_at) > nowSec + 60) {
    return conn
  }

  const resp = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: conn.refresh_token
    })
  })

  if (!resp.ok) {
    return conn
  }
  const json = await resp.json()
  const updated = {
    access_token: json?.access_token || conn.access_token,
    refresh_token: json?.refresh_token || conn.refresh_token,
    expires_at: json?.expires_at || conn.expires_at
  }
  await supabaseAdmin
    .from('strava_connections')
    .update({
      access_token: updated.access_token,
      refresh_token: updated.refresh_token,
      expires_at: updated.expires_at,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', conn.user_id)

  return { ...conn, ...updated }
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('sb')
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
    if (userError || !userData?.user?.id) {
      console.error('User auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const uid = userData.user.id

    // Allow optional athlete_id to sync a specific athlete's data (admin-style operation)
    const requestedAthleteId = url.searchParams.get('athlete_id')

    let connQuery = supabaseAdmin
      .from('strava_connections')
      .select('user_id, athlete_id, access_token, refresh_token, expires_at')

    if (requestedAthleteId) {
      connQuery = connQuery.eq('athlete_id', requestedAthleteId)
    } else {
      connQuery = connQuery.eq('user_id', uid)
    }

    const { data: conn, error: connError } = await connQuery.maybeSingle()

    if (connError) {
      console.error('Connection fetch error:', connError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    if (!conn) return NextResponse.json({ error: 'No Strava connection found' }, { status: 400 })

    const ready = await refreshTokenIfNeeded(conn)

    const after = url.searchParams.get('after')
    const before = url.searchParams.get('before')
    
    if (!after || !before) {
      return NextResponse.json({ error: 'Missing date range parameters' }, { status: 400 })
    }
    
    console.log('Syncing activities from:', new Date(parseInt(after) * 1000).toISOString(), 'to:', new Date(parseInt(before) * 1000).toISOString())
    
    let allActivities = []
    let page = 1
    const perPage = 200
    let hasMore = true
    
    while (hasMore) {
      let apiUrl = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`
      if (after) apiUrl += `&after=${after}`
      if (before) apiUrl += `&before=${before}`
      
      console.log(`Fetching page ${page} from Strava API:`, apiUrl)
      const actResp = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${ready.access_token}` }
      })
      
      if (!actResp.ok) {
        const errorText = await actResp.text()
        console.error('Strava API error:', actResp.status, errorText)
        return NextResponse.json({ error: `Strava API error: ${actResp.status}` }, { status: 400 })
      }
      
      const activities = await actResp.json()
      console.log(`Fetched ${activities.length} activities on page ${page}`)
      
      if (activities.length === 0) {
        hasMore = false
      } else {
        allActivities = allActivities.concat(activities)
        
        // Check if we've reached the end of the date range
        const lastActivityDate = new Date(activities[activities.length - 1].start_date)
        const beforeDate = new Date(parseInt(before) * 1000)
        
        if (lastActivityDate >= beforeDate || activities.length < perPage) {
          hasMore = false
        } else {
          page++
        }
      }
    }
    
    console.log('Total activities fetched:', allActivities.length)
    
    let syncedCount = 0
    const errors = []

    for (const activity of allActivities) {
      try {
        // Helper function to safely handle numeric values
        const safeNumeric = (value, maxValue = 999999999999) => {
          if (value === null || value === undefined) return null
          const num = parseFloat(value)
          if (isNaN(num)) return null
          return Math.min(Math.max(num, 0), maxValue)
        }

        // Helper function to safely handle lat/lng values (precision 12, scale 8)
        const safeLatLng = (value) => {
          if (value === null || value === undefined) return null
          const num = parseFloat(value)
          if (isNaN(num)) return null
          // For lat/lng, we need to ensure the value fits in DECIMAL(12,8)
          // Latitude: -90 to 90, Longitude: -180 to 180
          // DECIMAL(12,8) means max value is 9999.99999999
          // So we can handle all valid lat/lng values
          return Math.min(Math.max(num, -9999.99999999), 9999.99999999)
        }

        // Validation function to check if activity is valid based on Pace and distance
        const validateActivity = (activity) => {
          // Calculate Pace = Thời gian (phút) / Khoảng cách (km)
          // distance is in meters, moving_time is in seconds
          const distanceKm = activity.distance ? activity.distance / 1000 : 0
          const timeMinutes = activity.moving_time ? activity.moving_time / 60 : 0
          const pace = distanceKm > 0 && timeMinutes > 0 ? timeMinutes / distanceKm : 0

          // Hoạt động hợp lệ: (Pace >= 3 và Pace <= 13) và (quãng đường >= 3km và quãng đường <= 15km)
          const isValidPace = pace >= 3 && pace <= 13
          const isValidDistance = distanceKm >= 3 && distanceKm <= 15
          const isValid = isValidPace && isValidDistance

          console.log(`Activity ${activity.id}: Pace=${pace.toFixed(2)} min/km, Distance=${distanceKm.toFixed(2)}km, Valid=${isValid}`)

          return {
            isValid: isValid,
            pace: pace,
            distanceKm: distanceKm,
            reason: !isValid ? 
              `Invalid activity: Pace=${pace.toFixed(2)} min/km (valid: 3-13), Distance=${distanceKm.toFixed(2)}km (valid: 3-15km)` :
              `Valid activity: Pace=${pace.toFixed(2)} min/km, Distance=${distanceKm.toFixed(2)}km`
          }
        }

        // Validate activity data
        const validation = validateActivity(activity)

        const activityData = {
          // Store under the owning user's id of the connection (so multi-athlete sync associates correctly)
          user_id: conn.user_id,
          strava_activity_id: activity.id,
          athlete_id: activity.athlete?.id || conn.athlete_id,
          name: activity.name,
          sport_type: activity.sport_type,
          activity_type: activity.type,
          distance: safeNumeric(activity.distance, 999999999999999), // Max 15 digits
          moving_time: activity.moving_time,
          elapsed_time: activity.elapsed_time,
          total_elevation_gain: safeNumeric(activity.total_elevation_gain, 999999999999), // Max 12 digits
          average_speed: safeNumeric(activity.average_speed, 999999999999), // Max 12 digits
          max_speed: safeNumeric(activity.max_speed, 999999999999), // Max 12 digits
          average_cadence: safeNumeric(activity.average_cadence, 999999), // Max 8 digits
          average_watts: safeNumeric(activity.average_watts, 999999999999), // Max 12 digits
          weighted_average_watts: safeNumeric(activity.weighted_average_watts, 999999999999), // Max 12 digits
          kilojoules: safeNumeric(activity.kilojoules, 999999999999), // Max 12 digits
          average_heartrate: safeNumeric(activity.average_heartrate, 999999), // Max 8 digits
          max_heartrate: safeNumeric(activity.max_heartrate, 999999), // Max 8 digits
          calories: safeNumeric(activity.calories, 999999999999), // Max 12 digits
          start_date: activity.start_date,
          start_date_local: activity.start_date_local,
          timezone: activity.timezone,
          utc_offset: activity.utc_offset,
          location_city: activity.location_city,
          location_state: activity.location_state,
          location_country: activity.location_country,
          start_latlng: activity.start_latlng ? activity.start_latlng.map(coord => safeLatLng(coord)) : null,
          end_latlng: activity.end_latlng ? activity.end_latlng.map(coord => safeLatLng(coord)) : null,
          achievement_count: activity.achievement_count,
          kudos_count: activity.kudos_count,
          comment_count: activity.comment_count,
          athlete_count: activity.athlete_count,
          pr_count: activity.pr_count,
          trainer: activity.trainer,
          commute: activity.commute,
          manual: activity.manual,
          private: activity.private,
          flagged: activity.flagged,
          workout_type: activity.workout_type,
          external_id: activity.external_id,
          upload_id: activity.upload_id,
          description: activity.description,
          gear_id: activity.gear_id,
          device_name: activity.device_name,
          embed_token: activity.embed_token,
          splits_metric: activity.splits_metric || null,
          splits_default: activity.splits_default || null,
          has_heartrate: activity.has_heartrate,
          has_kudoed: activity.has_kudoed,
          is_valid: validation.isValid,
          synced_at: new Date().toISOString()
        }

        const { error: upsertError } = await supabaseAdmin
          .from('strava_activities')
          .upsert(activityData, { 
            onConflict: 'user_id,strava_activity_id',
            ignoreDuplicates: false 
          })

        if (upsertError) {
          console.error('Error upserting activity:', activity.id, upsertError)
          
          // Log the problematic values for debugging
          const problematicFields = []
          
          // Check for lat/lng overflow (precision 10, scale 8 issue)
          if (activity.start_latlng) {
            activity.start_latlng.forEach((coord, idx) => {
              if (coord && (Math.abs(coord) > 99.99999999 || Math.abs(coord) < 0.00000001)) {
                problematicFields.push(`start_latlng[${idx}]: ${coord}`)
              }
            })
          }
          if (activity.end_latlng) {
            activity.end_latlng.forEach((coord, idx) => {
              if (coord && (Math.abs(coord) > 99.99999999 || Math.abs(coord) < 0.00000001)) {
                problematicFields.push(`end_latlng[${idx}]: ${coord}`)
              }
            })
          }
          
          // Check other numeric fields
          if (activity.distance && activity.distance > 999999999999999) problematicFields.push(`distance: ${activity.distance}`)
          if (activity.total_elevation_gain && activity.total_elevation_gain > 999999999999) problematicFields.push(`elevation: ${activity.total_elevation_gain}`)
          if (activity.average_speed && activity.average_speed > 999999999999) problematicFields.push(`avg_speed: ${activity.average_speed}`)
          if (activity.max_speed && activity.max_speed > 999999999999) problematicFields.push(`max_speed: ${activity.max_speed}`)
          if (activity.average_watts && activity.average_watts > 999999999999) problematicFields.push(`avg_watts: ${activity.average_watts}`)
          if (activity.calories && activity.calories > 999999999999) problematicFields.push(`calories: ${activity.calories}`)
          
          const errorMsg = `Activity ${activity.id}: ${upsertError.message}${problematicFields.length > 0 ? ` (Problematic fields: ${problematicFields.join(', ')})` : ''}`
          errors.push(errorMsg)
        } else {
          syncedCount++
        }
      } catch (error) {
        console.error('Error processing activity:', error)
        errors.push(`Activity ${activity.id}: ${error.message}`)
      }
    }

    return NextResponse.json({ 
      synced: syncedCount,
      total: allActivities.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : null
    }, { status: 200 })
    
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json({ 
      error: `Sync failed: ${error.message}` 
    }, { status: 500 })
  }
}
