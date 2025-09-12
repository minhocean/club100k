import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { STRAVA } from '../../../lib/stravaEnv'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const computedBase = STRAVA.NEXT_PUBLIC_APP_BASE_URL || requestUrl.origin
  const xfHost = request.headers.get('x-forwarded-host')
  const xfProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedOrigin = xfHost ? `${xfProto}://${xfHost}` : null
  const publicBase = /localhost/gi.test(computedBase) && forwardedOrigin ? forwardedOrigin : computedBase

  console.log('[AUTH_CALLBACK] request.url =', request.url)
  console.log('[AUTH_CALLBACK] headers x-forwarded-proto =', xfProto)
  console.log('[AUTH_CALLBACK] headers x-forwarded-host =', xfHost)
  console.log('[AUTH_CALLBACK] STRAVA.NEXT_PUBLIC_APP_BASE_URL =', STRAVA.NEXT_PUBLIC_APP_BASE_URL)
  console.log('[AUTH_CALLBACK] computedBase =', computedBase)
  console.log('[AUTH_CALLBACK] forwardedOrigin =', forwardedOrigin)
  console.log('[AUTH_CALLBACK] publicBase =', publicBase)

  // Handle OAuth error
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${publicBase}?error=${encodeURIComponent(error)}`)
  }

  // Handle missing code
  if (!code) {
    console.error('No authorization code received')
    // Allow client to process hash fragment (implicit tokens) if present
    return NextResponse.redirect(`${publicBase}`)
  }

  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError.message)
      return NextResponse.redirect(`${publicBase}?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`)
    }

    // Success - redirect to home with success message
    console.log('Successfully authenticated user:', data.user?.email)
    return NextResponse.redirect(`${publicBase}?auth_success=1`)
    
  } catch (error) {
    console.error('Unexpected error during authentication:', error)
    return NextResponse.redirect(`${publicBase}?error=unexpected_error&message=${encodeURIComponent(error.message)}`)
  }
}
