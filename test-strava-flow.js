// Test script để kiểm tra toàn bộ luồng xác thực Strava
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function testStravaFlow() {
  console.log('=== TESTING STRAVA AUTHENTICATION FLOW ===\n')
  
  // 1. Kiểm tra environment variables
  console.log('1. Checking environment variables...')
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRAVA_CLIENT_ID',
    'STRAVA_CLIENT_SECRET',
    'STRAVA_REDIRECT_URI',
    'STRAVA_STATE_SECRET'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars)
    return
  }
  console.log('✅ All environment variables present\n')
  
  // 2. Test Supabase connection
  console.log('2. Testing Supabase connection...')
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
      console.error('❌ Supabase connection error:', error.message)
      return
    }
    console.log('✅ Supabase connection successful')
    console.log(`   Found ${data.length} strava_connections records\n`)
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message)
    return
  }
  
  // 3. Test API endpoints
  console.log('3. Testing API endpoints...')
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'
  
  // Test status endpoint without token
  try {
    console.log('   Testing /api/strava/status (no token)...')
    const statusRes = await fetch(`${baseUrl}/api/strava/status`)
    const statusData = await statusRes.json()
    console.log('   ✅ Status endpoint responds:', statusData)
  } catch (err) {
    console.error('   ❌ Status endpoint failed:', err.message)
  }
  
  // Test status endpoint with invalid token
  try {
    console.log('   Testing /api/strava/status (invalid token)...')
    const statusRes = await fetch(`${baseUrl}/api/strava/status?sb=invalid_token`)
    const statusData = await statusRes.json()
    console.log('   ✅ Status endpoint with invalid token:', statusData)
  } catch (err) {
    console.error('   ❌ Status endpoint with invalid token failed:', err.message)
  }
  
  // Test start endpoint without token
  try {
    console.log('   Testing /api/strava/start (no token)...')
    const startRes = await fetch(`${baseUrl}/api/strava/start`)
    console.log('   ✅ Start endpoint responds with status:', startRes.status)
  } catch (err) {
    console.error('   ❌ Start endpoint failed:', err.message)
  }
  
  console.log('\n4. Testing Strava OAuth URL construction...')
  const clientId = process.env.STRAVA_CLIENT_ID
  const redirectUri = process.env.STRAVA_REDIRECT_URI
  const scope = 'read,activity:read_all,profile:read_all'
  
  const testAuthUrl = new URL('https://www.strava.com/oauth/authorize')
  testAuthUrl.searchParams.set('client_id', clientId)
  testAuthUrl.searchParams.set('redirect_uri', redirectUri)
  testAuthUrl.searchParams.set('response_type', 'code')
  testAuthUrl.searchParams.set('approval_prompt', 'auto')
  testAuthUrl.searchParams.set('scope', scope)
  testAuthUrl.searchParams.set('state', 'test_state')
  
  console.log('✅ Strava OAuth URL constructed successfully')
  console.log('   URL:', testAuthUrl.toString())
  
  console.log('\n=== TEST COMPLETE ===')
  console.log('\nNext steps:')
  console.log('1. Start the application: npm run dev')
  console.log('2. Open browser and check console logs')
  console.log('3. Try connecting to Strava and monitor logs')
  console.log('4. Check DebugInfo component on the page')
}

// Chạy test nếu được gọi trực tiếp
if (require.main === module) {
  testStravaFlow().catch(console.error)
}

module.exports = { testStravaFlow }
