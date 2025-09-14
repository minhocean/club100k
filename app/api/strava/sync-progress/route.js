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
    const page = parseInt(url.searchParams.get('page') || '1')
    const after = url.searchParams.get('after')
    const before = url.searchParams.get('before')
    const requestedAthleteId = url.searchParams.get('athlete_id')
    
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!after || !before) return NextResponse.json({ error: 'Missing date range parameters' }, { status: 400 })

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
    if (userError || !userData?.user?.id) {
      console.error('User auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const uid = userData.user.id

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

    // Fetch one page of activities from Strava
    const perPage = 10
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
    
    // Process and validate each activity
    const processedActivities = activities.map(activity => {
      const distanceKm = activity.distance ? activity.distance / 1000 : 0
      const timeMinutes = activity.moving_time ? activity.moving_time / 60 : 0
      const pace = distanceKm > 0 && timeMinutes > 0 ? timeMinutes / distanceKm : 0
      
      const isValidPace = pace >= 3 && pace <= 14
      const isValidDistance = distanceKm >= 3 && distanceKm <= 16
      const isValid = isValidPace && isValidDistance
      
      return {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        sport_type: activity.sport_type,
        distance_km: distanceKm.toFixed(2),
        duration_minutes: Math.floor(timeMinutes),
        pace: pace.toFixed(1),
        start_date: activity.start_date,
        start_date_local: activity.start_date_local,
        is_valid: isValid,
        validation_reason: !isValid ? 
          `Pace: ${pace.toFixed(1)} min/km (cần 3-13), Khoảng cách: ${distanceKm.toFixed(1)}km (cần 3-15km)` :
          `Hợp lệ - Pace: ${pace.toFixed(1)} min/km, Khoảng cách: ${distanceKm.toFixed(1)}km`
      }
    })

    return NextResponse.json({ 
      activities: processedActivities,
      page: page,
      hasMore: activities.length === perPage,
      total: processedActivities.length
    })
    
  } catch (error) {
    console.error('Sync progress API error:', error)
    return NextResponse.json({ 
      error: `Sync progress failed: ${error.message}` 
    }, { status: 500 })
  }
}
