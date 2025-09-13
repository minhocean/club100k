import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { STRAVA } from '../../../../lib/stravaEnv'
import { decodeJwtPayload } from '../../../../lib/jwtFallback'

export const runtime = 'nodejs'

export async function GET(request) {
  console.log('[STRAVA_START] ===== STRAVA START REQUEST =====')
  const url = new URL(request.url)
  const clientId = STRAVA.CLIENT_ID
  const redirectUri = STRAVA.REDIRECT_URI
  const scope = 'read,activity:read_all,profile:read_all'
  const responseType = 'code'
  const stateSecret = STRAVA.STATE_SECRET

  console.log('[STRAVA_START] request.url =', request.url)
  console.log('[STRAVA_START] headers x-forwarded-proto =', request.headers.get('x-forwarded-proto'))
  console.log('[STRAVA_START] headers x-forwarded-host =', request.headers.get('x-forwarded-host'))
  console.log('[STRAVA_START] STRAVA.CLIENT_ID =', clientId)
  console.log('[STRAVA_START] STRAVA.REDIRECT_URI =', redirectUri)
  console.log('[STRAVA_START] STRAVA.STATE_SECRET present =', !!stateSecret)

  if (!clientId || !redirectUri || !stateSecret) {
    console.error('[STRAVA_START] Missing Strava configuration')
    return NextResponse.json({ error: 'Strava config missing' }, { status: 500 })
  }

  // Identify current user via Supabase access token passed from client
  const accessToken = url.searchParams.get('sb')
  console.log('[STRAVA_START] Access token present:', !!accessToken)
  console.log('[STRAVA_START] Access token preview:', accessToken ? accessToken.substring(0, 20) + '...' : 'null')
  
  if (!accessToken) {
    console.error('[STRAVA_START] No access token provided')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[STRAVA_START] Attempting to get user from Supabase auth...')
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(accessToken)
  console.log('[STRAVA_START] User data result:', { hasData: !!userData, hasError: !!userErr })
  console.log('[STRAVA_START] User error:', userErr)
  
  let userId = userData?.user?.id
  if (!userId) {
    console.log('[STRAVA_START] No user from auth, trying JWT fallback')
    const payload = decodeJwtPayload(accessToken)
    console.log('[STRAVA_START] JWT payload:', payload)
    userId = payload?.sub || payload?.user_id || null
    console.log('[STRAVA_START] Extracted user ID from JWT:', userId)
  }
  if (!userId) {
    console.error('[STRAVA_START] No user ID found after all attempts')
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  console.log('[STRAVA_START] User ID found:', userId)
  console.log('[STRAVA_START] Generating state parameter...')
  
  const nonce = crypto.randomBytes(16).toString('hex')
  const payload = JSON.stringify({ uid: userId, n: nonce, exp: Math.floor(Date.now() / 1000) + 600 })
  const hmac = crypto.createHmac('sha256', stateSecret).update(payload).digest('hex')
  const state = Buffer.from(JSON.stringify({ p: payload, s: hmac })).toString('base64url')

  console.log('[STRAVA_START] State generated successfully')

  const authorizeUrl = new URL('https://www.strava.com/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', responseType)
  authorizeUrl.searchParams.set('approval_prompt', 'auto')
  authorizeUrl.searchParams.set('scope', scope)
  authorizeUrl.searchParams.set('state', state)

  console.log('[STRAVA_START] Authorization URL constructed:', authorizeUrl.toString())
  console.log('[STRAVA_START] Redirecting to Strava authorization...')

  return NextResponse.redirect(authorizeUrl.toString())
}


