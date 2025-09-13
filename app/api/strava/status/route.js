import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { decodeJwtPayload } from '../../../../lib/jwtFallback'

export const runtime = 'nodejs'

export async function GET(request) {
  console.log('[STRAVA_STATUS] ===== STATUS CHECK STARTED =====')
  const url = new URL(request.url)
  const accessToken = url.searchParams.get('sb')
  
  console.log('[STRAVA_STATUS] Full URL:', request.url)
  console.log('[STRAVA_STATUS] Access token present:', !!accessToken)
  console.log('[STRAVA_STATUS] Access token preview:', accessToken ? accessToken.substring(0, 20) + '...' : 'null')
  
  if (!accessToken) {
    console.log('[STRAVA_STATUS] No access token provided')
    return NextResponse.json({ connected: false, debug: 'no_token' }, { status: 200 })
  }

  console.log('[STRAVA_STATUS] Checking status for token:', accessToken.substring(0, 10) + '...')

  console.log('[STRAVA_STATUS] Attempting to get user from Supabase auth...')
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
  console.log('[STRAVA_STATUS] User data result:', { hasData: !!userData, hasError: !!userError })
  console.log('[STRAVA_STATUS] User error:', userError)
  
  let uid = userData?.user?.id
  if (!uid) {
    console.log('[STRAVA_STATUS] No user from auth, trying JWT fallback')
    const payload = decodeJwtPayload(accessToken)
    console.log('[STRAVA_STATUS] JWT payload:', payload)
    uid = payload?.sub || payload?.user_id || null
    console.log('[STRAVA_STATUS] Extracted UID from JWT:', uid)
  }
  if (!uid) {
    console.log('[STRAVA_STATUS] No user ID found after all attempts')
    return NextResponse.json({ connected: false, debug: 'no_user_id' }, { status: 200 })
  }

  console.log('[STRAVA_STATUS] User ID found:', uid)

  console.log('[STRAVA_STATUS] Querying strava_connections table...')
  const { data, error } = await supabaseAdmin
    .from('strava_connections')
    .select('athlete_id, athlete_name, expires_at')
    .eq('user_id', uid)
    .maybeSingle()

  console.log('[STRAVA_STATUS] Database query result:', { hasData: !!data, hasError: !!error })
  console.log('[STRAVA_STATUS] Database error:', error)

  if (error) {
    console.error('[STRAVA_STATUS] Database error:', error)
    return NextResponse.json({ connected: false, error: error.message, debug: 'db_error' }, { status: 200 })
  }

  if (!data) {
    console.log('[STRAVA_STATUS] No connection found for user:', uid)
    return NextResponse.json({ connected: false, debug: 'no_connection' }, { status: 200 })
  }

  console.log('[STRAVA_STATUS] Connection found:', data)

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  const isExpired = data.expires_at && data.expires_at < now
  
  console.log('[STRAVA_STATUS] Token expiry check:', {
    expires_at: data.expires_at,
    now: now,
    isExpired: isExpired
  })
  
  if (isExpired) {
    console.log('[STRAVA_STATUS] Token expired, expires_at:', data.expires_at, 'now:', now)
    return NextResponse.json({ 
      connected: false, 
      expired: true,
      athleteId: data.athlete_id, 
      athleteName: data.athlete_name,
      debug: 'token_expired'
    }, { status: 200 })
  }

  console.log('[STRAVA_STATUS] Connection is valid and active')
  return NextResponse.json({ 
    connected: true, 
    athleteId: data.athlete_id, 
    athleteName: data.athlete_name,
    expiresAt: data.expires_at,
    debug: 'connected'
  }, { status: 200 })
}


