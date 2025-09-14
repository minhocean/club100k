import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('sb')
    
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
    if (userError || !userData?.user?.id) {
      console.error('User auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all Strava connections with user info
    const { data: connections, error: connError } = await supabaseAdmin
      .from('strava_connections')
      .select(`
        user_id,
        athlete_id,
        athlete_name,
        connected_at,
        expires_at,
        access_token,
        refresh_token
      `)
      .order('connected_at', { ascending: false })

    if (connError) {
      console.error('Connections fetch error:', connError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Get user info for each connection
    const connectionsWithUserInfo = await Promise.all(
      connections.map(async (conn) => {
        try {
          const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(conn.user_id)
          return {
            ...conn,
            user_email: userInfo?.user?.email || 'N/A',
            user_name: userInfo?.user?.user_metadata?.full_name || 
                      userInfo?.user?.user_metadata?.name || 
                      'N/A',
            is_expired: conn.expires_at ? (Math.floor(Date.now() / 1000) > conn.expires_at) : false
          }
        } catch (error) {
          console.error('Error getting user info for:', conn.user_id, error)
          return {
            ...conn,
            user_email: 'N/A',
            user_name: 'N/A',
            is_expired: conn.expires_at ? (Math.floor(Date.now() / 1000) > conn.expires_at) : false
          }
        }
      })
    )

    return NextResponse.json({ 
      connections: connectionsWithUserInfo,
      total: connectionsWithUserInfo.length
    })
    
  } catch (error) {
    console.error('Connections API error:', error)
    return NextResponse.json({ 
      error: `Failed to fetch connections: ${error.message}` 
    }, { status: 500 })
  }
}
