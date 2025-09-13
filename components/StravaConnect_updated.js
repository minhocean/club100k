'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ActivityNotifications from './ActivityNotifications'
import WebhookSetup from './WebhookSetup'

export default function StravaConnect({ user }) {
  const [status, setStatus] = useState({ loading: true, connected: false })
  const [activities, setActivities] = useState([])
  const [loadingActs, setLoadingActs] = useState(false)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [dbActivities, setDbActivities] = useState([])
  const [loadingDb, setLoadingDb] = useState(false)
  const [showDbData, setShowDbData] = useState(false)
  const [dbCurrentPage, setDbCurrentPage] = useState(1)
  const [dbItemsPerPage, setDbItemsPerPage] = useState(10)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, message: '' })
  const [athletes, setAthletes] = useState([])
  const [athletesLoading, setAthletesLoading] = useState(false)
  const [selectedAthletes, setSelectedAthletes] = useState([])

  useEffect(() => {
    const today = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(today.getMonth() - 3)

    setDateFrom(threeMonthsAgo.toISOString().split('T')[0])
    setDateTo(today.toISOString().split('T')[0])
    
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
    
    const check = async () => {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      const user = session?.data?.session?.user
      
      // Get Google user name from props or session
      if (user) {
        console.log('User data from props:', user)
        console.log('User metadata:', user.user_metadata)
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Người dùng'
        console.log('Extracted name:', fullName)
        setUserName(fullName)
      } else {
        console.log('No user found in props, checking session')
        const sessionUser = session?.data?.session?.user
        if (sessionUser) {
          const fullName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'Người dùng'
          setUserName(fullName)
        }
      }
      
      const res = await fetch(`/api/strava/status?sb=${encodeURIComponent(token || '')}`)
      const json = await res.json()
      console.log('Strava status check result:', json)
      setStatus({ 
        loading: false, 
        connected: !!json.connected, 
        athleteId: json.athleteId,
        athleteName: json.athleteName 
      })

      try {
        setAthletesLoading(true)
        const statsRes = await fetch(`/api/strava/athlete-stats?sb=${encodeURIComponent(token || '')}`)
        const statsJson = await statsRes.json()
        const list = Array.isArray(statsJson.athletes) ? statsJson.athletes.map(a => ({ id: a.athlete_id, name: a.athlete_name })) : []
        setAthletes(list)
      } catch (e) {
      } finally {
        setAthletesLoading(false)
      }
    }
    check()
  }, [])

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

  const handleConnect = async () => {
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token
    window.location.href = `/api/strava/start?sb=${encodeURIComponent(token || '')}`
  }

  const handleLoadActivities = async () => {
    if (!dateFrom || !dateTo) {
      setError('Vui lòng chọn khoảng thời gian')
      return
    }
    
    setLoadingActs(true)
    setError('')
    setActivities([])
    setCurrentPage(1)
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token
    
    // Convert dates to Unix timestamps for Strava API
    const fromTimestamp = Math.floor(new Date(dateFrom).getTime() / 1000)
    const toTimestamp = Math.floor(new Date(dateTo).getTime() / 1000)
    
    const res = await fetch(`/api/strava/activities?sb=${encodeURIComponent(token || '')}&after=${fromTimestamp}&before=${toTimestamp}`)
    const json = await res.json()
    if (json.error) setError(json.error)
    const activitiesData = Array.isArray(json.activities) ? json.activities : []
    setActivities(activitiesData)
    setTotalPages(Math.ceil(activitiesData.length / itemsPerPage))
    setLoadingActs(false)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value)
    setItemsPerPage(newItemsPerPage)
    setTotalPages(Math.ceil(activities.length / newItemsPerPage))
    setCurrentPage(1)
  }

  const getMonthlyTotals = (activities) => {
    const monthlyData = {}
    activities.forEach(activity => {
      const date = new Date(activity.start_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const distance = activity.distance ? activity.distance / 1000 : 0
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalDistance: 0,
          activities: []
        }
      }
      monthlyData[monthKey].totalDistance += distance
      monthlyData[monthKey].activities.push(activity)
    })
    
    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month))
  }

  const getPaginatedActivities = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return activities.slice(startIndex, endIndex)
  }

  const handleSyncActivities = async () => {
    if (!dateFrom || !dateTo) {
      setSyncMessage('Vui lòng chọn khoảng thời gian')
      return
    }
    
    setSyncing(true)
    setSyncMessage('')
    setSyncProgress({ current: 0, total: 0, message: 'Đang bắt đầu đồng bộ...' })
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token
    
    const fromTimestamp = Math.floor(new Date(dateFrom).getTime() / 1000)
    const toTimestamp = Math.floor(new Date(dateTo).getTime() / 1000)
    
    try {
      const athletesToSync = selectedAthletes.length > 0 ? selectedAthletes : (status.athleteId ? [status.athleteId] : [])
      if (athletesToSync.length === 0) {
        setSyncMessage('Không có vận động viên để đồng bộ')
        return
      }
      setSyncProgress({ current: 0, total: athletesToSync.length, message: 'Đang tải dữ liệu từ Strava...' })
      let totalSynced = 0
      let totalFetched = 0
      const allErrors = []
      for (let i = 0; i < athletesToSync.length; i++) {
        const athleteId = athletesToSync[i]
        const name = athletes.find(a => a.id === athleteId)?.name || athleteId
        setSyncProgress({ current: i + 1, total: athletesToSync.length, message: `Đang đồng bộ: ${name}` })
        const url = `/api/strava/sync?sb=${encodeURIComponent(token || '')}&after=${fromTimestamp}&before=${toTimestamp}&athlete_id=${encodeURIComponent(athleteId)}`
        const res = await fetch(url)
        if (!res.ok) {
          const errorText = await res.text()
          allErrors.push(`${name}: ${res.status} - ${errorText}`)
          continue
        }
        const json = await res.json()
        if (json.error) {
          allErrors.push(`${name}: ${json.error}`)
        } else {
          totalSynced += json.synced || 0
          totalFetched += json.total || 0
          if (json.errors && json.errors.length > 0) {
            allErrors.push(...json.errors.map(e => `${name}: ${e}`))
          }
        }
      }
      const okMsg = `Đồng bộ xong ${athletesToSync.length} VĐV. Đã lưu ${totalSynced}/${totalFetched} hoạt động`
      setSyncMessage(allErrors.length > 0 ? `${okMsg}. Lỗi: ${allErrors.slice(0,5).join('; ')}` : okMsg)
    } catch (error) {
      console.error('Sync fetch error:', error)
      setSyncMessage(`Lỗi kết nối: ${error.message}`)
    } finally {
      setSyncing(false)
      setSyncProgress({ current: 0, total: 0, message: '' })
    }
  }

  const toggleAthlete = (id) => {
    setSelectedAthletes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAllAthletes = () => {
    setSelectedAthletes(athletes.map(a => a.id))
  }

  const clearSelectedAthletes = () => {
    setSelectedAthletes([])
  }

  const handleLoadDbActivities = async () => {
    setLoadingDb(true)
    setError('')
    setDbActivities([])
    setShowDbData(true)
    setDbCurrentPage(1)
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token
    
    try {
      const res = await fetch(`/api/strava/db-activities?sb=${encodeURIComponent(token || '')}`)
      const json = await res.json()
      
      if (json.error) {
        setError(json.error)
      } else {
        setDbActivities(json.activities || [])
      }
    } catch (error) {
      console.error('Database fetch error:', error)
      setError(`Lỗi kết nối: ${error.message}`)
    } finally {
      setLoadingDb(false)
    }
  }

  const handleDbPageChange = (page) => {
    setDbCurrentPage(page)
  }

  const handleDbItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value)
    setDbItemsPerPage(newItemsPerPage)
    setDbCurrentPage(1)
  }

  const getDbMonthlyTotals = (activities) => {
    const monthlyData = {}
    activities.forEach(activity => {
      const date = new Date(activity.activity_date.split('/').reverse().join('-'))
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const distance = parseFloat(activity.distance_km) || 0
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalDistance: 0,
          activities: []
        }
      }
      monthlyData[monthKey].totalDistance += distance
      monthlyData[monthKey].activities.push(activity)
    })
    
    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month))
  }

  const getDbPaginatedActivities = () => {
    const startIndex = (dbCurrentPage - 1) * dbItemsPerPage
    const endIndex = startIndex + dbItemsPerPage
    return dbActivities.slice(startIndex, endIndex)
  }

  if (status.loading) return <div className="loading">Đang kiểm tra kết nối Strava...</div>

  if (status.connected) {
    return (
      <div className="user-info" style={{ marginTop: 16 }}>
        <h3>Strava</h3>
        <div className="info-item">
          <span className="info-label">Trạng thái:</span>
          <span className="info-value">Đã kết nối</span>
        </div>
        {status.athleteId && (
          <div className="info-item">
            <span className="info-label">Athlete ID:</span>
            <span className="info-value">{status.athleteId}</span>
          </div>
        )}
        {status.athleteName && (
          <div className="info-item">
            <span className="info-label">Tên vận động viên:</span>
            <span className="info-value">{status.athleteName}</span>
          </div>
        )}
        <ActivityNotifications user={user} />
        <WebhookSetup user={user} />
        {/* Athlete multi-select */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: 8 }}>Chọn vận động viên để đồng bộ</div>
          {athletesLoading ? (
            <div style={{ fontSize: '12px' }}>Đang tải danh sách vận động viên...</div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="join-button"
                onClick={selectAllAthletes}
                style={{ backgroundColor: '#6f42c1' }}
              >
                Chọn tất cả
              </button>
              <button 
                className="join-button"
                onClick={clearSelectedAthletes}
                style={{ backgroundColor: '#6c757d' }}
              >
                Bỏ chọn
              </button>
              <span style={{ fontSize: '12px' }}>
                Đã chọn: {selectedAthletes.length}
              </span>
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {athletes.map(a => (
              <label key={a.id} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 6, background: selectedAthletes.includes(a.id) ? '#e6f7ff' : 'white' }}>
                <input
                  type="checkbox"
                  checked={selectedAthletes.includes(a.id)}
                  onChange={() => toggleAthlete(a.id)}
                />
                <span>{a.name} (ID: {a.id})</span>
              </label>
            ))}
            {athletes.length === 0 && !athletesLoading && (
              <div style={{ fontSize: '12px', color: '#666' }}>Chưa có dữ liệu vận động viên</div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {/* Date range selection */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Từ ngày:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Đến ngày:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <button className="join-button" onClick={handleLoadActivities} disabled={loadingActs}>
              {loadingActs ? 'Đang tải hoạt động...' : 'Tải dữ liệu'}
            </button>
            <button 
              className="join-button" 
              onClick={handleSyncActivities} 
              disabled={syncing || loadingActs}
              style={{ 
                backgroundColor: syncing ? '#6c757d' : '#28a745',
                marginLeft: '8px'
              }}
            >
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ vào DB'}
            </button>
            <button 
              className="join-button" 
              onClick={handleLoadDbActivities} 
              disabled={loadingDb}
              style={{ 
                backgroundColor: loadingDb ? '#6c757d' : '#17a2b8',
                marginLeft: '8px'
              }}
            >
              {loadingDb ? 'Đang tải...' : 'Hiển thị dữ liệu DB'}
            </button>
          </div>
          
          {/* Pagination controls */}
          {activities.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '12px' }}>Số dòng/trang:</label>
                <select 
                  value={itemsPerPage} 
                  onChange={handleItemsPerPageChange}
                  style={{ padding: '4px', fontSize: '12px' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>
        {error && <div className="error" style={{ marginTop: 8, color: '#c00' }}>{error}</div>}
        {syncProgress.message && (
          <div style={{ 
            marginTop: 8, 
            color: '#007bff',
            fontSize: '12px',
            padding: '8px',
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '4px'
          }}>
            {syncProgress.message}
          </div>
        )}
        {syncMessage && (
          <div style={{ 
            marginTop: 8, 
            color: syncMessage.includes('thành công') ? '#28a745' : '#c00',
            fontSize: '12px',
            padding: '8px',
            backgroundColor: syncMessage.includes('thành công') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${syncMessage.includes('thành công') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            {syncMessage}
          </div>
        )}
        {activities.length > 0 && (
          <div className="activities" style={{ marginTop: 12 }}>
            <h4 style={{ marginBottom: 12, color: '#333' }}>
              Hoạt động từ {dateFrom} đến {dateTo} ({activities.length} hoạt động)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Mã người dùng</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên người dùng</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Số km</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tốc độ TB (km/h)</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thời gian (phút)</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Loại hoạt động</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ngày</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Giờ bắt đầu</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Giờ kết thúc</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedActivities()
                    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
                    .map((a, idx) => {
                      const startDate = new Date(a.start_date)
                      const endDate = new Date(a.start_date_local)
                      const duration = a.moving_time || a.elapsed_time || 0
                      const distance = a.distance ? (a.distance / 1000).toFixed(2) : 0
                      const avgSpeed = a.average_speed ? (a.average_speed * 3.6).toFixed(2) : 0
                      const durationMinutes = Math.floor(duration / 60)
                      
                      return (
                        <tr key={idx} style={{ 
                          backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white',
                          borderBottom: '1px solid #eee'
                        }}>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{a.athlete?.id || 'N/A'}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{userName || 'N/A'}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{distance} km</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{avgSpeed}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{durationMinutes}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{a.sport_type || a.type || 'N/A'}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{startDate.toLocaleDateString('vi-VN')}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{startDate.toLocaleTimeString('vi-VN')}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{endDate.toLocaleTimeString('vi-VN')}</td>
                          <td style={{ padding: '8px' }}>{a.name || 'N/A'}</td>
                        </tr>
                      )
                    })}
                  
                  {/* Monthly totals */}
                  {getMonthlyTotals(activities).map((monthData, idx) => (
                    <tr key={`total-${monthData.month}`} style={{ 
                      backgroundColor: '#e8f4fd',
                      fontWeight: 'bold',
                      borderTop: '2px solid #2196F3'
                    }}>
                      <td colSpan="2" style={{ padding: '8px', borderRight: '1px solid #eee' }}>
                        Tổng tháng {monthData.month}
                      </td>
                      <td style={{ 
                        padding: '8px', 
                        borderRight: '1px solid #eee',
                        color: monthData.totalDistance < 100 ? 'red' : 'black'
                      }}>
                        {monthData.totalDistance.toFixed(2)} km
                      </td>
                      <td colSpan="7" style={{ padding: '8px' }}>
                        {monthData.activities.length} hoạt động
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{ 
                marginTop: '12px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: currentPage === 1 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Đầu
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: currentPage === 1 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Trước
                </button>
                
                <span style={{ fontSize: '12px', padding: '0 8px' }}>
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: currentPage === totalPages ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Sau
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: currentPage === totalPages ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cuối
                </button>
              </div>
            )}
          </div>
        )}

        {/* Database Activities Display */}
        {showDbData && (
          <div className="activities" style={{ marginTop: 12 }}>
            <h4 style={{ marginBottom: 12, color: '#333' }}>
              Dữ liệu từ cơ sở dữ liệu ({dbActivities.length} hoạt động)
            </h4>
            
            {/* Pagination controls for database data */}
            {dbActivities.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px' }}>Số dòng/trang:</label>
                  <select 
                    value={dbItemsPerPage} 
                    onChange={handleDbItemsPerPageChange}
                    style={{ padding: '4px', fontSize: '12px' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px' }}>Trang:</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.ceil(dbActivities.length / dbItemsPerPage)}
                    value={dbCurrentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value)
                      if (page >= 1 && page <= Math.ceil(dbActivities.length / dbItemsPerPage)) {
                        setDbCurrentPage(page)
                      }
                    }}
                    style={{ 
                      padding: '4px', 
                      fontSize: '12px', 
                      width: '60px',
                      border: '1px solid #ccc', 
                      borderRadius: '4px' 
                    }}
                  />
                  <span style={{ fontSize: '12px' }}>
                    / {Math.ceil(dbActivities.length / dbItemsPerPage)}
                  </span>
                </div>
              </div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Athlete ID</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên người dùng</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Mã hoạt động Strava</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Số km</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tốc độ TB (km/h)</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Số phút hoạt động</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ngày phát sinh</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Giờ bắt đầu</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Giờ kết thúc</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Loại hoạt động</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Địa điểm hoạt động</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên hoạt động</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {getDbPaginatedActivities()
                    .sort((a, b) => new Date(b.activity_date.split('/').reverse().join('-')) - new Date(a.activity_date.split('/').reverse().join('-')))
                    .map((activity, idx) => {
                      const isInvalid = activity.is_valid === false
                      return (
                        <tr key={idx} style={{ 
                          //backgroundColor: isInvalid ? '#ffebee' : (idx % 2 === 0 ? '#fafafa' : 'white'),
                          borderBottom: '1px solid #eee',
                          color: isInvalid ? '#d32f2f' : 'inherit'
                        }}>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.athlete_id}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.username}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.strava_activity_id}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.distance_km} km</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.average_speed_kmh}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.duration_minutes}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.activity_date}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.start_time}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.end_time}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.activity_type}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.location}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{activity.activity_name}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: isInvalid ? '#ffcdd2' : '#c8e6c9',
                              color: isInvalid ? '#d32f2f' : '#2e7d32'
                            }}>
                              {isInvalid ? 'Không hợp lệ' : 'Hợp lệ'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  
                  {/* Monthly totals for database data */}
                  {getDbMonthlyTotals(dbActivities).map((monthData, idx) => (
                    <tr key={`db-total-${monthData.month}`} style={{ 
                      backgroundColor: '#e8f4fd',
                      fontWeight: 'bold',
                      borderTop: '2px solid #2196F3'
                    }}>
                      <td colSpan="3" style={{ padding: '8px', borderRight: '1px solid #eee' }}>
                        Tổng tháng {monthData.month}
                      </td>
                      <td style={{ 
                        padding: '8px', 
                        borderRight: '1px solid #eee',
                        color: monthData.totalDistance < 100 ? 'red' : 'black'
                      }}>
                        {monthData.totalDistance.toFixed(2)} km
                      </td>
                      <td colSpan="9" style={{ padding: '8px' }}>
                        {monthData.activities.length} hoạt động
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls for database data */}
            {Math.ceil(dbActivities.length / dbItemsPerPage) > 1 && (
              <div style={{ 
                marginTop: '12px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => handleDbPageChange(1)}
                  disabled={dbCurrentPage === 1}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: dbCurrentPage === 1 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: dbCurrentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Đầu
                </button>
                <button 
                  onClick={() => handleDbPageChange(dbCurrentPage - 1)}
                  disabled={dbCurrentPage === 1}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: dbCurrentPage === 1 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: dbCurrentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Trước
                </button>
                
                <span style={{ fontSize: '12px', padding: '0 8px' }}>
                  Trang {dbCurrentPage} / {Math.ceil(dbActivities.length / dbItemsPerPage)}
                </span>
                
                <button 
                  onClick={() => handleDbPageChange(dbCurrentPage + 1)}
                  disabled={dbCurrentPage >= Math.ceil(dbActivities.length / dbItemsPerPage)}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: dbCurrentPage >= Math.ceil(dbActivities.length / dbItemsPerPage) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: dbCurrentPage >= Math.ceil(dbActivities.length / dbItemsPerPage) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Sau
                </button>
                <button 
                  onClick={() => handleDbPageChange(Math.ceil(dbActivities.length / dbItemsPerPage))}
                  disabled={dbCurrentPage >= Math.ceil(dbActivities.length / dbItemsPerPage)}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    backgroundColor: dbCurrentPage >= Math.ceil(dbActivities.length / dbItemsPerPage) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: dbCurrentPage >= Math.ceil(dbActivities.length / dbItemsPerPage) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cuối
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <button className="join-button" onClick={handleConnect}>
      Kết nối Strava
    </button>
  )
}

