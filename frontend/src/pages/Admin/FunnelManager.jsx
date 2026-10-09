import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Plus, TrendingDown, BarChart3, Eye, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function FunnelManager() {
  const navigate = useNavigate()
  const [funnels, setFunnels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFunnels()
  }, [])

  const fetchFunnels = async () => {
    try {
      setLoading(true)
      const response = await API.get('/funnels')
      setFunnels(response.data.funnels)
    } catch (error) {
      toast.error('Funnels yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Funnel silinecek. Emin misiniz?')) return

    try {
      await API.delete(`/funnels/${id}`)
      toast.success('Funnel silindi')
      fetchFunnels()
    } catch (error) {
      toast.error('Silme başarısız')
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
        title="Conversion Funnels - MyShop Admin"
        description="Dönüşüm hunisi analizi ve optimizasyonu"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Filter size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-dark-text">
                  Conversion Funnels
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Dönüşüm Hunisi Analizi
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/funnels/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition"
            >
              <Plus size={20} />
              Yeni Funnel
            </button>
          </div>

          {/* Funnels List */}
          {funnels.length === 0 ? (
            <div className="text-center py-12">
              <Filter size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
                Henüz Funnel Yok
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlk dönüşüm huninizi oluşturun!
              </p>
              <button
                onClick={() => navigate('/admin/funnels/create')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition"
              >
                Funnel Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {funnels.map((funnel, index) => (
                <motion.div
                  key={funnel._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 border-b dark:border-dark-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
                          {funnel.name}
                        </h3>
                        {funnel.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {funnel.description}
                          </p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        funnel.isActive
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {funnel.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                        <p className="text-2xl font-bold dark:text-dark-text">
                          {funnel.analytics?.totalSessions || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Sessions
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {funnel.analytics?.completedSessions || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Completed
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {funnel.analytics?.conversionRate?.toFixed(1) || 0}%
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Conv. Rate
                        </p>
                      </div>
                    </div>

                    {/* Steps Preview */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2 dark:text-dark-text">
                        Steps ({funnel.steps.length}):
                      </p>
                      <div className="space-y-1">
                        {funnel.steps.slice(0, 3).map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="truncate">{step.name}</span>
                          </div>
                        ))}
                        {funnel.steps.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                            +{funnel.steps.length - 3} more...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/funnels/${funnel._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        <BarChart3 size={18} />
                        Analytics
                      </button>
                      <button
                        onClick={() => navigate(`/admin/funnels/${funnel._id}/sessions`)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-dark-border rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-dark-hover transition"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(funnel._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default FunnelManager
