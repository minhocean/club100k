import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { decodeJwtPayload } from '../../../../lib/jwtFallback'

export const runtime = 'nodejs'

export async function GET(request) {
  const url = new URL(request.url)
  const accessToken = url.searchParams.get('sb')
  if (!accessToken) return NextResponse.json({ connected: false }, { status: 200 })

  const { data: userData } = await supabaseAdmin.auth.getUser(accessToken)
  let uid = userData?.user?.id
  if (!uid) {
    const payload = decodeJwtPayload(accessToken)
    uid = payload?.sub || payload?.user_id || null
  }
  if (!uid) return NextResponse.json({ connected: false }, { status: 200 })

  const { data } = await supabaseAdmin
    .from('strava_connections')
    .select('athlete_id, athlete_name, expires_at')
    .eq('user_id', uid)
    .maybeSingle()

  if (!data) return NextResponse.json({ connected: false }, { status: 200 })

  return NextResponse.json({ 
    connected: true, 
    athleteId: data.athlete_id, 
    athleteName: data.athlete_name,
    expiresAt: data.expires_at 
  }, { status: 200 })
}


