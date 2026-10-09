import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Map, TrendingUp, Users, Target, 
  Activity, ArrowRight, AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function JourneyAnalytics() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [patterns, setPatterns] = useState(null)
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [statsRes, patternsRes, journeysRes] = await Promise.all([
        API.get('/journeys/stats'),
        API.post('/journeys/analyze', {}),
        API.get('/journeys?limit=10')
      ])

      setStats(statsRes.data.stats)
      setPatterns(patternsRes.data.patterns)
      setJourneys(journeysRes.data.journeys)
    } catch (error) {
      toast.error('Analytics yüklenemedi')
    } finally {
      setLoading(false)
    }
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
        title="Customer Journey Analytics - MyShop Admin"
        description="Müşteri yolculuk haritası ve touchpoint analizi"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Map size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-dark-text">
                  Customer Journey Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Müşteri Yolculuk Haritası Analizi
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/journeys/high-intent')}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition"
              >
                🎯 High Intent Users
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'patterns', label: 'Patterns', icon: TrendingUp },
              { id: 'journeys', label: 'Journeys', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border hover:border-indigo-500'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  label="Total Journeys"
                  value={stats.totalJourneys.toLocaleString()}
                  color="from-blue-600 to-cyan-600"
                />
                <StatCard
                  icon={Target}
                  label="Converted"
                  value={stats.convertedJourneys.toLocaleString()}
                  color="from-green-600 to-emerald-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Conversion Rate"
                  value={`${stats.overallConversionRate.toFixed(2)}%`}
                  color="from-purple-600 to-pink-600"
                />
                <StatCard
                  icon={Activity}
                  label="Active Journeys"
                  value={stats.byStatus.find(s => s._id === 'active')?.count || 0}
                  color="from-orange-600 to-red-600"
                />
              </div>

              {/* Stage Distribution */}
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-6 dark:text-dark-text">
                  Stage Distribution
                </h2>

                <div className="space-y-4">
                  {stats.stageDistribution.map((stage, index) => {
                    const total = stats.stageDistribution.reduce((sum, s) => sum + s.count, 0)
                    const percentage = (stage.count / total) * 100

                    const stageColors = {
                      awareness: 'from-blue-600 to-cyan-600',
                      consideration: 'from-purple-600 to-pink-600',
                      decision: 'from-orange-600 to-red-600',
                      purchase: 'from-green-600 to-emerald-600',
                      retention: 'from-yellow-600 to-orange-600',
                      advocacy: 'from-indigo-600 to-purple-600'
                    }

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold capitalize dark:text-dark-text">
                            {stage._id}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stage.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${stageColors[stage._id] || 'from-gray-600 to-gray-700'}`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-6 dark:text-dark-text">
                  Journey Status
                </h2>

                <div className="grid grid-cols-4 gap-4">
                  {stats.byStatus.map((status, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 dark:bg-dark-hover rounded-xl"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                        {status._id}
                      </p>
                      <p className="text-2xl font-bold mb-2 dark:text-dark-text">
                        {status.count}
                      </p>
                      <div className="space-y-1 text-xs">
                        <p className="text-gray-600 dark:text-gray-400">
                          Avg Engagement: {status.avgEngagement?.toFixed(1) || 0}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Avg Intent: {status.avgPurchaseIntent?.toFixed(1) || 0}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Avg Touchpoints: {status.avgTouchpoints?.toFixed(1) || 0}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Patterns Tab */}
          {activeTab === 'patterns' && patterns && (
            <div className="space-y-6">
              {/* Common Paths */}
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-6 dark:text-dark-text">
                  Most Common Paths
                </h2>

                <div className="space-y-3">
                  {patterns.commonPaths.map((path, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold dark:text-dark-text">
                          {path.path}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          {path.count}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          journeys
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Channel Performance */}
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-6 dark:text-dark-text">
                  Channel Performance
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-dark-border">
                        <th className="text-left py-3 px-4 font-semibold dark:text-dark-text">
                          Channel
                        </th>
                        <th className="text-right py-3 px-4 font-semibold dark:text-dark-text">
                          Touchpoints
                        </th>
                        <th className="text-right py-3 px-4 font-semibold dark:text-dark-text">
                          Conversions
                        </th>
                        <th className="text-right py-3 px-4 font-semibold dark:text-dark-text">
                          Conv. Rate
                        </th>
                        <th className="text-right py-3 px-4 font-semibold dark:text-dark-text">
                          Avg Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {patterns.channelPerformance
                        .sort((a, b) => b.conversionRate - a.conversionRate)
                        .map((channel, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover"
                          >
                            <td className="py-3 px-4 font-semibold capitalize dark:text-dark-text">
                              {channel.channel}
                            </td>
                            <td className="py-3 px-4 text-right dark:text-dark-text">
                              {channel.totalTouchpoints}
                            </td>
                            <td className="py-3 px-4 text-right dark:text-dark-text">
                              {channel.conversions}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-green-600">
                              {channel.conversionRate.toFixed(2)}%
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-purple-600">
                              {channel.avgRevenue.toFixed(2)}₺
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Time to Conversion */}
              {patterns.timeToConversion && (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-bold mb-6 dark:text-dark-text">
                    Time to Conversion
                  </h2>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Average
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatDuration(patterns.timeToConversion.average)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Median
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatDuration(patterns.timeToConversion.median)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Fastest
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatDuration(patterns.timeToConversion.min)}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Slowest
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatDuration(patterns.timeToConversion.max)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drop-off Points */}
              {patterns.dropOffPoints.length > 0 && (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-dark-text">
                    <AlertCircle size={24} className="text-red-600" />
                    Drop-off Points
                  </h2>

                  <div className="space-y-3">
                    {patterns.dropOffPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-lg dark:text-dark-text">
                            {point.transition}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-red-600">
                            {point.dropOffRate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {point.count} users
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Journeys Tab */}
          {activeTab === 'journeys' && (
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b dark:border-dark-border">
                <h2 className="text-xl font-bold dark:text-dark-text">
                  Recent Journeys
                </h2>
              </div>

              <div className="divide-y dark:divide-dark-border">
                {journeys.map((journey, index) => (
                  <motion.div
                    key={journey._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer transition"
                    onClick={() => navigate(`/admin/journeys/${journey.journeyId}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold dark:text-dark-text">
                            {journey.user?.name || 'Guest User'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            journey.status === 'converted' 
                              ? 'bg-green-100 text-green-600'
                              : journey.status === 'active'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {journey.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Stage: {journey.currentStage}</span>
                          <span>•</span>
                          <span>{journey.metrics.totalTouchpoints} touchpoints</span>
                          <span>•</span>
                          <span>Engagement: {journey.metrics.engagementScore}/100</span>
                          <span>•</span>
                          <span>Intent: {journey.metrics.purchaseIntent}/100</span>
                        </div>
                      </div>

                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card rounded-xl shadow-xl p-6"
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

const formatDuration = (seconds) => {
  if (!seconds) return '0s'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default JourneyAnalytics
