import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { decodeJwtPayload } from '../../../lib/jwtFallback'

export const runtime = 'nodejs'

// GET: Fetch notifications for the current user
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('sb')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const unreadOnly = url.searchParams.get('unread_only') === 'true'

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from token
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
    let userId = userData?.user?.id
    
    if (!userId) {
      const payload = decodeJwtPayload(accessToken)
      userId = payload?.sub || payload?.user_id || null
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Build query
    let query = supabaseAdmin
      .from('activity_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('activity_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (unreadOnly) {
      countQuery = countQuery.is('read_at', null)
    }

    const { count } = await countQuery

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      has_more: (offset + limit) < (count || 0)
    })

  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Mark notifications as read
export async function POST(request) {
  try {
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('sb')
    const notificationIds = url.searchParams.get('ids')?.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from token
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
    let userId = userData?.user?.id
    
    if (!userId) {
      const payload = decodeJwtPayload(accessToken)
      userId = payload?.sub || payload?.user_id || null
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (!notificationIds || notificationIds.length === 0) {
      return NextResponse.json({ error: 'No notification IDs provided' }, { status: 400 })
    }

    // Mark notifications as read
    const { error } = await supabaseAdmin
      .from('activity_notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', notificationIds)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating notifications:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated_count: notificationIds.length })

  } catch (error) {
    console.error('Mark notifications API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
