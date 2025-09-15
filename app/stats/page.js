'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AthleteStats from '../../components/AthleteStats'

export default function StatsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [strava, setStrava] = useState({ connected: false, athleteId: null, athleteName: '', expired: false })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, message: '' })
  const [syncedActivities, setSyncedActivities] = useState([])
  const [showSyncResults, setShowSyncResults] = useState(false)
  const [currentActivity, setCurrentActivity] = useState(null)
  const [processedActivities, setProcessedActivities] = useState([])
  const [connections, setConnections] = useState([])
  const [error, setError] = useState(null)

  const checkStravaStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`/api/strava/status?sb=${encodeURIComponent(token)}`)
      const json = await res.json()
      console.log('Stats page - Strava status:', json)
      setStrava({
        connected: !!json.connected,
        athleteId: json.athleteId || null,
        athleteName: json.athleteName || '',
        expired: json.expired || false
      })
    } catch (e) {
      console.error('Error checking Strava status:', e)
    }
  }

  const loadConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`/api/strava/connections?sb=${encodeURIComponent(token)}`)
      const json = await res.json()
      
      if (json.error) {
        console.error('Error loading connections:', json.error)
      } else {
        setConnections(json.connections || [])
      }
    } catch (e) {
      console.error('Error loading connections:', e)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await checkStravaStatus()
        await loadConnections()
      }
      setLoading(false)
    }
    getUser()
  }, [])

  // Check for Strava callback results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const stravaConnected = urlParams.get('strava_connected')
    const stravaError = urlParams.get('strava_error')
    
    // Validate URL parameters - only allow expected values
    const allowedErrors = [
      'missing_code', 'invalid_state', 'token_exchange_failed', 
      'missing_token_fields', 'missing_uid', 'config_missing', 'store_failed'
    ]
    
    console.log('Stats page - URL params check:', {
      stravaConnected,
      stravaError,
      fullURL: window.location.href
    })
    
    if (stravaConnected === '1') {
      console.log('Stats page - Strava connection successful, refreshing status...')
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      // Refresh status with delay to ensure DB is updated
      setTimeout(() => {
        console.log('Stats page - Refreshing status after callback')
        checkStravaStatus()
      }, 1000)
    } else if (stravaError && allowedErrors.includes(stravaError)) {
      console.error('Stats page - Strava connection error:', stravaError)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      // Safe error display - error is already validated
      setError(`Lỗi kết nối Strava: ${stravaError}`)
    } else if (stravaError) {
      // Unknown error - log but don't display to user
      console.error('Stats page - Unknown Strava error:', stravaError)
      window.history.replaceState({}, document.title, window.location.pathname)
      setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.')
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleStravaConnect = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    window.location.href = `/api/strava/start?sb=${encodeURIComponent(token || '')}`
  }

  const handleSyncData = async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    setSyncProgress({ current: 0, total: 0, message: 'Đang bắt đầu đồng bộ dữ liệu...' })
    setSyncedActivities([])
    setShowSyncResults(false)
    setCurrentActivity(null)
    setProcessedActivities([])
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      // Calculate date range: last 10 days to tomorrow
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)
      
      const tenDaysAgo = new Date(now)
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
      tenDaysAgo.setHours(0, 0, 0, 0)
      
      const after = Math.floor(tenDaysAgo.getTime() / 1000)
      const before = Math.floor(tomorrow.getTime() / 1000)
      
      // Step 1: Preparing sync
      setSyncProgress({ current: 0, total: 5, message: 'Đang chuẩn bị đồng bộ dữ liệu...' })
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Step 2: Connecting to Strava
      setSyncProgress({ current: 1, total: 5, message: 'Đang kết nối với Strava API...' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 3: Fetching and processing activities page by page
      setSyncProgress({ current: 2, total: 5, message: 'Đang lấy dữ liệu hoạt động từ Strava...' })
      
      let allActivities = []
      let page = 1
      let hasMore = true
      let totalProcessed = 0
      
      while (hasMore) {
        const response = await fetch(`/api/strava/sync-progress?sb=${encodeURIComponent(token || '')}&page=${page}&after=${after}&before=${before}&athlete_id=${strava.athleteId}`)
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        // Process each activity in the current page
        for (let i = 0; i < result.activities.length; i++) {
          const activity = result.activities[i]
          totalProcessed++
          
          // Show current activity being processed
          setCurrentActivity({
            ...activity,
            index: totalProcessed,
            total: totalProcessed + (result.hasMore ? '...' : '')
          })
          
          // Add to processed activities list
          setProcessedActivities(prev => [...prev, activity])
          
          // Update progress message
          setSyncProgress({ 
            current: 2, 
            total: 5, 
            message: `Đang xử lý hoạt động ${totalProcessed}: ${activity.name}` 
          })
          
          // Small delay to show each activity
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        allActivities = allActivities.concat(result.activities)
        hasMore = result.hasMore
        page++
        
        // Small delay between pages
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      // Step 4: Saving to database
      setSyncProgress({ current: 3, total: 5, message: 'Đang lưu dữ liệu vào cơ sở dữ liệu...' })
      setCurrentActivity(null)
      
      const syncResponse = await fetch(`/api/strava/sync?sb=${encodeURIComponent(token || '')}&after=${after}&before=${before}&athlete_id=${strava.athleteId}`)
      const syncResult = await syncResponse.json()
      
      if (syncResult.error) {
        throw new Error(syncResult.error)
      }
      
      // Step 5: Complete
      setSyncProgress({ 
        current: 4, 
        total: 5, 
        message: `✅ Đồng bộ hoàn tất! Đã đồng bộ ${syncResult.synced}/${syncResult.total} hoạt động` 
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show results
      setSyncProgress({ current: 5, total: 5, message: 'Đang tải danh sách hoạt động đã đồng bộ...' })
      setSyncedActivities(allActivities)
      setShowSyncResults(true)
      
    } catch (error) {
      console.error('Sync error:', error)
      setSyncProgress({ 
        current: 0, 
        total: 5, 
        message: `❌ Lỗi đồng bộ: ${error.message}` 
      })
      setCurrentActivity(null)
    } finally {
      // Keep syncing state for a bit longer to show final message
      setTimeout(() => {
        setIsSyncing(false)
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="loading">Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Vui lòng đăng nhập để xem thống kê</h2>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <header style={{
        backgroundColor: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#000'}}>🏆 <b>Chào mừng bạn đến với câu lạc bộ 100K</b></h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user.email === 'rongcatlinh@gmail.com' && (
            <button
              onClick={() => { window.location.href = '/?tab=profile' }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FC4C02',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Hồ sơ
            </button>
          )}
          <span style={{ color: '#666' }}>
            Xin chào, {user.user_metadata?.full_name?.split(' ')[0] || 'Thành viên'}!
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main style={{ padding: '16px' }}>
        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px',
            color: '#dc2626'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Athlete (user) info section similar to Profile */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
          padding: '16px',
          margin: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Profile */}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#000' }}>
              {user.user_metadata?.full_name || user.user_metadata?.name || 'Thành viên'}
            </div>
            <div style={{ color: '#000', opacity: 0.75, marginTop: 4 }}>
              {user.email}
            </div>
          </div>

          {/* Strava status + connect button */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#777' }}>Strava</div>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: strava.connected && !strava.expired ? '#16a34a' : '#dc2626' 
            }}>
              {strava.connected && !strava.expired ? 'Đã kết nối' : 
               strava.expired ? 'Token hết hạn' : 'Chưa kết nối'}
            </div>
            {(strava.connected || strava.expired) && (
              <div style={{ marginTop: 4, color: '#000' }}>
                <div><strong>Athlete ID:</strong> {strava.athleteId || 'N/A'}</div>
                <div><strong>Tên VĐV:</strong> {strava.athleteName || 'N/A'}</div>
              </div>
            )}
            {strava.expired && (
              <div style={{ 
                marginTop: 4, 
                fontSize: 12, 
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #fecaca'
              }}>
                ⚠️ Token đã hết hạn
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
              <button
                onClick={handleStravaConnect}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FC4C02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {strava.connected && !strava.expired ? 'Kết nối lại' : 'Kết nối Strava'}
              </button>
              {strava.connected && !strava.expired && (
                <>
                  <button
                    onClick={handleSyncData}
                    disabled={isSyncing}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isSyncing ? '#9ca3af' : '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isSyncing ? 'not-allowed' : 'pointer',
                      opacity: isSyncing ? 0.7 : 1
                    }}
                  >
                    {isSyncing ? 'Đang đồng bộ...' : 'Lấy dữ liệu Strava'}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Sync Progress */}
        {isSyncing && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
            padding: '20px',
            margin: '16px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', marginBottom: '15px', textAlign: 'center' }}>
              🔄 Đang đồng bộ dữ liệu Strava
            </div>
            
            {/* Progress Bar */}
            {syncProgress.total > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div 
                    style={{
                      width: `${(syncProgress.current / syncProgress.total) * 100}%`,
                      height: '25px',
                      backgroundColor: '#16a34a',
                      transition: 'width 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {Math.round((syncProgress.current / syncProgress.total) * 100)}%
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span>Bước {syncProgress.current}/{syncProgress.total}</span>
                  <span>{syncProgress.current === syncProgress.total ? 'Hoàn thành!' : 'Đang xử lý...'}</span>
                </div>
              </div>
            )}
            
            {/* Current Activity */}
            {currentActivity && (
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                border: '2px solid #16a34a'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>
                  🏃‍♂️ Đang xử lý hoạt động {currentActivity.index}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                  {currentActivity.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <strong>Loại:</strong> {currentActivity.type === 'Run' ? '🏃 Chạy bộ' : 
                                           currentActivity.type === 'Ride' ? '🚴 Đạp xe' : 
                                           currentActivity.type === 'Swim' ? '🏊 Bơi lội' : '🏅 Khác'}
                  </div>
                  <div>
                    <strong>Khoảng cách:</strong> {currentActivity.distance_km} km
                  </div>
                  <div>
                    <strong>Thời gian:</strong> {currentActivity.duration_minutes} phút
                  </div>
                  <div>
                    <strong>Pace:</strong> {currentActivity.pace} min/km
                  </div>
                  <div>
                    <strong>Ngày:</strong> {new Date(currentActivity.start_date).toLocaleDateString('vi-VN')}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong> 
                    <span style={{ 
                      color: currentActivity.is_valid ? '#16a34a' : '#dc2626',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {currentActivity.is_valid ? '✅ Hợp lệ' : '❌ Không hợp lệ'}
                    </span>
                  </div>
                </div>
                {!currentActivity.is_valid && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '11px', 
                    color: '#dc2626',
                    backgroundColor: '#fef2f2',
                    padding: '5px',
                    borderRadius: '4px'
                  }}>
                    <strong>Lý do:</strong> {currentActivity.validation_reason}
                  </div>
                )}
              </div>
            )}
            
            {/* Processed Activities List */}
            {processedActivities.length > 0 && (
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '15px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                  📋 Hoạt động đã xử lý ({processedActivities.length})
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {processedActivities.slice(-5).map((activity, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '3px 0',
                      borderBottom: index < processedActivities.slice(-5).length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <span style={{ flex: 1, marginRight: '10px' }}>{activity.name}</span>
                      <span style={{ 
                        color: activity.is_valid ? '#16a34a' : '#dc2626',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}>
                        {activity.is_valid ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                  {processedActivities.length > 5 && (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '5px', fontSize: '11px' }}>
                      ... và {processedActivities.length - 5} hoạt động khác
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Status Message */}
            <div style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginTop: '15px' }}>
              {syncProgress.message}
            </div>
          </div>
        )}

        {/* Sync Results */}
        {showSyncResults && syncedActivities.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
            padding: '20px',
            margin: '16px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', marginBottom: '15px' }}>
              ✅ Danh sách hoạt động đã đồng bộ (10 ngày gần nhất)
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Tên hoạt động</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Khoảng cách</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Thời gian</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Loại</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Ngày</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {syncedActivities.map((activity, index) => {
                    const pace = activity.distance_km && activity.duration_minutes 
                      ? (activity.duration_minutes / activity.distance_km).toFixed(1)
                      : '-'
                    const isValid = activity.is_valid !== false
                    
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                        <td style={{ padding: '10px' }}>{activity.name}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {activity.distance_km ? `${activity.distance_km} km` : '-'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {activity.duration_minutes ? `${activity.duration_minutes} phút` : '-'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {activity.activity_type === 'Run' ? '🏃' : 
                           activity.activity_type === 'Ride' ? '🚴' : 
                           activity.activity_type === 'Swim' ? '🏊' : '🏅'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {activity.activity_date}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {isValid ? (
                            <span style={{ 
                              color: '#16a34a', 
                              fontWeight: 'bold',
                              backgroundColor: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              ✓ Hợp lệ
                            </span>
                          ) : (
                            <span style={{ 
                              color: '#dc2626', 
                              fontWeight: 'bold',
                              backgroundColor: '#fef2f2',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              ✕ Không hợp lệ
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '15px', textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowSyncResults(false)
                  window.location.reload()
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✅ OK - Cập nhật trang
              </button>
              <button
                onClick={() => setShowSyncResults(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Đóng danh sách
              </button>
            </div>
          </div>
        )}


        <AthleteStats />
      </main>

      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <p style={{ margin: 0 }}>&copy; 2025 Sport Club 100k. Have fun v0.07!</p>
      </footer>
    </div>
  )
}
