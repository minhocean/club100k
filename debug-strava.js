const { createClient } = require('@supabase/supabase-js')

// Test script để debug quá trình xác thực Strava
async function debugStravaAuth() {
  console.log('=== DEBUG STRAVA AUTHENTICATION ===')
  
  // Kiểm tra environment variables
  console.log('\n1. Checking environment variables...')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing')
  console.log('STRAVA_CLIENT_ID:', process.env.STRAVA_CLIENT_ID ? 'Present' : 'Missing')
  console.log('STRAVA_CLIENT_SECRET:', process.env.STRAVA_CLIENT_SECRET ? 'Present' : 'Missing')
  console.log('STRAVA_REDIRECT_URI:', process.env.STRAVA_REDIRECT_URI ? 'Present' : 'Missing')
  console.log('STRAVA_STATE_SECRET:', process.env.STRAVA_STATE_SECRET ? 'Present' : 'Missing')
  
  // Test Supabase connection
  console.log('\n2. Testing Supabase connection...')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase
      .from('strava_connections')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
    } else {
      console.log('Supabase connection successful')
      console.log('Sample strava_connections data:', data)
    }
  } catch (err) {
    console.error('Supabase connection failed:', err.message)
  }
  
  // Test Strava API endpoints
  console.log('\n3. Testing Strava API endpoints...')
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'
  
  try {
    // Test status endpoint without token
    const statusRes = await fetch(`${baseUrl}/api/strava/status`)
    const statusData = await statusRes.json()
    console.log('Status endpoint (no token):', statusData)
  } catch (err) {
    console.error('Status endpoint test failed:', err.message)
  }
  
  console.log('\n=== DEBUG COMPLETE ===')
}

// Chạy debug nếu được gọi trực tiếp
if (require.main === module) {
  debugStravaAuth().catch(console.error)
}

module.exports = { debugStravaAuth }

