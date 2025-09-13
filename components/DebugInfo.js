'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const gatherDebugInfo = async () => {
      try {
        const session = await supabase.auth.getSession()
        const token = session?.data?.session?.access_token
        const user = session?.data?.session?.user

        // Test status API
        let statusResult = null
        try {
          const statusRes = await fetch(`/api/strava/status?sb=${encodeURIComponent(token || '')}`)
          statusResult = await statusRes.json()
        } catch (e) {
          statusResult = { error: e.message }
        }

        setDebugInfo({
          session: {
            hasSession: !!session?.data?.session,
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
            hasUser: !!user,
            userEmail: user?.email || 'null',
            userId: user?.id || 'null'
          },
          statusApi: statusResult,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        setDebugInfo({
          error: error.message,
          timestamp: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    gatherDebugInfo()
  }, [])

  if (loading) {
    return <div style={{ padding: '10px', backgroundColor: '#f0f0f0', margin: '10px 0' }}>Loading debug info...</div>
  }

  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '5px', 
      margin: '10px 0',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🐛 Debug Information</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Session Info:</strong>
        <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(debugInfo.session, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Status API Result:</strong>
        <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(debugInfo.statusApi, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Timestamp:</strong> {debugInfo.timestamp}
      </div>

      {debugInfo.error && (
        <div style={{ color: 'red' }}>
          <strong>Error:</strong> {debugInfo.error}
        </div>
      )}
    </div>
  )
}

