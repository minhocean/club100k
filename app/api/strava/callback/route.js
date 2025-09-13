import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { STRAVA } from '../../../../lib/stravaEnv'

export const runtime = 'nodejs'

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const state = url.searchParams.get('state')
  
  console.log('[STRAVA_CALLBACK] ===== CALLBACK RECEIVED =====')
  console.log('[STRAVA_CALLBACK] Starting callback processing...')
  console.log('[STRAVA_CALLBACK] Full URL:', request.url)
  console.log('[STRAVA_CALLBACK] Code:', code ? 'present' : 'missing')
  console.log('[STRAVA_CALLBACK] Error:', error || 'none')
  console.log('[STRAVA_CALLBACK] State:', state ? 'present' : 'missing')
  console.log('[STRAVA_CALLBACK] Headers:', {
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'user-agent': request.headers.get('user-agent')
  })
  const computedBase = (() => {
    try { return new URL(STRAVA.REDIRECT_URI).origin } catch { return null }
  })() || STRAVA.NEXT_PUBLIC_APP_BASE_URL || url.origin
  const xfHost = request.headers.get('x-forwarded-host')
  const xfProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedOrigin = xfHost ? `${xfProto}://${xfHost}` : null
  const publicBase = /localhost/gi.test(computedBase) && forwardedOrigin ? forwardedOrigin : computedBase
  const finalBase = /localhost/gi.test(publicBase) ? url.origin : publicBase

  console.log('[STRAVA_CALLBACK] request.url =', request.url)
  console.log('[STRAVA_CALLBACK] headers x-forwarded-proto =', xfProto)
  console.log('[STRAVA_CALLBACK] headers x-forwarded-host =', xfHost)
  console.log('[STRAVA_CALLBACK] STRAVA.REDIRECT_URI =', STRAVA.REDIRECT_URI)
  console.log('[STRAVA_CALLBACK] STRAVA.NEXT_PUBLIC_APP_BASE_URL =', STRAVA.NEXT_PUBLIC_APP_BASE_URL)
  console.log('[STRAVA_CALLBACK] computedBase =', computedBase)
  console.log('[STRAVA_CALLBACK] forwardedOrigin =', forwardedOrigin)
  console.log('[STRAVA_CALLBACK] publicBase =', publicBase)
  console.log('[STRAVA_CALLBACK] finalBase =', finalBase)

  if (error) {
    const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=${encodeURIComponent(error)}`)
    resp.headers.set('x-debug-computed-base', String(computedBase))
    resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
    resp.headers.set('x-debug-final-base', String(finalBase))
    return resp
  }

  if (!code) {
    const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=missing_code`)
    resp.headers.set('x-debug-computed-base', String(computedBase))
    resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
    resp.headers.set('x-debug-final-base', String(finalBase))
    return resp
  }

  const clientId = STRAVA.CLIENT_ID
  const clientSecret = STRAVA.CLIENT_SECRET
  const redirectUri = STRAVA.REDIRECT_URI
  const stateSecret = STRAVA.STATE_SECRET

  if (!clientId || !clientSecret || !redirectUri || !stateSecret) {
    const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=config_missing`)
    resp.headers.set('x-debug-computed-base', String(computedBase))
    resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
    resp.headers.set('x-debug-final-base', String(finalBase))
    return resp
  }

  // Verify state
  try {
    const decoded = JSON.parse(
      Buffer.from((state || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    )
    const { p, s } = decoded || {}
    const hmac = crypto.createHmac('sha256', stateSecret).update(p).digest('hex')
    if (hmac !== s) throw new Error('bad_state_sig')
    const parsed = JSON.parse(p)
    if (!parsed?.uid || parsed.exp < Math.floor(Date.now() / 1000)) throw new Error('state_expired')
    url.searchParams.set('uid', parsed.uid)
  } catch (e) {
    const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=invalid_state`)
    resp.headers.set('x-debug-computed-base', String(computedBase))
    resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
    resp.headers.set('x-debug-final-base', String(finalBase))
    return resp
  }

  try {
    const tokenResp = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
    })

    if (!tokenResp.ok) {
      const errTxt = await tokenResp.text().catch(() => '')
      console.error('[STRAVA_CALLBACK] token exchange failed:', tokenResp.status, errTxt)
      const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=token_exchange_failed`)
      resp.headers.set('x-debug-computed-base', String(computedBase))
      resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
      resp.headers.set('x-debug-final-base', String(finalBase))
      return resp
    }

    const tokenJson = await tokenResp.json()

    const athleteId = tokenJson?.athlete?.id
    const accessToken = tokenJson?.access_token
    const refreshToken = tokenJson?.refresh_token
    const expiresAt = tokenJson?.expires_at
    const athleteName = tokenJson?.athlete?.firstname && tokenJson?.athlete?.lastname 
      ? `${tokenJson.athlete.firstname} ${tokenJson.athlete.lastname}`.trim()
      : tokenJson?.athlete?.firstname || `Vận động viên ${athleteId}`

    if (!athleteId || !accessToken || !refreshToken || !expiresAt) {
      console.error('[STRAVA_CALLBACK] missing token fields', {
        hasAthlete: !!athleteId,
        hasAccess: !!accessToken,
        hasRefresh: !!refreshToken,
        hasExpires: !!expiresAt
      })
      const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=missing_token_fields`)
      resp.headers.set('x-debug-computed-base', String(computedBase))
      resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
      resp.headers.set('x-debug-final-base', String(finalBase))
      return resp
    }

    const uid = url.searchParams.get('uid')
    if (!uid) {
      const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=missing_uid`)
      resp.headers.set('x-debug-computed-base', String(computedBase))
      resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
      resp.headers.set('x-debug-final-base', String(finalBase))
      return resp
    }

    // Upsert into strava_connections table
    const expiresSec = typeof expiresAt === 'number' ? expiresAt : Math.floor(new Date(expiresAt).getTime() / 1000)
    console.log('[STRAVA_CALLBACK] Attempting to save connection data:', {
      user_id: uid,
      athlete_id: athleteId,
      athlete_name: athleteName,
      expires_at: expiresSec
    })
    
    const { error: upsertErr } = await supabaseAdmin
      .from('strava_connections')
      .upsert({
        user_id: uid,
        athlete_id: athleteId,
        athlete_name: athleteName,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresSec,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (upsertErr) {
      console.error('[STRAVA_CALLBACK] upsert failed, trying update/insert fallback:', upsertErr)
      const updateRes = await supabaseAdmin
        .from('strava_connections')
        .update({
          athlete_id: athleteId,
          athlete_name: athleteName,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresSec,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', uid)
        .select('user_id')
        .maybeSingle()

      if (updateRes.error) {
        console.error('[STRAVA_CALLBACK] update fallback failed:', updateRes.error)
      }

      if (!updateRes.data) {
        const insertRes = await supabaseAdmin
          .from('strava_connections')
          .insert({
            user_id: uid,
            athlete_id: athleteId,
            athlete_name: athleteName,
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresSec,
            updated_at: new Date().toISOString()
          })
          .select('user_id')
          .maybeSingle()

        if (insertRes.error) {
          console.error('[STRAVA_CALLBACK] insert fallback failed:', insertRes.error)
          const code = encodeURIComponent(insertRes.error.code || 'store_failed')
          const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=${code}`)
          resp.headers.set('x-debug-computed-base', String(computedBase))
          resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
          resp.headers.set('x-debug-final-base', String(finalBase))
          return resp
        }
      }
    }

    console.log('[STRAVA_CALLBACK] Connection saved successfully, redirecting to stats page')
    const resp = NextResponse.redirect(`${finalBase}/stats?strava_connected=1`)
    resp.headers.set('x-debug-computed-base', String(computedBase))
    resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
    resp.headers.set('x-debug-final-base', String(finalBase))
    return resp
  } catch (e) {
    const resp = NextResponse.redirect(`${finalBase}/stats?strava_error=${encodeURIComponent(e.message || 'unknown_error')}`)
    resp.headers.set('x-debug-computed-base', String(computedBase))
    resp.headers.set('x-debug-forwarded-origin', String(forwardedOrigin))
    resp.headers.set('x-debug-final-base', String(finalBase))
    return resp
  }
}


