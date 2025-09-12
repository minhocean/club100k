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

      // Prepare data similar to sync route minimal fields
      const activityData = {
        user_id: conn.user_id,
        strava_activity_id: a.id,
        athlete_id: owner_id,
        name: a.name,
        sport_type: a.sport_type || a.type,
        activity_type: a.type,
        distance: a.distance ?? null,
        moving_time: a.moving_time ?? null,
        elapsed_time: a.elapsed_time ?? null,
        total_elevation_gain: a.total_elevation_gain ?? null,
        average_speed: a.average_speed ?? null,
        max_speed: a.max_speed ?? null,
        average_cadence: a.average_cadence ?? null,
        average_watts: a.average_watts ?? null,
        weighted_average_watts: a.weighted_average_watts ?? null,
        kilojoules: a.kilojoules ?? null,
        average_heartrate: a.average_heartrate ?? null,
        max_heartrate: a.max_heartrate ?? null,
        calories: a.calories ?? null,
        start_date: a.start_date,
        start_date_local: a.start_date_local,
        timezone: a.timezone,
        utc_offset: a.utc_offset ?? null,
        location_city: a.location_city,
        location_state: a.location_state,
        location_country: a.location_country,
        start_latlng: Array.isArray(a.start_latlng) ? a.start_latlng : null,
        end_latlng: Array.isArray(a.end_latlng) ? a.end_latlng : null,
        has_heartrate: a.has_heartrate ?? null,
        workout_type: a.workout_type ?? null,
        embed_token: a.embed_token ?? null,
        gear_id: a.gear_id ?? null,
        device_name: a.device_name ?? null,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      }

      const { error: upErr } = await supabaseAdmin
        .from('strava_activities')
        .upsert(activityData, { onConflict: 'user_id,strava_activity_id' })

      if (upErr) {
        console.error('[STRAVA_WEBHOOK] upsert error', upErr)
      }

      return NextResponse.json({ ok: true }, { status: 200 })
    } catch (e) {
      console.error('[STRAVA_WEBHOOK] fetch/upsert error', e)
      return NextResponse.json({ error: 'exception' }, { status: 200 })
    }
  } catch (e) {
    console.error('[STRAVA_WEBHOOK] server error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}


