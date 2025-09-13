// Script để kiểm tra thiết lập môi trường
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

function checkEnvironmentSetup() {
  console.log('=== KIỂM TRA THIẾT LẬP MÔI TRƯỜNG ===\n')
  
  // 1. Kiểm tra file .env.local
  console.log('1. Kiểm tra file .env.local...')
  const envLocalPath = path.join(process.cwd(), '.env.local')
  const envPath = path.join(process.cwd(), '.env')
  
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ File .env.local tồn tại')
    const envContent = fs.readFileSync(envLocalPath, 'utf8')
    console.log('   Nội dung file:')
    console.log('   ' + envContent.split('\n').join('\n   '))
  } else if (fs.existsSync(envPath)) {
    console.log('✅ File .env tồn tại')
    const envContent = fs.readFileSync(envPath, 'utf8')
    console.log('   Nội dung file:')
    console.log('   ' + envContent.split('\n').join('\n   '))
  } else {
    console.log('❌ Không tìm thấy file .env.local hoặc .env')
    console.log('   Vui lòng tạo file .env.local với nội dung:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here')
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here')
    console.log('   STRAVA_CLIENT_ID=your_strava_client_id_here')
    console.log('   STRAVA_CLIENT_SECRET=your_strava_client_secret_here')
    console.log('   STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback')
    console.log('   STRAVA_STATE_SECRET=your_random_secret_key_here')
    console.log('   NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000')
    return false
  }
  
  // 2. Kiểm tra các biến môi trường
  console.log('\n2. Kiểm tra các biến môi trường...')
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRAVA_CLIENT_ID',
    'STRAVA_CLIENT_SECRET',
    'STRAVA_REDIRECT_URI',
    'STRAVA_STATE_SECRET'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  if (missingVars.length > 0) {
    console.log('❌ Thiếu các biến môi trường:', missingVars)
    console.log('   Vui lòng kiểm tra file .env.local và restart terminal')
    return false
  }
  console.log('✅ Tất cả biến môi trường đã được thiết lập')
  
  // 3. Kiểm tra cấu trúc project
  console.log('\n3. Kiểm tra cấu trúc project...')
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'app/page.js',
    'components/StravaConnect.js',
    'app/api/strava/status/route.js',
    'app/api/strava/start/route.js',
    'app/api/strava/callback/route.js'
  ]
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)))
  if (missingFiles.length > 0) {
    console.log('❌ Thiếu các file:', missingFiles)
    return false
  }
  console.log('✅ Cấu trúc project đầy đủ')
  
  // 4. Kiểm tra dependencies
  console.log('\n4. Kiểm tra dependencies...')
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const requiredDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js']
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep])
    
    if (missingDeps.length > 0) {
      console.log('❌ Thiếu dependencies:', missingDeps)
      console.log('   Chạy: npm install')
      return false
    }
    console.log('✅ Dependencies đầy đủ')
  } catch (err) {
    console.log('❌ Lỗi đọc package.json:', err.message)
    return false
  }
  
  console.log('\n=== THIẾT LẬP HOÀN TẤT ===')
  console.log('\nBước tiếp theo:')
  console.log('1. Chạy: npm run dev')
  console.log('2. Mở trình duyệt: http://localhost:3000')
  console.log('3. Kiểm tra console logs để debug')
  console.log('4. Thử kết nối Strava và xem DebugInfo component')
  
  return true
}

// Chạy kiểm tra nếu được gọi trực tiếp
if (require.main === module) {
  checkEnvironmentSetup()
}

module.exports = { checkEnvironmentSetup }
