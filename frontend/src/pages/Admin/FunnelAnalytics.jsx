import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingDown, AlertTriangle, Users, Activity } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import FunnelVisualization from '../../components/funnel/FunnelVisualization'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function FunnelAnalytics() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [funnel, setFunnel] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [dropOffPoints, setDropOffPoints] = useState([])
  const [conversionPaths, setConversionPaths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [analyticsRes, dropOffRes, pathsRes] = await Promise.all([
        API.get(`/funnels/${id}/analytics`),
        API.get(`/funnels/${id}/dropoff`),
        API.get(`/funnels/${id}/paths?limit=5`)
      ])

      setFunnel(analyticsRes.data.funnel)
      setAnalytics(analyticsRes.data.analytics)
      setDropOffPoints(dropOffRes.data.dropOffPoints)
      setConversionPaths(pathsRes.data.paths)
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

  if (!funnel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Funnel bulunamadı</p>
      </div>
    )
  }

  return (
    <>
      <AdvancedSeo
        title={`${funnel.name} - Analytics`}
        description="Funnel analytics ve dönüşüm analizi"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/funnels')}
              className="p-3 hover:bg-gray-200 dark:hover:bg-dark-hover rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold dark:text-dark-text">
                {funnel.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {funnel.description}
              </p>
            </div>
          </div>

          {/* Funnel Visualization */}
          <FunnelVisualization funnel={funnel} analytics={analytics} />

          {/* Drop-off Points */}
          {dropOffPoints.length > 0 && (
            <div className="mt-8 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-dark-text">
                <AlertTriangle size={24} className="text-red-600" />
                Drop-off Points
              </h2>

              <div className="space-y-4">
                {dropOffPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg dark:text-dark-text">
                          {point.stepName} → {point.nextStepName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Step {point.stepIndex + 1} → {point.stepIndex + 2}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-red-600">
                          {point.dropOffRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {point.dropOffCount} users
                        </p>
                      </div>
                    </div>

                    {point.sampleSessions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                          Sample Sessions:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {point.sampleSessions.map((session, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 bg-white dark:bg-dark-card rounded text-xs"
                            >
                              {session.user?.name || 'Guest'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion Paths */}
          {conversionPaths.length > 0 && (
            <div className="mt-8 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-dark-text">
                <Activity size={24} className="text-green-600" />
                Successful Conversion Paths
              </h2>

              <div className="space-y-4">
                {conversionPaths.map((path, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold dark:text-dark-text">
                          {path.user?.name || 'Guest User'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Session: {path.sessionId.substring(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {path.totalTime}
                        </p>
                        {path.conversionValue > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {path.conversionValue.toFixed(2)}₺
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                      {path.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-white dark:bg-dark-card rounded-lg whitespace-nowrap">
                            <p className="text-xs font-semibold dark:text-dark-text">
                              {step.stepName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {step.timeSpent}
                            </p>
                          </div>
                          {idx < path.steps.length - 1 && (
                            <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                          )}
                        </div>
                      ))}
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

export default FunnelAnalytics