'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ActivityNotifications({ user }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      // Fetch unread notifications count
      const unreadRes = await fetch(`/api/notifications?sb=${encodeURIComponent(token)}&unread_only=true&limit=1`)
      const unreadData = await unreadRes.json()
      setUnreadCount(unreadData.total || 0)

      // Fetch recent notifications
      const res = await fetch(`/api/notifications?sb=${encodeURIComponent(token)}&limit=10`)
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds) => {
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      await fetch(`/api/notifications?sb=${encodeURIComponent(token)}&ids=${notificationIds.join(',')}`, {
        method: 'POST'
      })

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif.id) 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const formatDistance = (distance) => {
    return distance ? `${distance.toFixed(2)} km` : 'N/A'
  }

  const formatPace = (pace) => {
    return pace ? `${pace.toFixed(2)} phút/km` : 'N/A'
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    return `${diffDays} ngày trước`
  }

  if (!user) return null

  return (
    <div style={{ position: 'relative', marginTop: '12px' }}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          backgroundColor: unreadCount > 0 ? '#28a745' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        🔔 Thông báo hoạt động
        {unreadCount > 0 && (
          <span style={{
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '10px',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto',
          marginTop: '4px'
        }}>
          <div style={{
            padding: '12px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              Hoạt động mới ({notifications.length})
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  const unreadIds = notifications
                    .filter(n => !n.read_at)
                    .map(n => n.id)
                  if (unreadIds.length > 0) {
                    markAsRead(unreadIds)
                  }
                }}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>
              Đang tải...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
              Chưa có thông báo nào
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: notification.read_at ? 'white' : '#f8f9fa',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (!notification.read_at) {
                      markAsRead([notification.id])
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: notification.is_valid ? '#28a745' : '#dc3545',
                        marginBottom: '4px'
                      }}>
                        {notification.is_valid ? '✅ Hoạt động hợp lệ' : '❌ Hoạt động không hợp lệ'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {notification.activity_name || 'Hoạt động không tên'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                        Quãng đường: {formatDistance(notification.distance_km)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                        Tốc độ: {formatPace(notification.pace_min_per_km)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#999' }}>
                        {formatTimeAgo(notification.created_at)}
                      </div>
                    </div>
                    {!notification.read_at && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#007bff',
                        borderRadius: '50%',
                        marginLeft: '8px'
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
