'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AthleteStats from '../../components/AthleteStats'

export default function StatsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [strava, setStrava] = useState({ connected: false, athleteId: null, athleteName: '', expired: false })

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

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await checkStravaStatus()
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
    } else if (stravaError) {
      console.error('Stats page - Strava connection error:', stravaError)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      alert(`Lỗi kết nối Strava: ${stravaError}`)
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
              <button
                onClick={checkStravaStatus}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Làm mới
              </button>
            </div>
          </div>
        </section>

        <AthleteStats />
      </main>

      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <p style={{ margin: 0 }}>&copy; 2025 Sport Club 100k. Have fun!</p>
      </footer>
    </div>
  )
}
