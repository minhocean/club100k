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
  const url = new URL(request.url)
  const accessToken = url.searchParams.get('sb')
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabaseAdmin.auth.getUser(accessToken)
  const uid = userData?.user?.id
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conn } = await supabaseAdmin
    .from('strava_connections')
    .select('user_id, athlete_id, access_token, refresh_token, expires_at')
    .eq('user_id', uid)
    .maybeSingle()

  if (!conn) return NextResponse.json({ activities: [] }, { status: 200 })

  const ready = await refreshTokenIfNeeded(conn)

  const after = url.searchParams.get('after')
  const before = url.searchParams.get('before')
  
  let apiUrl = 'https://www.strava.com/api/v3/athlete/activities?per_page=200'
  if (after) apiUrl += `&after=${after}`
  if (before) apiUrl += `&before=${before}`
  
  const actResp = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${ready.access_token}` }
  })
  if (!actResp.ok) {
    return NextResponse.json({ activities: [], error: 'fetch_failed' }, { status: 200 })
  }
  const activities = await actResp.json()
  return NextResponse.json({ activities }, { status: 200 })
}


