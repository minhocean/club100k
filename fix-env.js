// Script để sửa file .env.local
const fs = require('fs')
const path = require('path')

function fixEnvFile() {
  console.log('=== SỬA FILE .env.local ===\n')
  
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env.local không tồn tại')
    return false
  }
  
  // Đọc nội dung hiện tại
  const currentContent = fs.readFileSync(envPath, 'utf8')
  console.log('Nội dung hiện tại:')
  console.log(currentContent)
  
  // Tạo nội dung mới
  const newContent = `NODE_ENV=development
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://gahnvdutnhyqzoggxyif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaG52ZHV0bmh5cXpvZ2d4eWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzcxMjAsImV4cCI6MjA3MjkxMzEyMH0.IRouxmGD5ue58UQC98rHp24jV32lOq9HObLiS4wt1N0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaG52ZHV0bmh5cXpvZ2d4eWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMzNzEyMCwiZXhwIjoyMDcyOTEzMTIwfQ._f6kfTszuzIHN5tp_R3h0oSvXJaQzCkDYUqwTs28AFs
STRAVA_CLIENT_ID=132294
STRAVA_CLIENT_SECRET=e2ce18602262b880e1ccf5d70d041377af2fd0ad
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
STRAVA_STATE_SECRET=c034023480284024802
STRAVA_WEBHOOK_VERIFY_TOKEN=09340923lsflsf094i50sdf`
  
  try {
    // Backup file cũ
    const backupPath = envPath + '.backup'
    fs.writeFileSync(backupPath, currentContent)
    console.log(`✅ Đã backup file cũ thành: ${backupPath}`)
    
    // Ghi file mới
    fs.writeFileSync(envPath, newContent)
    console.log('✅ Đã sửa file .env.local')
    
    console.log('\nNội dung mới:')
    console.log(newContent)
    
    return true
  } catch (error) {
    console.error('❌ Lỗi khi sửa file:', error.message)
    return false
  }
}

// Chạy sửa file nếu được gọi trực tiếp
if (require.main === module) {
  fixEnvFile()
}

module.exports = { fixEnvFile }

