'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AthleteStats() {
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [athleteActivities, setAthleteActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  const mapActivityTypeToIcon = (type) => {
    const t = String(type || '').toLowerCase()
    if (t.includes('run')) return '🏃'
    if (t.includes('ride') || t.includes('bike')) return '🚴'
    if (t.includes('swim')) return '🏊'
    if (t.includes('walk')) return '🚶'
    if (t.includes('hike')) return '🥾'
    if (t.includes('row')) return '🚣'
    if (t.includes('ski')) return '⛷️'
    if (t.includes('yoga')) return '🧘'
    if (t.includes('workout') || t.includes('gym')) return '💪'
    return '🏅'
  }

  const calculatePace = (activity) => {
    const distance = Number(activity?.distance_km)
    const minutes = Number(activity?.duration_minutes)
    if (!distance || distance <= 0) return null
    return Number((minutes / distance).toFixed(1))
  }

  useEffect(() => {
    loadAthleteStats()
  }, [])


  const loadAthleteStats = async () => {
    setLoading(true)
    setError('')
    
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      const res = await fetch(`/api/strava/athlete-stats?sb=${encodeURIComponent(token || '')}`)
      const json = await res.json()
      
      if (json.error) {
        setError(json.error)
      } else {
        const list = json.athletes || []
        setAthletes(list)
      }
    } catch (error) {
      console.error('Error loading athlete stats:', error)
      setError(`Lỗi kết nối: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadAthleteActivities = async (athleteId) => {
    setLoadingActivities(true)
    setSelectedAthlete(athleteId)
    
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      
      const res = await fetch(`/api/strava/athlete-activities?sb=${encodeURIComponent(token || '')}&athlete_id=${athleteId}`)
      const json = await res.json()
      
      if (json.error) {
        setError(json.error)
      } else {
        setAthleteActivities(json.activities || [])
      }
    } catch (error) {
      console.error('Error loading athlete activities:', error)
      setError(`Lỗi kết nối: ${error.message}`)
    } finally {
      setLoadingActivities(false)
    }
  }

  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
  }

  const parseViDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null
    const parts = dateStr.split('/')
    if (parts.length !== 3) return null
    const day = Number(parts[0])
    const month = Number(parts[1])
    const year = Number(parts[2])
    if (!day || !month || !year) return null
    return new Date(year, month - 1, day)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-black text-base font-medium">Đang tải thống kê vận động viên...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-danger-500 text-5xl mb-4">⚠️</div>
          <p className="text-danger-700 text-base font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header removed per request */}
        
        {/* Legend */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-base font-semibold text-black mb-4">Chú thích</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <span className="text-black">Thành tích xuất sắc (≥100km/tháng hoặc ≥1000km tổng)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 bg-danger-500 rounded-full"></span>
              <span className="text-black">Tháng cần cải thiện (&lt;100km)</span>
            </div>
          </div>
        </div>
        
        {athletes.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-black mb-1">Không có dữ liệu vận động viên</h3>
            <p className="text-black/70 text-sm">Hãy kết nối Strava và đồng bộ dữ liệu để xem thống kê</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-600 to-primary-700">
                  <tr>
                    <th className="px-4 py-4 text-left text-white font-semibold min-w-[20px]">
                      Mã vận động viên
                    </th>
                    <th className="px-4 py-4 text-left text-white font-semibold min-w-[50px]">
                      Tên vận động viên
                    </th>
                    {Array.from({ length: 3 }, (_, i) => {
                      const date = new Date()
                      date.setMonth(date.getMonth() - (2 - i))
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                      return (
                        <th key={monthKey} className="px-3 py-4 text-center text-white font-semibold min-w-[80px] text-xs">
                          {formatMonthName(monthKey)}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((athlete, idx) => (
                    <tr 
                      key={athlete.athlete_id} 
                      className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => loadAthleteActivities(athlete.athlete_id)}
                    >
                      <td className="px-2 py-4 border-r border-gray-200 text-black">
                        {athlete.athlete_id}
                      </td>
                      <td className="px-2 py-4 border-r border-gray-200 text-black">
                        {athlete.athlete_name}
                      </td>
                      {athlete.monthly_data.map((month, monthIdx) => (
                        <td 
                          key={monthIdx} 
                          className={`px-3 py-4 text-center border-r border-gray-200 ${
                            month.isLow ? 'text-danger-600 font-semibold' : 'text-black'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {month.distance >= 100 && (
                              <span className="text-sm">🏆</span>
                            )}
                            <span>{month.distance.toFixed(1)} km</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({month.activities} hoạt động)
                          </div>
                        </td>
                      ))}
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Athlete Activities Modal */}
        {selectedAthlete && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setSelectedAthlete(null)
              setAthleteActivities([])
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  🏃‍♂️ Bảng chi tiết hoạt động - Vận động viên {selectedAthlete}
                </h3>
                <button
                  onClick={() => {
                    setSelectedAthlete(null)
                    setAthleteActivities([])
                  }}
                  className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
            
                {loadingActivities ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mr-3"></div>
                    <span className="text-black">Đang tải chi tiết hoạt động...</span>
                  </div>
                ) : athleteActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🏃‍♂️</div>
                    <h4 className="text-lg font-semibold text-black mb-1">Không có hoạt động</h4>
                    <p className="text-black/70 text-sm">Vận động viên này chưa có hoạt động nào trong 2 tháng gần nhất</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-auto">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-3 text-center text-black font-semibold border-b border-gray-300 w-[4ch] max-w-[4ch]">
                            STT
                          </th>
                          <th className="px-3 py-3 text-left text-black font-semibold border-b border-gray-300 w-[5ch] max-w-[5ch] whitespace-nowrap">
                            <span className="block truncate">Mã HĐ</span>
                          </th>
                          <th className="px-3 py-3 text-left text-black font-semibold border-b border-gray-300 w-[5ch] max-w-[5ch] whitespace-nowrap">
                            <span className="block truncate">Tên HĐ</span>
                          </th>
                          <th className="px-3 py-3 text-right text-black font-semibold border-b border-gray-300 whitespace-nowrap w-[7ch] max-w-[7ch]">
                            Số km
                          </th>
                          <th className="px-3 py-3 text-right text-black font-semibold border-b border-gray-300 whitespace-nowrap w-[6ch] max-w-[6ch]">
                            Pace
                          </th>
                          <th className="px-3 py-3 text-right text-black font-semibold border-b border-gray-300 whitespace-nowrap w-[4ch] max-w-[4ch]">
                            Số phút
                          </th>
                          <th className="px-3 py-3 text-left text-black font-semibold border-b border-gray-300 whitespace-nowrap">
                            <span className="inline-block w-[6ch]">Ngày</span>
                          </th>
                          <th className="px-3 py-3 text-left text-black font-semibold border-b border-gray-300 w-[5ch] max-w-[5ch] whitespace-nowrap">
                            <span className="block truncate">Loại</span>
                          </th>
                          <th className="px-3 py-3 text-center text-black font-semibold border-b border-gray-300 w-[4ch] max-w-[4ch] whitespace-nowrap">
                            <span className="block truncate">TT</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {athleteActivities.map((activity, idx) => {
                          const pace = calculatePace(activity)
                          const isInvalid = activity.is_valid === false
                          return (
                          <tr 
                            key={idx} 
                            className={`transition-colors duration-200 ${
                              isInvalid ? 'bg-red-50' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')
                            }`}
                          >
                            <td className={`px-3 py-3 text-center border-r border-gray-200 font-semibold w-[4ch] max-w-[4ch] ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              {idx + 1}
                            </td>
                            <td className={`px-3 py-3 border-r border-gray-200 font-mono text-sm whitespace-nowrap ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              {activity.strava_activity_id}
                            </td>
                            <td className={`px-3 py-3 border-r border-gray-200 ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              {activity.name}
                            </td>
                            <td className={`px-3 py-3 border-r border-gray-200 text-right whitespace-nowrap w-[7ch] max-w-[7ch] ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              <span className="inline-block w-full text-right">{activity.distance_km}</span>
                            </td>
                            <td className={`px-3 py-3 border-r border-gray-200 text-right whitespace-nowrap w-[6ch] max-w-[6ch] ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              {pace !== null ? pace.toFixed(1) : '-'}
                            </td>
                          
                            <td className={`px-3 py-3 border-r border-gray-200 text-right whitespace-nowrap w-[8ch] max-w-[8ch] ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              <span className="inline-block w-full text-right">{activity.duration_minutes}</span>
                            </td>
                            <td className={`px-3 py-3 border-r border-gray-200 whitespace-nowrap w-[12ch] max-w-[12ch] ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              <span className="inline-block w-full">{activity.activity_date}</span>
                            </td>
                            <td className={`px-3 py-3 whitespace-nowrap w-[5ch] max-w-[5ch] text-center ${isInvalid ? 'text-red-600' : 'text-black'}`}>
                              <span title={activity.activity_type}>{mapActivityTypeToIcon(activity.activity_type)}</span>
                            </td>
                            <td className="px-3 py-3 text-center border-r border-gray-200 w-[4ch] max-w-[4ch]">
                              {isInvalid ? (
                                <span 
                                  className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full"
                                  title="Hoạt động không hợp lệ"
                                >
                                  ✕
                                </span>
                              ) : (
                                <span 
                                  className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full"
                                  title="Hoạt động hợp lệ"
                                >
                                  ✓
                                </span>
                              )}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
