import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { STRAVA } from '../../../../lib/stravaEnv'
import { decodeJwtPayload } from '../../../../lib/jwtFallback'

export const runtime = 'nodejs'

export async function GET(request) {
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

  if (!clientId || !redirectUri || !stateSecret) {
    return NextResponse.json({ error: 'Strava config missing' }, { status: 500 })
  }

  // Identify current user via Supabase access token passed from client
  const accessToken = url.searchParams.get('sb')
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(accessToken)
  let userId = userData?.user?.id
  if (!userId) {
    const payload = decodeJwtPayload(accessToken)
    userId = payload?.sub || payload?.user_id || null
  }
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
  const nonce = crypto.randomBytes(16).toString('hex')
  const payload = JSON.stringify({ uid: userId, n: nonce, exp: Math.floor(Date.now() / 1000) + 600 })
  const hmac = crypto.createHmac('sha256', stateSecret).update(payload).digest('hex')
  const state = Buffer.from(JSON.stringify({ p: payload, s: hmac })).toString('base64url')

  const authorizeUrl = new URL('https://www.strava.com/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', responseType)
  authorizeUrl.searchParams.set('approval_prompt', 'auto')
  authorizeUrl.searchParams.set('scope', scope)
  authorizeUrl.searchParams.set('state', state)

  console.log('[STRAVA_START] redirecting to authorizeUrl =', authorizeUrl.toString())

  return NextResponse.redirect(authorizeUrl.toString())
}


