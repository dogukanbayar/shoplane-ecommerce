import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, ArrowLeft, TrendingUp, Eye, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function HighIntentUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [minIntent, setMinIntent] = useState(70)

  useEffect(() => {
    fetchUsers()
  }, [minIntent])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await API.get(`/journeys/high-intent?minIntent=${minIntent}`)
      setUsers(response.data.users)
    } catch (error) {
      toast.error('Users yüklenemedi')
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
        title="High Intent Users - MyShop Admin"
        description="Yüksek satın alma niyetli kullanıcılar"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/journeys')}
              className="p-3 hover:bg-gray-200 dark:hover:bg-dark-hover rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Target size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-dark-text">
                  High Intent Users
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Satın alma niyeti yüksek kullanıcılar
                </p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 mb-6 shadow-xl">
            <div className="flex items-center gap-4">
              <label className="font-semibold dark:text-dark-text">
                Min Purchase Intent:
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={minIntent}
                onChange={(e) => setMinIntent(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-green-600">
                {minIntent}+
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total High Intent
              </p>
              <p className="text-3xl font-bold text-green-600">
                {users.length}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg Purchase Intent
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {users.length > 0 
                  ? (users.reduce((sum, u) => sum + u.purchaseIntent, 0) / users.length).toFixed(1)
                  : 0
                }
              </p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg Engagement
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {users.length > 0
                  ? (users.reduce((sum, u) => sum + u.engagementScore, 0) / users.length).toFixed(1)
                  : 0
                }
              </p>
            </div>
          </div>

          {/* Users List */}
          {users.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-2xl shadow-xl">
              <Target size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                No high intent users found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.journeyId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold dark:text-dark-text">
                            {user.user?.name || 'Guest User'}
                          </h3>
                          {user.user?.email && (
                            <a
                              href={`mailto:${user.user.email}`}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <Mail size={14} />
                              {user.user.email}
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">Stage: {user.currentStage}</span>
                          <span>•</span>
                          <span>Last Active: {new Date(user.lastActivity).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/admin/journeys/${user.journeyId}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Journey
                        </button>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Purchase Intent
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                              style={{ width: `${user.purchaseIntent}%` }}
                            />
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {user.purchaseIntent}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Engagement Score
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                              style={{ width: `${user.engagementScore}%` }}
                            />
                          </div>
                          <span className="text-2xl font-bold text-purple-600">
                            {user.engagementScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Viewed Products */}
                    {user.viewedProducts && user.viewedProducts.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-3 dark:text-dark-text">
                          Recently Viewed Products:
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                          {user.viewedProducts.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border transition"
                              onClick={() => navigate(`/products/${item.product._id}`)}
                            >
                              <img
                                src={item.product.images?.[0]}
                                alt={item.product.name}
                                className="w-full aspect-square object-cover rounded-lg mb-2"
                              />
                              <p className="text-xs font-semibold truncate dark:text-dark-text">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {item.viewCount} views
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        💡 Recommended Actions:
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {user.purchaseIntent > 85 && (
                          <li>• Send personalized discount code</li>
                        )}
                        {user.currentStage === 'decision' && (
                          <li>• Trigger abandoned cart email</li>
                        )}
                        {user.viewedProducts.length > 3 && (
                          <li>• Show product comparison</li>
                        )}
                        {user.engagementScore > 80 && (
                          <li>• Offer live chat assistance</li>
                        )}
                      </ul>
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

export default HighIntentUsers