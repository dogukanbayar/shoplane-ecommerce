import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, TrendingUp, Users, MousePointer, 
  Play, AlertTriangle, Target, BarChart3
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function AnalyticsDashboard() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    converted: null,
    hasRageClicks: null,
    hasErrors: null
  })

  useEffect(() => {
    fetchSessions()
    fetchInsights()
  }, [filters])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.converted !== null) params.append('converted', filters.converted)
      if (filters.hasRageClicks !== null) params.append('hasRageClicks', filters.hasRageClicks)
      if (filters.hasErrors !== null) params.append('hasErrors', filters.hasErrors)

      const response = await API.get(`/analytics/sessions?${params.toString()}`)
      setSessions(response.data.sessions)
    } catch (error) {
      toast.error('Sessions yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchInsights = async () => {
    try {
      const response = await API.get('/analytics/insights/home')
      setInsights(response.data.insights)
    } catch (error) {
      console.error('Insights error:', error)
    }
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <>
      <AdvancedSeo
        title="Analytics Dashboard - MyShop Admin"
        description="Kullanıcı davranış analizi, heatmaps ve session recordings"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center">
                <Activity size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-dark-text">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Kullanıcı Davranış Analizi
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/analytics/heatmaps')}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:shadow-xl transition"
              >
                🔥 Heatmaps
              </button>
              <button
                onClick={() => navigate('/admin/analytics/insights')}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition"
              >
                💡 Insights
              </button>
            </div>
          </div>

          {/* Insights Cards */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <InsightCard
                icon={Users}
                label="Avg Session Duration"
                value={formatDuration(Math.round(insights.avgDuration))}
                color="from-blue-600 to-cyan-600"
              />
              <InsightCard
                icon={Target}
                label="Conversion Rate"
                value={`${insights.conversionRate.toFixed(2)}%`}
                color="from-green-600 to-emerald-600"
              />
              <InsightCard
                icon={AlertTriangle}
                label="Error Rate"
                value={`${insights.errorRate.toFixed(2)}%`}
                color="from-red-600 to-orange-600"
              />
              <InsightCard
                icon={MousePointer}
                label="Top Clicks"
                value={insights.topClicks.length}
                color="from-purple-600 to-pink-600"
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilters({ ...filters, converted: filters.converted === true ? null : true })}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filters.converted === true
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border'
              }`}
            >
              ✅ Converted
            </button>
            <button
              onClick={() => setFilters({ ...filters, hasRageClicks: filters.hasRageClicks === true ? null : true })}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filters.hasRageClicks === true
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border'
              }`}
            >
              😤 Rage Clicks
            </button>
            <button
              onClick={() => setFilters({ ...filters, hasErrors: filters.hasErrors === true ? null : true })}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filters.hasErrors === true
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border'
              }`}
            >
              ⚠️ Has Errors
            </button>
          </div>

          {/* Sessions List */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b dark:border-dark-border">
              <h2 className="text-xl font-bold dark:text-dark-text">
                Sessions ({sessions.length})
              </h2>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={64} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Session bulunamadı
                </p>
              </div>
            ) : (
              <div className="divide-y dark:divide-dark-border">
                {sessions.map((session) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-dark-hover transition cursor-pointer"
                    onClick={() => navigate(`/admin/analytics/session/${session.sessionId}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold dark:text-dark-text">
                            {session.user?.name || 'Misafir Kullanıcı'}
                          </h3>
                          <div className="flex gap-2">
                            {session.converted && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">
                                ✅ Converted
                              </span>
                            )}
                            {session.hasRageClicks && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">
                                😤 Rage
                              </span>
                            )}
                            {session.hasErrors && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs font-bold">
                                ⚠️ Errors
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>⏱️ {formatDuration(session.duration)}</span>
                          <span>📄 {session.pages.length} sayfalar</span>
                          <span>🎬 {session.events.length} events</span>
                          <span>💻 {session.device?.deviceType}</span>
                          <span>📅 {new Date(session.startTime).toLocaleString('tr-TR')}</span>
                        </div>

                        {session.conversionValue > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-green-600">
                              💰 Conversion Value: {session.conversionValue.toFixed(2)}₺
                            </span>
                          </div>
                        )}
                      </div>

                      <button className="p-3 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition">
                        <Play size={24} className="text-blue-600" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Drop-off Points */}
          {insights && insights.dropOffPoints && insights.dropOffPoints.length > 0 && (
            <div className="mt-8 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-dark-text">
                Drop-off Points
              </h2>
              <div className="space-y-3">
                {insights.dropOffPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold dark:text-dark-text">{point.url}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {point.visitors} ziyaretçi
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {point.dropOffRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        drop-off rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Insight Card Component
function InsightCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold mb-1 dark:text-dark-text">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  )
}

export default AnalyticsDashboard
