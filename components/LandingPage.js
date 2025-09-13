'use client'

import { useEffect, useState } from 'react'
import StravaConnect from './StravaConnect'

export default function LandingPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('stats')

  // If tab=profile is provided, honor it; otherwise, default to /stats
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'profile') {
      setActiveTab('profile')
      return
    }
    // Default behavior: go to stats page
    window.location.href = '/stats'
  }, [])

  

  const renderProfile = () => (
    <div className="landing-content">
      <h2 className="section-title">Thông tin cá nhân</h2>
      <div className="profile-card">
        <div className="profile-avatar">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h3 className="profile-name">
            {user.user_metadata?.full_name || user.user_metadata?.name || 'Thành viên'}
          </h3>
          <p className="profile-email">{user.email}</p>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-label">Tham gia:</span>
              <span className="stat-value">3 môn thể thao</span>
            </div>
            <div className="profile-stat">
              <span className="stat-label">Sự kiện:</span>
              <span className="stat-value">12 sự kiện</span>
            </div>
            <div className="profile-stat">
              <span className="stat-label">Điểm số:</span>
              <span className="stat-value">1,250 điểm</span>
            </div>
          </div>
        </div>
      </div>
      <StravaConnect user={user} />
    </div>
  )

  const renderStats = () => (
    <div className="landing-content">
      <h2 className="section-title">Thống kê vận động viên</h2>
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Xem thống kê chi tiết về các hoạt động của vận động viên
        </p>
        <button 
          onClick={() => window.location.href = '/stats'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📊 Xem thống kê chi tiết
        </button>
      </div>
    </div>
  )

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏆</span>
            <span className="logo-text">GeminiSport</span>
          </div>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => { window.location.href = '/stats' }}
            >
              Thống kê
            </button>
            {user.email === 'rongcatlinh@gmail.com' && (
              <button 
                className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Hồ sơ
              </button>
            )}
          </nav>
          <div className="user-menu">
            <span className="user-name">
              Xin chào, {user.user_metadata?.full_name?.split(' ')[0] || 'Thành viên'}!
            </span>
            <button className="logout-btn" onClick={onLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        {activeTab === 'profile' && renderProfile()}
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2024 GeminiSport. Tất cả quyền được bảo lưu.</p>
          <div className="footer-links">
            <a href="#">Liên hệ</a>
            <a href="#">Điều khoản</a>
            <a href="#">Bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
