import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FlaskConical, Plus, Play, Pause, CheckCircle,
  TrendingUp, Users, Target, BarChart3, Edit, Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function ExperimentManager() {
  const navigate = useNavigate()
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchExperiments()
  }, [filter])

  const fetchExperiments = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const response = await API.get(`/experiments${params}`)
      setExperiments(response.data.experiments)
    } catch (error) {
      toast.error('Experiments yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (id) => {
    try {
      await API.post(`/experiments/${id}/start`)
      toast.success('Experiment başlatıldı')
      fetchExperiments()
    } catch (error) {
      toast.error('Başlatma başarısız')
    }
  }

  const handlePause = async (id) => {
    try {
      await API.post(`/experiments/${id}/pause`)
      toast.success('Experiment duraklatıldı')
      fetchExperiments()
    } catch (error) {
      toast.error('Duraklat başarısız')
    }
  }

  const handleComplete = async (id) => {
    if (!confirm('Experiment tamamlanacak. Emin misiniz?')) return

    try {
      await API.post(`/experiments/${id}/complete`)
      toast.success('Experiment tamamlandı')
      fetchExperiments()
    } catch (error) {
      toast.error('Tamamlama başarısız')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Experiment silinecek. Emin misiniz?')) return

    try {
      await API.delete(`/experiments/${id}`)
      toast.success('Experiment silindi')
      fetchExperiments()
    } catch (error) {
      toast.error('Silme başarısız')
    }
  }

  const statusConfig = {
    draft: {
      color: 'bg-gray-500',
      text: 'Taslak',
      icon: Edit
    },
    running: {
      color: 'bg-green-500',
      text: 'Çalışıyor',
      icon: Play
    },
    paused: {
      color: 'bg-yellow-500',
      text: 'Duraklatıldı',
      icon: Pause
    },
    completed: {
      color: 'bg-blue-500',
      text: 'Tamamlandı',
      icon: CheckCircle
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
        title="A/B Test Manager - MyShop Admin"
        description="A/B testleri yönetin, conversion optimizasyonu yapın"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <FlaskConical size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-dark-text">
                  A/B Test Manager
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Conversion Optimizasyonu
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/experiments/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition"
            >
              <Plus size={20} />
              Yeni Experiment
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'running', label: 'Çalışanlar' },
              { id: 'draft', label: 'Taslaklar' },
              { id: 'completed', label: 'Tamamlananlar' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === f.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-hover dark:text-dark-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Experiments List */}
          {experiments.length === 0 ? (
            <div className="text-center py-12">
              <FlaskConical size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
                Henüz Experiment Yok
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlk A/B testinizi oluşturun!
              </p>
              <button
                onClick={() => navigate('/admin/experiments/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition"
              >
                Experiment Oluştur
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {experiments.map((experiment) => {
                const status = statusConfig[experiment.status]
                const StatusIcon = status.icon
                const totalImpressions = experiment.variants.reduce((sum, v) => sum + v.stats.impressions, 0)
                const totalConversions = experiment.variants.reduce((sum, v) => sum + v.stats.conversions, 0)
                const overallCR = totalImpressions > 0 ? (totalConversions / totalImpressions * 100).toFixed(2) : 0

                return (
                  <motion.div
                    key={experiment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-6 border-b dark:border-dark-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold dark:text-dark-text">
                              {experiment.name}
                            </h3>
                            <div className={`${status.color} px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1`}>
                              <StatusIcon size={14} />
                              {status.text}
                            </div>
                          </div>
                          {experiment.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {experiment.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>🎯 {experiment.targetPage}</span>
                            <span>📊 {experiment.type.toUpperCase()}</span>
                            <span>👥 {totalImpressions.toLocaleString()} impressions</span>
                            {experiment.results?.winner && (
                              <span className="text-green-600 font-bold">
                                ✅ Winner: {experiment.results.winner}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {experiment.status === 'draft' && (
                            <button
                              onClick={() => handleStart(experiment._id)}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              title="Başlat"
                            >
                              <Play size={18} />
                            </button>
                          )}
                          {experiment.status === 'running' && (
                            <>
                              <button
                                onClick={() => handlePause(experiment._id)}
                                className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                                title="Duraklat"
                              >
                                <Pause size={18} />
                              </button>
                              <button
                                onClick={() => handleComplete(experiment._id)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                title="Tamamla"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </>
                          )}
                          {experiment.status === 'paused' && (
                            <button
                              onClick={() => handleStart(experiment._id)}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              title="Devam Ettir"
                            >
                              <Play size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/experiments/${experiment._id}`)}
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            title="Detaylar"
                          >
                            <BarChart3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(experiment._id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Variants */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {experiment.variants.map((variant) => {
                          const cr = variant.stats.impressions > 0 
                            ? (variant.stats.conversions / variant.stats.impressions * 100).toFixed(2)
                            : 0

                          return (
                            <div
                              key={variant.name}
                              className={`p-4 rounded-xl border-2 ${
                                variant.isControl
                                  ? 'border-gray-400 bg-gray-50 dark:bg-gray-900'
                                  : 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold dark:text-dark-text">
                                  {variant.name}
                                  {variant.isControl && (
                                    <span className="ml-2 text-xs bg-gray-600 text-white px-2 py-1 rounded">
                                      CONTROL
                                    </span>
                                  )}
                                </h4>
                                {experiment.results?.winner === variant.name && (
                                  <span className="text-2xl">🏆</span>
                                )}
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Traffic:</span>
                                  <span className="font-bold dark:text-dark-text">{variant.traffic}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Impressions:</span>
                                  <span className="font-bold dark:text-dark-text">
                                    {variant.stats.impressions.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Conversions:</span>
                                  <span className="font-bold dark:text-dark-text">
                                    {variant.stats.conversions.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t dark:border-dark-border">
                                  <span className="text-gray-600 dark:text-gray-400">Conv. Rate:</span>
                                  <span className="font-bold text-purple-600 text-lg">
                                    {cr}%
                                  </span>
                                </div>
                                {variant.stats.revenue > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                                    <span className="font-bold text-green-600">
                                      {variant.stats.revenue.toFixed(2)}₺
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Overall Stats */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-900">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Total Impressions
                            </p>
                            <p className="text-2xl font-bold dark:text-dark-text">
                              {totalImpressions.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Total Conversions
                            </p>
                            <p className="text-2xl font-bold dark:text-dark-text">
                              {totalConversions.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Overall CR
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                              {overallCR}%
                            </p>
                          </div>
                        </div>

                        {experiment.results?.uplift && (
                          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-900 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Improvement
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                              +{experiment.results.uplift}%
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Confidence: {experiment.results.confidence?.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ExperimentManager