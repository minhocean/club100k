# Hướng dẫn cập nhật StravaConnect.js

## Vấn đề cần fix:
Sau khi callback Strava thành công, trang hiển thị "chưa kết nối" mặc dù dữ liệu đã được lưu vào DB.

## Nguyên nhân:
Component không kiểm tra URL parameters `?strava_connected=1` để tự động refresh trạng thái.

## Cách cập nhật:

### Bước 1: Backup file hiện tại
```bash
cp components/StravaConnect.js components/StravaConnect_backup.js
```

### Bước 2: Thay thế file
```bash
cp components/StravaConnect_updated.js components/StravaConnect.js
```

### Bước 3: Kiểm tra thay đổi
So sánh file cũ và mới:
```bash
diff components/StravaConnect_backup.js components/StravaConnect.js
```

## Các thay đổi chính:

### 1. Thêm logic kiểm tra URL parameters (dòng 38-50):
```javascript
// Check for Strava connection success/error in URL parameters
const urlParams = new URLSearchParams(window.location.search)
const stravaConnected = urlParams.get('strava_connected')
const stravaError = urlParams.get('strava_error')

if (stravaConnected === '1') {
  console.log('Strava connection successful, refreshing status...')
  // Clear URL parameters
  window.history.replaceState({}, document.title, window.location.pathname)
} else if (stravaError) {
  console.error('Strava connection error:', stravaError)
  setError(`Lỗi kết nối Strava: ${stravaError}`)
  // Clear URL parameters
  window.history.replaceState({}, document.title, window.location.pathname)
}
```

### 2. Thêm logging debug (dòng 60):
```javascript
const res = await fetch(`/api/strava/status?sb=${encodeURIComponent(token || '')}`)
const json = await res.json()
console.log('Strava status check result:', json) // Thêm dòng này
```

### 3. Thêm useEffect mới để refresh status (dòng 83-110):
```javascript
// Add effect to refresh status when URL parameters change
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const stravaConnected = urlParams.get('strava_connected')
  
  if (stravaConnected === '1') {
    // Force refresh the status check
    const refreshStatus = async () => {
      try {
        const session = await supabase.auth.getSession()
        const token = session?.data?.session?.access_token
        
        if (token) {
          const res = await fetch(`/api/strava/status?sb=${encodeURIComponent(token)}`)
          const json = await res.json()
          console.log('Refreshed Strava status after callback:', json)
          setStatus({ 
            loading: false, 
            connected: !!json.connected, 
            athleteId: json.athleteId,
            athleteName: json.athleteName 
          })
        }
      } catch (error) {
        console.error('Error refreshing status:', error)
      }
    }
    
    refreshStatus()
  }
}, [window.location.search])
```

## Kết quả sau khi cập nhật:

✅ **Tự động phát hiện callback thành công** từ URL `?strava_connected=1`
✅ **Tự động refresh trạng thái** sau khi callback
✅ **Clear URL parameters** để giao diện sạch
✅ **Xử lý lỗi callback** nếu có `?strava_error=...`
✅ **Logging chi tiết** để debug

## Test sau khi cập nhật:

1. Deploy lên Vercel
2. Test kết nối Strava
3. Kiểm tra console logs để xem quá trình xử lý
4. Trạng thái sẽ tự động chuyển từ "chưa kết nối" sang "đã kết nối"

## Rollback nếu cần:
```bash
cp components/StravaConnect_backup.js components/StravaConnect.js
```

