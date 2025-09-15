import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { STRAVA } from '../../../../lib/stravaEnv'

export const runtime = 'nodejs'

// Strava webhook verification: GET with hub.mode, hub.challenge, hub.verify_token
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode !== 'subscribe') {
      return NextResponse.json({ error: 'invalid_mode' }, { status: 400 })
    }
    if (!challenge) {
      return NextResponse.json({ error: 'missing_challenge' }, { status: 400 })
    }
    const expected = STRAVA.WEBHOOK_VERIFY_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
    return NextResponse.json({ 'hub.challenge': challenge }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

// Strava event delivery
export async function POST(request) {
  try {
    const body = await request.json()
    // Example body fields: object_type, object_id, aspect_type, owner_id, updates
    const { object_type, object_id, aspect_type, owner_id } = body || {}

    // Only handle activity create/update/delete
    if (object_type !== 'activity' || !object_id || !owner_id) {
      return NextResponse.json({ ignored: true }, { status: 200 })
    }

    // Find connection for this athlete
    const { data: conn, error: connErr } = await supabaseAdmin
      .from('strava_connections')
      .select('user_id, athlete_id, access_token, refresh_token, expires_at')
      .eq('athlete_id', owner_id)
      .maybeSingle()

    if (connErr || !conn) {
      console.error('[STRAVA_WEBHOOK] connection not found for athlete', owner_id, connErr)
      return NextResponse.json({ error: 'no_connection' }, { status: 200 })
    }

    // Refresh token if expired
    let accessToken = conn.access_token
    const nowSec = Math.floor(Date.now() / 1000)
    if (!accessToken || (conn.expires_at && conn.expires_at <= nowSec)) {
      try {
        const resp = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: STRAVA.CLIENT_ID,
            client_secret: STRAVA.CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: conn.refresh_token,
          })
        })
        const json = await resp.json()
        if (resp.ok && json.access_token) {
          accessToken = json.access_token
          const expiresAt = json.expires_at
          const refreshToken = json.refresh_token || conn.refresh_token
          // Persist
          await supabaseAdmin
            .from('strava_connections')
            .update({ access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt, updated_at: new Date().toISOString() })
            .eq('athlete_id', owner_id)
        } else {
          console.error('[STRAVA_WEBHOOK] refresh failed', json)
        }
      } catch (e) {
        console.error('[STRAVA_WEBHOOK] refresh error', e)
      }
    }

    if (aspect_type === 'delete') {
      // Soft-ignore deletes or remove from DB if desired
      return NextResponse.json({ deleted: true }, { status: 200 })
    }

    // Fetch full activity
    try {
      const actResp = await fetch(`https://www.strava.com/api/v3/activities/${object_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!actResp.ok) {
        const txt = await actResp.text().catch(() => '')
        console.error('[STRAVA_WEBHOOK] fetch activity failed', actResp.status, txt)
        return NextResponse.json({ error: 'fetch_failed' }, { status: 200 })
      }
      const a = await actResp.json()

      // Helper functions for data validation (same as sync route)
      const safeNumeric = (value, maxValue = 999999999999) => {
        if (value === null || value === undefined) return null
        const num = parseFloat(value)
        if (isNaN(num)) return null
        return Math.min(Math.max(num, 0), maxValue)
      }

      const safeLatLng = (value) => {
        if (value === null || value === undefined) return null
        const num = parseFloat(value)
        if (isNaN(num)) return null
        // For lat/lng, we need to ensure the value fits in DECIMAL(12,8)
        // DECIMAL(12,8) means max value is 9999.99999999
        // So we can handle all valid lat/lng values
        return Math.min(Math.max(num, -9999.99999999), 9999.99999999)
      }

      // Validation function to check if activity is valid based on Pace and distance
      const validateActivity = (activity) => {
        const distanceKm = activity.distance ? activity.distance / 1000 : 0
        const timeMinutes = activity.moving_time ? activity.moving_time / 60 : 0
        const pace = distanceKm > 0 && timeMinutes > 0 ? timeMinutes / distanceKm : 0

        // Hoạt động hợp lệ: (Pace >= 3 và Pace <= 13) và (quãng đường >= 3km và quãng đường <= 15km)
        const isValidPace = pace >= 3 && pace <= 14
        const isValidDistance = distanceKm >= 3 && distanceKm <= 16
        const isValid = isValidPace && isValidDistance

        console.log(`[STRAVA_WEBHOOK] Activity ${activity.id}: Pace=${pace.toFixed(2)} min/km, Distance=${distanceKm.toFixed(2)}km, Valid=${isValid}`)

        return {
          isValid: isValid,
          pace: pace,
          distanceKm: distanceKm,
          reason: !isValid ? 
            `Invalid activity: Pace=${pace.toFixed(2)} min/km (valid: 3-14), Distance=${distanceKm.toFixed(2)}km (valid: 3-15km)` :
            `Valid activity: Pace=${pace.toFixed(2)} min/km, Distance=${distanceKm.toFixed(2)}km`
        }
      }

      // Validate activity data
      const validation = validateActivity(a)

      // Compute robust datetime fields
      const utcOffsetSeconds = typeof a.utc_offset === 'number' ? a.utc_offset : 0
      const startUtc = a.start_date ? new Date(a.start_date) : null
      const startLocalNaiveDate = startUtc ? new Date(startUtc.getTime() + utcOffsetSeconds * 1000) : null
      const durationSeconds = a.elapsed_time || a.moving_time || 0
      const endUtc = startUtc ? new Date(startUtc.getTime() + durationSeconds * 1000) : null
      const endLocalNaiveDate = startLocalNaiveDate ? new Date(startLocalNaiveDate.getTime() + durationSeconds * 1000) : null

      const formatTimestampWithoutTZ = (date) => {
        if (!date) return null
        const pad = (n) => String(n).padStart(2, '0')
        const yyyy = date.getFullYear()
        const mm = pad(date.getMonth() + 1)
        const dd = pad(date.getDate())
        const hh = pad(date.getHours())
        const mi = pad(date.getMinutes())
        const ss = pad(date.getSeconds())
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
      }

      // Prepare comprehensive activity data (same structure as sync route)
      const activityData = {
        user_id: conn.user_id,
        strava_activity_id: a.id,
        athlete_id: owner_id,
        name: a.name,
        sport_type: a.sport_type,
        activity_type: a.type,
        distance: safeNumeric(a.distance, 999999999999999),
        moving_time: a.moving_time,
        elapsed_time: a.elapsed_time,
        total_elevation_gain: safeNumeric(a.total_elevation_gain, 999999999999),
        average_speed: safeNumeric(a.average_speed, 999999999999),
        max_speed: safeNumeric(a.max_speed, 999999999999),
        average_cadence: safeNumeric(a.average_cadence, 999999),
        average_watts: safeNumeric(a.average_watts, 999999999999),
        weighted_average_watts: safeNumeric(a.weighted_average_watts, 999999999999),
        kilojoules: safeNumeric(a.kilojoules, 999999999999),
        average_heartrate: safeNumeric(a.average_heartrate, 999999),
        max_heartrate: safeNumeric(a.max_heartrate, 999999),
        calories: safeNumeric(a.calories, 999999999999),
        start_date: startUtc ? startUtc.toISOString() : null,
        start_date_local: formatTimestampWithoutTZ(startLocalNaiveDate),
        end_date: endUtc ? endUtc.toISOString() : null,
        end_date_local: formatTimestampWithoutTZ(endLocalNaiveDate),
        timezone: a.timezone,
        utc_offset: a.utc_offset,
        location_city: a.location_city,
        location_state: a.location_state,
        location_country: a.location_country,
        start_latlng: a.start_latlng ? a.start_latlng.map(coord => safeLatLng(coord)) : null,
        end_latlng: a.end_latlng ? a.end_latlng.map(coord => safeLatLng(coord)) : null,
        achievement_count: a.achievement_count,
        kudos_count: a.kudos_count,
        comment_count: a.comment_count,
        athlete_count: a.athlete_count,
        pr_count: a.pr_count,
        trainer: a.trainer,
        commute: a.commute,
        manual: a.manual,
        private: a.private,
        flagged: a.flagged,
        workout_type: a.workout_type,
        external_id: a.external_id,
        upload_id: a.upload_id,
        description: a.description,
        gear_id: a.gear_id,
        device_name: a.device_name,
        embed_token: a.embed_token,
        splits_metric: a.splits_metric || null,
        splits_default: a.splits_default || null,
        has_heartrate: a.has_heartrate,
        has_kudoed: a.has_kudoed,
        is_valid: validation.isValid,
        synced_at: new Date().toISOString()
      }

      const { error: upErr } = await supabaseAdmin
        .from('strava_activities')
        .upsert(activityData, { onConflict: 'user_id,strava_activity_id' })

      if (upErr) {
        console.error('[STRAVA_WEBHOOK] upsert error', upErr)
        return NextResponse.json({ error: 'database_error', details: upErr.message }, { status: 200 })
      }

      // Log successful sync with validation details
      console.log(`[STRAVA_WEBHOOK] Successfully synced activity ${a.id} for athlete ${owner_id}: ${validation.reason}`)
      
      // Optional: Store notification for user (if you want to show real-time notifications)
      try {
        await supabaseAdmin
          .from('activity_notifications')
          .insert({
            user_id: conn.user_id,
            athlete_id: owner_id,
            activity_id: a.id,
            activity_name: a.name,
            distance_km: validation.distanceKm,
            pace_min_per_km: validation.pace,
            is_valid: validation.isValid,
            created_at: new Date().toISOString()
          })
          .catch(() => {
            // Ignore if notifications table doesn't exist
            console.log('[STRAVA_WEBHOOK] Notifications table not available')
          })
      } catch (e) {
        // Ignore notification errors
      }

      return NextResponse.json({ 
        ok: true, 
        activity_id: a.id,
        athlete_id: owner_id,
        validation: validation,
        synced_at: new Date().toISOString()
      }, { status: 200 })
    } catch (e) {
      console.error('[STRAVA_WEBHOOK] fetch/upsert error', e)
      return NextResponse.json({ error: 'exception' }, { status: 200 })
    }
  } catch (e) {
    console.error('[STRAVA_WEBHOOK] server error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}


