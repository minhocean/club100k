import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all connections that need athlete name updates
    const { data: connections, error: fetchError } = await supabase
      .from('strava_connections')
      .select('athlete_id, access_token, athlete_name')
      .or('athlete_name.is.null,athlete_name.like.Vận động viên%')

    if (fetchError) {
      console.error('Error fetching connections:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({ message: 'No connections need updating', updated: 0 })
    }

    let updatedCount = 0
    const errors = []

    // Update each connection
    for (const connection of connections) {
      try {
        // Call Strava API to get athlete details
        const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: {
            'Authorization': `Bearer ${connection.access_token}`
          }
        })

        if (!athleteResponse.ok) {
          console.error(`Failed to fetch athlete data for ${connection.athlete_id}:`, athleteResponse.status)
          errors.push(`Athlete ${connection.athlete_id}: API error ${athleteResponse.status}`)
          continue
        }

        const athleteData = await athleteResponse.json()
        const athleteName = athleteData.firstname && athleteData.lastname 
          ? `${athleteData.firstname} ${athleteData.lastname}`.trim()
          : athleteData.firstname || `Vận động viên ${connection.athlete_id}`

        // Update the connection with the athlete name
        const { error: updateError } = await supabase
          .from('strava_connections')
          .update({ athlete_name: athleteName })
          .eq('athlete_id', connection.athlete_id)

        if (updateError) {
          console.error(`Failed to update athlete name for ${connection.athlete_id}:`, updateError)
          errors.push(`Athlete ${connection.athlete_id}: Database error`)
        } else {
          updatedCount++
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error processing athlete ${connection.athlete_id}:`, error)
        errors.push(`Athlete ${connection.athlete_id}: ${error.message}`)
      }
    }

    return NextResponse.json({ 
      message: `Updated ${updatedCount} athlete names`,
      updated: updatedCount,
      total: connections.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
