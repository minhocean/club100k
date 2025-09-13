'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function WebhookSetup({ user }) {
  const [webhookStatus, setWebhookStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      checkWebhookStatus()
    }
  }, [user])

  const checkWebhookStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      const res = await fetch(`/api/strava/webhook-setup?sb=${encodeURIComponent(token)}`)
      const data = await res.json()
      
      if (res.ok) {
        setWebhookStatus(data)
      } else {
        setError(data.error || 'Failed to check webhook status')
      }
    } catch (error) {
      console.error('Error checking webhook status:', error)
      setError('Failed to check webhook status')
    } finally {
      setLoading(false)
    }
  }

  const setupWebhook = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      const res = await fetch(`/api/strava/webhook-setup?sb=${encodeURIComponent(token)}`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (res.ok) {
        if (data.already_exists) {
          setMessage('Webhook đã tồn tại và hoạt động bình thường!')
        } else {
          setMessage('Webhook đã được thiết lập thành công!')
        }
        await checkWebhookStatus() // Refresh status
      } else {
        setError(data.error || 'Failed to setup webhook')
      }
    } catch (error) {
      console.error('Error setting up webhook:', error)
      setError('Failed to setup webhook')
    } finally {
      setLoading(false)
    }
  }

  const deleteWebhook = async () => {
    if (!webhookStatus?.subscription?.id) return
    
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      const res = await fetch(`/api/strava/webhook-setup?sb=${encodeURIComponent(token)}&id=${webhookStatus.subscription.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Webhook đã được xóa thành công!')
        await checkWebhookStatus() // Refresh status
      } else {
        setError(data.error || 'Failed to delete webhook')
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
      setError('Failed to delete webhook')
    } finally {
      setLoading(false)
    }
  }

  const cleanupAllWebhooks = async () => {
    if (!webhookStatus?.all_subscriptions || webhookStatus.all_subscriptions.length === 0) return
    
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      // Delete all existing webhooks
      const deletePromises = webhookStatus.all_subscriptions.map(sub => 
        fetch(`/api/strava/webhook-setup?sb=${encodeURIComponent(token)}&id=${sub.id}`, {
          method: 'DELETE'
        })
      )

      const results = await Promise.all(deletePromises)
      const failedDeletes = results.filter(res => !res.ok)
      
      if (failedDeletes.length === 0) {
        setMessage(`Đã xóa thành công ${webhookStatus.all_subscriptions.length} webhook(s)!`)
      } else {
        setMessage(`Đã xóa ${results.length - failedDeletes.length}/${results.length} webhook(s)`)
      }
      
      await checkWebhookStatus() // Refresh status
    } catch (error) {
      console.error('Error cleaning up webhooks:', error)
      setError('Failed to cleanup webhooks')
    } finally {
      setLoading(false)
    }
  }

  const forceCleanupAndRecreate = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      const res = await fetch(`/api/strava/webhook-setup?sb=${encodeURIComponent(token)}`, {
        method: 'PUT'
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Đã force cleanup và tạo webhook mới thành công!')
        await checkWebhookStatus() // Refresh status
      } else {
        setError(data.error || 'Failed to force cleanup webhook')
      }
    } catch (error) {
      console.error('Error force cleaning up webhook:', error)
      setError('Failed to force cleanup webhook')
    } finally {
      setLoading(false)
    }
  }

  const forceDeleteAll = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      if (!token) return

      const res = await fetch(`/api/strava/webhook-setup?sb=${encodeURIComponent(token)}`, {
        method: 'PATCH'
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage(`Đã force xóa tất cả webhook: ${data.message}`)
        await checkWebhookStatus() // Refresh status
      } else {
        setError(data.error || 'Failed to force delete all webhooks')
      }
    } catch (error) {
      console.error('Error force deleting all webhooks:', error)
      setError('Failed to force delete all webhooks')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
        🔗 Thiết lập Webhook Real-time 7
      </h4>
      
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
        Webhook cho phép đồng bộ hoạt động tự động khi vận động viên hoàn thành trên Strava.
      </div>

      {loading && (
        <div style={{ fontSize: '12px', color: '#007bff', marginBottom: '8px' }}>
          Đang kiểm tra...
        </div>
      )}

      {error && (
        <div style={{ 
          fontSize: '12px', 
          color: '#dc3545', 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '8px'
        }}>
          ❌ {error}
        </div>
      )}

      {message && (
        <div style={{ 
          fontSize: '12px', 
          color: '#28a745', 
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '8px'
        }}>
          ✅ {message}
        </div>
      )}

      {webhookStatus && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>
            <strong>Trạng thái:</strong> 
            <span style={{ 
              color: webhookStatus.is_configured ? '#28a745' : '#dc3545',
              marginLeft: '4px'
            }}>
              {webhookStatus.is_configured ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}
            </span>
          </div>
          
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>
            <strong>Webhook URL:</strong> 
            <code style={{ 
              fontSize: '10px', 
              backgroundColor: '#e9ecef', 
              padding: '2px 4px', 
              borderRadius: '3px',
              marginLeft: '4px'
            }}>
              {webhookStatus.webhook_url}
            </code>
          </div>

          {webhookStatus.subscription && (
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              <strong>Subscription ID:</strong> {webhookStatus.subscription.id}
            </div>
          )}

          <div style={{ fontSize: '12px', marginBottom: '4px' }}>
            <strong>Tổng subscriptions:</strong> {webhookStatus.total_subscriptions}
          </div>

          {/* Debug info for existing subscriptions */}
          {webhookStatus.all_subscriptions && webhookStatus.all_subscriptions.length > 0 && (
            <div style={{ 
              fontSize: '10px', 
              marginTop: '8px', 
              padding: '8px', 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '4px' 
            }}>
              <strong>Debug - Existing webhooks:</strong>
              {webhookStatus.all_subscriptions.map((sub, index) => (
                <div key={index} style={{ marginTop: '4px' }}>
                  <div><strong>ID:</strong> {sub.id}</div>
                  <div><strong>URL:</strong> {sub.callback_url}</div>
                  <div><strong>Active:</strong> {sub.active ? 'Yes' : 'No'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={checkWebhookStatus}
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          🔄 Kiểm tra trạng thái
        </button>

        {webhookStatus?.is_configured ? (
          <button
            onClick={deleteWebhook}
            disabled={loading}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🗑️ Xóa webhook
          </button>
        ) : (
          <button
            onClick={setupWebhook}
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            ⚙️ Thiết lập webhook
          </button>
        )}

        {webhookStatus?.all_subscriptions && webhookStatus.all_subscriptions.length > 0 && (
          <button
            onClick={cleanupAllWebhooks}
            disabled={loading}
            style={{
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🧹 Dọn dẹp tất cả
          </button>
        )}

        <button
          onClick={forceCleanupAndRecreate}
          disabled={loading}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          🔥 Force Cleanup & Tạo mới
        </button>

        <button
          onClick={forceDeleteAll}
          disabled={loading}
          style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          💀 Force Xóa TẤT CẢ
        </button>
      </div>

      <div style={{ 
        fontSize: '10px', 
        color: '#666', 
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px'
      }}>
        <strong>Lưu ý:</strong> Webhook cần được thiết lập để nhận thông báo real-time. 
        Đảm bảo các biến môi trường STRAVA_WEBHOOK_VERIFY_TOKEN đã được cấu hình.
      </div>
    </div>
  )
}
