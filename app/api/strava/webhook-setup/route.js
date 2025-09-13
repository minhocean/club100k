import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { STRAVA } from '../../../../lib/stravaEnv'
import { decodeJwtPayload } from '../../../../lib/jwtFallback'

export const runtime = 'nodejs'

// Helper function to force cleanup inactive webhooks
async function forceCleanupInactiveWebhooks() {
  try {
    const response = await fetch(`https://www.strava.com/api/v3/push_subscriptions?client_id=${STRAVA.CLIENT_ID}&client_secret=${STRAVA.CLIENT_SECRET}`)
    
    if (response.ok) {
      const subscriptions = await response.json()
      const inactiveWebhooks = subscriptions.filter(sub => !sub.active)
      
      if (inactiveWebhooks.length > 0) {
        console.log(`[WEBHOOK_CLEANUP] Found ${inactiveWebhooks.length} inactive webhook(s)`)
        
        for (const webhook of inactiveWebhooks) {
          try {
            const deleteResponse = await fetch(`https://www.strava.com/api/v3/push_subscriptions/${webhook.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: STRAVA.CLIENT_ID,
                client_secret: STRAVA.CLIENT_SECRET
              })
            })
            
            if (deleteResponse.ok) {
              console.log(`[WEBHOOK_CLEANUP] Cleaned up inactive webhook ${webhook.id}`)
            } else {
              console.log(`[WEBHOOK_CLEANUP] Could not clean up webhook ${webhook.id} (${deleteResponse.status})`)
            }
          } catch (error) {
            console.warn(`[WEBHOOK_CLEANUP] Error cleaning up webhook ${webhook.id}:`, error.message)
          }
        }
      }
    }
  } catch (error) {
    console.warn('[WEBHOOK_CLEANUP] Error during cleanup:', error.message)
  }
}

// GET: Check webhook subscription status
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('sb')
    
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

    // Check if webhook is already configured
    const webhookUrl = `${STRAVA.NEXT_PUBLIC_APP_BASE_URL}/api/strava/webhook`
    
    try {
      // Get existing subscriptions
      const response = await fetch(`https://www.strava.com/api/v3/push_subscriptions?client_id=${STRAVA.CLIENT_ID}&client_secret=${STRAVA.CLIENT_SECRET}`)
      
      if (!response.ok) {
        return NextResponse.json({ 
          error: 'Failed to check webhook status',
          details: await response.text()
        }, { status: 400 })
      }

      const subscriptions = await response.json()
      
      // Debug: Log all existing webhook URLs
      console.log(`[WEBHOOK_STATUS] Checking for webhook URL: ${webhookUrl}`)
      console.log(`[WEBHOOK_STATUS] Found ${subscriptions.length} existing subscriptions:`)
      subscriptions.forEach((sub, index) => {
        console.log(`[WEBHOOK_STATUS] ${index + 1}. ID: ${sub.id}, URL: ${sub.callback_url}`)
      })
      
      // Find webhook by exact URL match first
      let existingWebhook = subscriptions.find(sub => sub.callback_url === webhookUrl)
      
      // If no exact match, try to find by domain/path (more flexible matching)
      if (!existingWebhook) {
        const webhookPath = '/api/strava/webhook'
        existingWebhook = subscriptions.find(sub => 
          sub.callback_url && sub.callback_url.includes(webhookPath)
        )
        if (existingWebhook) {
          console.log(`[WEBHOOK_STATUS] Found webhook by path matching: ${existingWebhook.callback_url}`)
        }
      }
      
      return NextResponse.json({
        webhook_url: webhookUrl,
        is_configured: !!existingWebhook,
        subscription: existingWebhook || null,
        total_subscriptions: subscriptions.length,
        all_subscriptions: subscriptions // Include all for debugging
      })

    } catch (error) {
      console.error('Error checking webhook status:', error)
      return NextResponse.json({ 
        error: 'Failed to check webhook status',
        details: error.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Webhook setup API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create webhook subscription
export async function POST(request) {
  try {
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('sb')
    
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

    const webhookUrl = `${STRAVA.NEXT_PUBLIC_APP_BASE_URL}/api/strava/webhook`
    const verifyToken = STRAVA.WEBHOOK_VERIFY_TOKEN

    if (!verifyToken) {
      return NextResponse.json({ 
        error: 'Webhook verify token not configured' 
      }, { status: 400 })
    }

    try {
      // First cleanup any inactive webhooks
      await forceCleanupInactiveWebhooks()
      
      // Then check if webhook already exists
      const checkResponse = await fetch(`https://www.strava.com/api/v3/push_subscriptions?client_id=${STRAVA.CLIENT_ID}&client_secret=${STRAVA.CLIENT_SECRET}`)
      
      if (checkResponse.ok) {
        const existingSubscriptions = await checkResponse.json()
        const existingWebhook = existingSubscriptions.find(sub => sub.callback_url === webhookUrl && sub.active)
        
        if (existingWebhook) {
          console.log(`[WEBHOOK_SETUP] Active webhook already exists with ID ${existingWebhook.id}`)
          return NextResponse.json({
            success: true,
            subscription: existingWebhook,
            webhook_url: webhookUrl,
            message: 'Webhook subscription already exists',
            already_exists: true
          })
        }

        // If there's a different active webhook, delete it first
        const activeWebhooks = existingSubscriptions.filter(sub => sub.active)
        if (activeWebhooks.length > 0) {
          console.log(`[WEBHOOK_SETUP] Found ${activeWebhooks.length} active webhook(s), deleting them first`)
          for (const sub of activeWebhooks) {
            try {
              const deleteResponse = await fetch(`https://www.strava.com/api/v3/push_subscriptions/${sub.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  client_id: STRAVA.CLIENT_ID,
                  client_secret: STRAVA.CLIENT_SECRET
                })
              })
              
              if (deleteResponse.ok) {
                console.log(`[WEBHOOK_SETUP] Successfully deleted webhook ${sub.id}`)
              } else {
                const errorText = await deleteResponse.text()
                console.warn(`[WEBHOOK_SETUP] Failed to delete webhook ${sub.id} (${deleteResponse.status}): ${errorText}`)
                
                // If webhook is inactive or already deleted, continue anyway
                if (deleteResponse.status === 404 || errorText.includes('not found') || errorText.includes('inactive')) {
                  console.log(`[WEBHOOK_SETUP] Webhook ${sub.id} appears to be inactive/deleted, continuing...`)
                } else {
                  throw new Error(`Delete failed: ${errorText}`)
                }
              }
            } catch (error) {
              console.warn(`[WEBHOOK_SETUP] Error deleting webhook ${sub.id}:`, error.message)
              // Continue with creation even if deletion fails
            }
          }
        }
      }

      // Create webhook subscription
      const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: STRAVA.CLIENT_ID,
          client_secret: STRAVA.CLIENT_SECRET,
          callback_url: webhookUrl,
          verify_token: verifyToken
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Strava webhook creation failed:', response.status, errorText)
        
        // Handle "already exists" error specifically
        if (response.status === 400 && errorText.includes('already exists')) {
          return NextResponse.json({
            success: true,
            webhook_url: webhookUrl,
            message: 'Webhook subscription already exists',
            already_exists: true
          })
        }
        
        return NextResponse.json({ 
          error: 'Failed to create webhook subscription',
          details: errorText
        }, { status: 400 })
      }

      const subscription = await response.json()
      
      console.log(`[WEBHOOK_SETUP] Created webhook subscription ${subscription.id} for ${webhookUrl}`)
      
      return NextResponse.json({
        success: true,
        subscription: subscription,
        webhook_url: webhookUrl,
        message: 'Webhook subscription created successfully'
      })

    } catch (error) {
      console.error('Error creating webhook subscription:', error)
      return NextResponse.json({ 
        error: 'Failed to create webhook subscription',
        details: error.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Webhook setup API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Remove webhook subscription
export async function DELETE(request) {
  try {
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('sb')
    const subscriptionId = url.searchParams.get('id')
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
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

    try {
      // Delete webhook subscription
      const response = await fetch(`https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: STRAVA.CLIENT_ID,
          client_secret: STRAVA.CLIENT_SECRET
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Strava webhook deletion failed:', response.status, errorText)
        
        // Handle specific error cases
        if (response.status === 404 || errorText.includes('not found') || errorText.includes('inactive')) {
          console.log(`[WEBHOOK_SETUP] Webhook ${subscriptionId} appears to be already deleted or inactive`)
          return NextResponse.json({
            success: true,
            message: 'Webhook subscription was already deleted or inactive'
          })
        }
        
        return NextResponse.json({ 
          error: 'Failed to delete webhook subscription',
          details: errorText
        }, { status: 400 })
      }

      console.log(`[WEBHOOK_SETUP] Deleted webhook subscription ${subscriptionId}`)
      
      return NextResponse.json({
        success: true,
        message: 'Webhook subscription deleted successfully'
      })

    } catch (error) {
      console.error('Error deleting webhook subscription:', error)
      return NextResponse.json({ 
        error: 'Failed to delete webhook subscription',
        details: error.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Webhook setup API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
